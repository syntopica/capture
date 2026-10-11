import { capturePool } from '@/db/capturePool'
import type { UndrainedCaptureTimeRow } from '@/types/captures/UndrainedCaptureTimeRow'
import type { UndrainedCount } from '@/types/captures/UndrainedCount'
import { undrainedCountFromRows } from '@/utils/captures/undrainedCountFromRows'

/** How many captures wait for the drain, and the oldest of them, over
 * `captures_drained_at`: only `captured_at` is read - no URL, note or id.
 *
 * Not `MIN(captured_at)`: the column keeps each client's offset, so the minimum
 * string is not the earliest instant once `+02:00` and `Z` mix. The undrained
 * set is the inbox backlog, small by design, so the rows are compared in
 * process rather than adding a normalised column for one dashboard number. */
export const countUndrainedCaptures = async (): Promise<UndrainedCount> => {
  const [rows] = await capturePool().query<UndrainedCaptureTimeRow[]>(
    'SELECT captured_at FROM captures WHERE drained_at IS NULL',
  )
  return undrainedCountFromRows(rows)
}
