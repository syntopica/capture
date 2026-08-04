import { capturePool } from '@/services/db/capturePool'

/** Mark one capture as taken out of the inbox. Returns whether a row matched,
 * so the route can answer 404 for an id that does not exist rather than
 * reporting a silent success.
 *
 * `drained_at` means "taken out of the inbox" and never "a page was written".
 * Synthesis state lives in the clip's own derived state and in the ledger; an
 * inbox that learns to answer that becomes a second ledger, and two ledgers
 * disagree eventually.
 *
 * Re-marking an already-drained capture is left alone rather than refused: the
 * consumer retrying after a lost response is the expected case, and moving the
 * timestamp forward would lose when the handover actually happened. */
export const markCaptureDrained = async (
  captureId: string,
): Promise<boolean> => {
  const [result] = await capturePool().execute(
    `UPDATE captures SET drained_at = UTC_TIMESTAMP()
       WHERE capture_id = ? AND drained_at IS NULL`,
    [captureId],
  )
  if ((result as { affectedRows: number }).affectedRows === 1) return true
  const [rows] = await capturePool().query(
    'SELECT 1 FROM captures WHERE capture_id = ?',
    [captureId],
  )
  return (rows as unknown[]).length === 1
}
