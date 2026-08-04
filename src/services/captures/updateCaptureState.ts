import { capturePool } from '@/db/capturePool'
import type { CaptureState } from '@/types/captures/CaptureState'

/** Store how far a clip got. Returns whether a row matched, so the route can
 * answer 404 for an id that does not exist rather than reporting a silent
 * success.
 *
 * A push carrying neither field is not an error and not a call worth refusing:
 * it is the body-less PATCH the drain has always sent, and it must keep meaning
 * "mark this drained" and nothing else. That case reads the row instead of
 * writing it, so an unchanged capture keeps the `state_at` it earned.
 *
 * Last write wins, deliberately. The Mac pushes only after the ledger is on
 * origin/main, so a later push is always the more advanced answer, and a mirror
 * that disagrees with the ledger is repaired by re-running the backfill rather
 * than by reasoning here.
 *
 * "A row matched" and not "a row changed": mysql2 connects with
 * `CLIENT_FOUND_ROWS`, so `affectedRows` counts matched rows - the same driver
 * behaviour documented at length in `recordCapture`, where reading it as
 * "changed" made the endpoint answer the opposite of the truth. */
export const updateCaptureState = async (
  captureId: string,
  input: { state: CaptureState | null; clipDir: string | null },
): Promise<boolean> => {
  if (input.state === null && input.clipDir === null) {
    const [rows] = await capturePool().query(
      'SELECT 1 FROM captures WHERE capture_id = ?',
      [captureId],
    )
    return (rows as unknown[]).length === 1
  }
  const [result] = await capturePool().execute(
    `UPDATE captures
        SET state    = COALESCE(?, state),
            clip_dir = COALESCE(?, clip_dir),
            state_at = UTC_TIMESTAMP()
      WHERE capture_id = ?`,
    [input.state, input.clipDir, captureId],
  )
  return (result as { affectedRows: number }).affectedRows === 1
}
