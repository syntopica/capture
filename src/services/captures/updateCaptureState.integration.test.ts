import { capturePool } from '@/db/capturePool'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { findCaptureByUrl } from './findCaptureByUrl'
import { recordCapture } from './recordCapture'
import { updateCaptureState } from './updateCaptureState'

/** Runs only when a database is configured, because what it guards cannot be
 * observed without one: the COALESCE update, and the fact that a row matched
 * but unchanged still reports `affectedRows: 1` through mysql2.
 *
 * Run with: env $(grep -v '^#' .env.local | xargs) pnpm test */
const configured = (process.env.DB_NAME ?? '') !== ''

describe.skipIf(!configured)(
  'updateCaptureState against a real database',
  () => {
    const url = 'https://example.invalid/state-probe'

    const clean = async () =>
      capturePool().execute(
        'DELETE FROM captures WHERE normalized_url LIKE ?',
        ['https://example.invalid/%'],
      )

    beforeEach(clean)
    afterAll(async () => {
      await clean()
      await capturePool().end()
    })

    const record = async () =>
      recordCapture({
        url,
        note: null,
        captureSource: 'test',
        capturedAt: '2026-08-04T00:00:00+02:00',
      })

    it('stores the state and the clip directory', async () => {
      const { captureId } = await record()
      const matched = await updateCaptureState(captureId, {
        state: 'ingested',
        clipDir: 'clips/processed/2026/08/a-clip',
      })
      expect(matched).toBe(true)
      const stored = await findCaptureByUrl(url)
      expect(stored?.state).toBe('ingested')
      expect(stored?.clipDir).toBe('clips/processed/2026/08/a-clip')
      expect(stored?.stateAt).not.toBeNull()
    })

    it('leaves the row alone when the push carries nothing', async () => {
      const { captureId } = await record()
      await updateCaptureState(captureId, {
        state: 'ingested',
        clipDir: null,
      })
      const matched = await updateCaptureState(captureId, {
        state: null,
        clipDir: null,
      })
      expect(matched).toBe(true)
      expect((await findCaptureByUrl(url))?.state).toBe('ingested')
    })

    it('reports no match for an id that does not exist', async () => {
      expect(
        await updateCaptureState('01KYSGC20YDDHMJPHYF0XHAKRZ', {
          state: 'ingested',
          clipDir: null,
        }),
      ).toBe(false)
    })
  },
)
