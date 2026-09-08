import type { RowDataPacket } from 'mysql2/promise'

/** One `captures` row as mysql2 hands it over, before `captureFromRow` turns
 * it into a `Capture`.
 *
 * mysql2 types a row as an index signature of `any`, which made every column
 * read in the mapper a hole the type coverage gate counted. Naming the columns
 * closes that. The types follow `schema.sql` and the driver's decoding:
 * `CHAR`, `VARCHAR` and `TEXT` arrive as strings, and a `DATETIME` arrives as
 * a `Date` because the pool does not ask for `dateStrings`.
 *
 * `state`, `state_at` and `clip_dir` are optional because a query written
 * before those columns existed selects no such key. `state` is never null:
 * the column is `NOT NULL DEFAULT 'captured'`.
 *
 * Intersected with `RowDataPacket` so the pool's `query<CaptureRow[]>` accepts
 * it; the declared columns win over the index signature. */
export type CaptureRow = RowDataPacket & {
  capture_id: string
  url: string
  note: string | null
  capture_source: string
  captured_at: string
  drained_at: Date | null
  state?: string
  state_at?: Date | null
  clip_dir?: string | null
}
