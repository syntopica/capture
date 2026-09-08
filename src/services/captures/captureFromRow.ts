import type { Capture } from '@/types/captures/Capture'
import type { CaptureRow } from '@/types/captures/CaptureRow'
import type { CaptureState } from '@/types/captures/CaptureState'

/** One `captures` row as the rest of the code wants it.
 *
 * Extracted because `findCaptureByUrl` and `listUndrainedCaptures` had the same
 * eight lines of column-to-field mapping, which jscpd reported as the only
 * clone in the repository. Duplicated mapping is the kind that rots quietly: a
 * column added on one side and forgotten on the other produces a `Capture` that
 * is right in one query and short a field in the other, with nothing failing.
 *
 * The two `String()` calls are the `DATETIME` columns, which the driver decodes
 * as `Date` while a `Capture` promises strings. Everything else is already the
 * string the schema says it is; see `CaptureRow`.
 *
 * `state` falls back to `captured` when the column is absent: a query written
 * before the column existed selects no such key, and the row it returns
 * describes a capture whose clip is exactly what `captured` means. */
export const captureFromRow = (row: CaptureRow): Capture => ({
  captureId: row.capture_id,
  url: row.url,
  note: row.note,
  captureSource: row.capture_source,
  capturedAt: row.captured_at,
  drainedAt: row.drained_at === null ? null : String(row.drained_at),
  state: row.state === undefined ? 'captured' : (row.state as CaptureState),
  stateAt:
    row.state_at === null || row.state_at === undefined
      ? null
      : String(row.state_at),
  clipDir: row.clip_dir ?? null,
})
