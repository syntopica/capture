import type { RowDataPacket } from 'mysql2/promise'

/** One undrained capture as `countUndrainedCaptures` selects it: its
 * `captured_at` and nothing else - no URL, note or id. The value is the
 * client's own string, offset intact, which is why the oldest one is found by
 * parsing rather than by `MIN` over the column. */
export type UndrainedCaptureTimeRow = RowDataPacket & {
  captured_at: string
}
