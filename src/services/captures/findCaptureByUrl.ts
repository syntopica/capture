import { capturePool } from '@/services/db/capturePool'
import type { Capture } from '@/types/captures/Capture'
import { normalizeUrl } from '@/utils/url/normalizeUrl'
import type { RowDataPacket } from 'mysql2/promise'

/** The capture for a URL, or null. This is what `GET /have` answers, and
 * answering it at share time - before a directory exists anywhere - is the gap
 * that justified building a service instead of keeping the GitHub `PUT`. */
export const findCaptureByUrl = async (
  url: string,
): Promise<Capture | null> => {
  const [rows] = await capturePool().query<RowDataPacket[]>(
    `SELECT capture_id, url, note, capture_source, captured_at, drained_at
       FROM captures WHERE normalized_url = ?`,
    [normalizeUrl(url)],
  )
  const row = rows[0]
  if (row === undefined) return null
  return {
    captureId: String(row.capture_id),
    url: String(row.url),
    note: row.note === null ? null : String(row.note),
    captureSource: String(row.capture_source),
    capturedAt: String(row.captured_at),
    drainedAt: row.drained_at === null ? null : String(row.drained_at),
  }
}
