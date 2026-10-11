import { capturePool } from '@/db/capturePool'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { recordCapture } from './recordCapture'

/** The oldest undrained capture is the earliest instant, not the smallest
 * string. The two probes are dated before any real capture so the answer is
 * theirs whatever else the database holds; lexically the `Z` one is smaller,
 * chronologically the `+02:00` one is half an hour older.
 *
 * `countUndrainedCaptures` is imported inside the test so a skipped suite does
 * not load it and charge its lines to the coverage ratchet.
 *
 * Run with: env $(grep -v '^#' .env.local | xargs) pnpm test */
const configured = (process.env['DB_NAME'] ?? '') !== ''

describe.skipIf(!configured)(
  'countUndrainedCaptures against a real database',
  () => {
    const clean = async () =>
      capturePool().execute(
        'DELETE FROM captures WHERE normalized_url LIKE ?',
        ['https://count-probe.invalid/%'],
      )

    beforeEach(clean)
    afterAll(async () => {
      await clean()
      await capturePool().end()
    })

    it('reports the earliest instant in UTC across mixed offsets', async () => {
      await recordCapture({
        url: 'https://count-probe.invalid/z',
        note: null,
        captureSource: 'test',
        capturedAt: '2000-01-01T23:00:00Z',
      })
      await recordCapture({
        url: 'https://count-probe.invalid/offset',
        note: null,
        captureSource: 'test',
        capturedAt: '2000-01-02T00:30:00+02:00',
      })
      const { countUndrainedCaptures } =
        await import('./countUndrainedCaptures')
      const counted = await countUndrainedCaptures()
      expect(counted.count).toBeGreaterThanOrEqual(2)
      expect(counted.oldestAt).toBe('2000-01-01T22:30:00.000Z')
    })
  },
)
