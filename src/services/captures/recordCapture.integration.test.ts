import { capturePool } from '@/services/db/capturePool'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { recordCapture } from './recordCapture'

/** Runs only when a database is configured, because what it guards cannot be
 * observed without one.
 *
 * The bug it exists for: `recordCapture` first decided whether a capture was
 * new by reading `affectedRows` from the upsert, and against MySQL 9.7 through
 * mysql2 that is 1 for both a fresh insert and an absorbed duplicate - the
 * driver connects with `CLIENT_FOUND_ROWS`, so it counts matched rows. The row
 * was always correct; the response said `already_captured: false` for a URL it
 * had just deduped. No unit test can see that, because the wrong value comes
 * from the driver.
 *
 * Run with: env $(grep -v '^#' .env.local | xargs) pnpm test */
const configured = (process.env.DB_NAME ?? '') !== ''

describe.skipIf(!configured)('recordCapture against a real database', () => {
  const url = 'https://example.invalid/dedup-probe'

  beforeEach(async () => {
    await capturePool().execute(
      'DELETE FROM captures WHERE normalized_url LIKE ?',
      ['https://example.invalid/%'],
    )
  })

  afterAll(async () => {
    await capturePool().execute(
      'DELETE FROM captures WHERE normalized_url LIKE ?',
      ['https://example.invalid/%'],
    )
    await capturePool().end()
  })

  const input = (value: string, note: string | null) => ({
    url: value,
    note,
    captureSource: 'test',
    capturedAt: '2026-08-04T00:00:00+02:00',
  })

  it('reports a fresh URL as new', async () => {
    const first = await recordCapture(input(url, 'first'))
    expect(first.alreadyCaptured).toBe(false)
  })

  it('reports the second capture of the same article as already captured, with the first id', async () => {
    const first = await recordCapture(input(url, 'first'))
    const second = await recordCapture(
      input(`https://Example.invalid/Dedup-Probe/?source=rss----x`, 'second'),
    )
    expect(second.alreadyCaptured).toBe(true)
    expect(second.captureId).toBe(first.captureId)
  })

  it('keeps the first capture rather than overwriting it', async () => {
    await recordCapture(input(url, 'first'))
    await recordCapture(input(`${url}?utm=x`, 'second'))
    const [rows] = await capturePool().query(
      'SELECT note FROM captures WHERE normalized_url = ?',
      [url],
    )
    expect(rows as { note: string }[]).toStrictEqual([{ note: 'first' }])
  })
})
