import { capturePool } from '@/db/capturePool'
import type { CaptureInput } from '@/types/captures/CaptureInput'
import { normalizeUrl } from '@/utils/url/normalizeUrl'
import { ulid } from 'ulid'
import { findCaptureByUrl } from './findCaptureByUrl'

/** Record a capture, or report the one that already exists.
 *
 * `INSERT ... ON DUPLICATE KEY UPDATE` rather than a read-then-write: two
 * captures of the same URL arriving together would both see an empty table and
 * both insert, and the primary key is the only thing that settles that without
 * a transaction. The update is a no-op touch of `url`, so a duplicate is
 * absorbed instead of raising, and the original row's `capture_id`, `note`,
 * `captured_at` and `drained_at` are all left exactly as they were.
 *
 * Keeping the first capture rather than the newest is the deliberate half. A URL
 * shared twice is one article, and the first share is when the owner decided it
 * mattered; overwriting would move the capture forward in time for no gain and,
 * worse, would reset a `drained_at` that the consumer had already earned.
 *
 * **The answer comes from comparing capture ids, not from `affectedRows`, and
 * that is not a stylistic choice.** Measured against MySQL 9.7 through mysql2:
 * a fresh insert and an absorbed duplicate both report `affectedRows: 1` and
 * `changedRows: 0`, because the driver connects with `CLIENT_FOUND_ROWS` and so
 * counts matched rows rather than changed ones. Reading either field made the
 * endpoint answer `already_captured: false` for a URL it had just deduped
 * correctly - the row was right and the response was wrong. Re-reading the row
 * and checking whose id survived is unambiguous and owes nothing to driver flags.
 *
 * `capture_id` is minted here because a Shortcut cannot produce a ULID, and it
 * is a ULID because the rest of the clip store is keyed on one. */
export const recordCapture = async (
  input: CaptureInput,
): Promise<{ captureId: string; alreadyCaptured: boolean }> => {
  const captureId = ulid()
  await capturePool().execute(
    `INSERT INTO captures
       (normalized_url, url, note, capture_id, capture_source, captured_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE url = url`,
    [
      normalizeUrl(input.url),
      input.url,
      input.note,
      captureId,
      input.captureSource,
      input.capturedAt,
    ],
  )
  const stored = await findCaptureByUrl(input.url)
  // A row that vanished between the two statements is not a case worth
  // inventing a state for: report the id just minted and let the next capture
  // of the same URL settle it.
  if (stored === null) return { captureId, alreadyCaptured: false }
  return {
    captureId: stored.captureId,
    alreadyCaptured: stored.captureId !== captureId,
  }
}
