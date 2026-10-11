/** The earliest instant among client timestamps, in UTC, or null when none of
 * them parses.
 *
 * Parsed rather than compared as strings: `captured_at` keeps each client's
 * offset, and `2026-10-01T00:30:00+02:00` sorts after `2026-09-30T23:00:00Z`
 * lexically while happening half an hour before it. A value that does not
 * parse is skipped rather than fatal, because the capture endpoint keeps a
 * malformed timestamp over losing the capture. */
export const earliestUtcInstant = (
  timestamps: readonly string[],
): string | null => {
  let earliest = Number.POSITIVE_INFINITY
  for (const timestamp of timestamps) {
    const instant = Date.parse(timestamp)
    if (instant < earliest) earliest = instant
  }
  return Number.isFinite(earliest) ? new Date(earliest).toISOString() : null
}
