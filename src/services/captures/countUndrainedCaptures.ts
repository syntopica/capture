import { capturePool } from '@/db/capturePool'
import type { UndrainedCount } from '@/types/captures/UndrainedCount'
import type { UndrainedCountRow } from '@/types/captures/UndrainedCountRow'
import { undrainedCountFromRow } from '@/utils/captures/undrainedCountFromRow'

/** One indexed aggregate over `captures_drained_at`: no URL, note or id. */
export const countUndrainedCaptures = async (): Promise<UndrainedCount> => {
  const [rows] = await capturePool().query<UndrainedCountRow[]>(
    `SELECT COUNT(*) AS n, MIN(captured_at) AS oldest
       FROM captures WHERE drained_at IS NULL`,
  )
  return undrainedCountFromRow(rows[0])
}
