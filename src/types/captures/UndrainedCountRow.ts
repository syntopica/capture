import type { RowDataPacket } from 'mysql2/promise'

/** The aggregate row `countUndrainedCaptures` selects. `COUNT(*)` arrives as a
 * number, or as a string when the driver decodes a BIGINT that way; `MIN` over
 * the `VARCHAR` column is null on an empty set. */
export type UndrainedCountRow = RowDataPacket & {
  n: number | string
  oldest: string | null
}
