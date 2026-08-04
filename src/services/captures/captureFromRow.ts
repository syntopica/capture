import type { Capture } from '@/types/captures/Capture'
import type { CaptureState } from '@/types/captures/CaptureState'
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
 * say the type annotation is a claim rather than a check.
 *
 * `state` falls back to `captured` when the column is absent as well as when it
 * is null. Absent is the real case: a query written before the column existed
 * selects no such key, and the row it returns describes a capture whose clip is
 * exactly what `captured` means. */
export const captureFromRow = (row: RowDataPacket): Capture => ({
  captureId: String(row.capture_id),
  url: String(row.url),
  note: row.note === null ? null : String(row.note),
  captureSource: String(row.capture_source),
  capturedAt: String(row.captured_at),
  drainedAt: row.drained_at === null ? null : String(row.drained_at),
  state:
    row.state === null || row.state === undefined
      ? 'captured'
      : (String(row.state) as CaptureState),
  stateAt:
    row.state_at === null || row.state_at === undefined
      ? null
      : String(row.state_at),
  clipDir:
    row.clip_dir === null || row.clip_dir === undefined
      ? null
      : String(row.clip_dir),
})
