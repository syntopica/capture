import type { Capture } from '@/types/captures/Capture'
import type { RowDataPacket } from 'mysql2/promise'

/** One `captures` row as the rest of the code wants it.
 *
 * Extracted because `findCaptureByUrl` and `listUndrainedCaptures` had the same
 * eight lines of column-to-field mapping, which jscpd reported as the only
 * clone in the repository. Duplicated mapping is the kind that rots quietly: a
 * column added on one side and forgotten on the other produces a `Capture` that
 * is right in one query and short a field in the other, with nothing failing.
 *
 * The `String()` calls are not ceremony. mysql2 types every column as `any`, so
 * without them the whole object is `any` and `no-unsafe-assignment` is right to
 * say the type annotation is a claim rather than a check. */
export const captureFromRow = (row: RowDataPacket): Capture => ({
  captureId: String(row.capture_id),
  url: String(row.url),
  note: row.note === null ? null : String(row.note),
  captureSource: String(row.capture_source),
  capturedAt: String(row.captured_at),
  drainedAt: row.drained_at === null ? null : String(row.drained_at),
})
