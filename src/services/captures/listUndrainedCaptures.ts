import { capturePool } from '@/services/db/capturePool'
import type { Capture } from '@/types/captures/Capture'
import type { RowDataPacket } from 'mysql2/promise'

/** Everything the drain has not taken yet, oldest first.
 *
 * Oldest first because the consumer marks each capture only after it has taken
 * it: a run that dies halfway leaves the remainder undrained and the next run
 * continues from the same end. Taking a URL twice is harmless - the URL index
 * dedupes it downstream - and losing one is not, which is why the mark follows
 * the handover rather than preceding it. */
export const listUndrainedCaptures = async (
  limit: number,
): Promise<Capture[]> => {
  const [rows] = await capturePool().query<RowDataPacket[]>(
    `SELECT capture_id, url, note, capture_source, captured_at, drained_at
       FROM captures WHERE drained_at IS NULL
       ORDER BY captured_at ASC, capture_id ASC
       LIMIT ?`,
    [limit],
  )
  return rows.map((row) => ({
    captureId: String(row.capture_id),
    url: String(row.url),
    note: row.note === null ? null : String(row.note),
    captureSource: String(row.capture_source),
    capturedAt: String(row.captured_at),
    drainedAt: row.drained_at === null ? null : String(row.drained_at),
  }))
}
