/** One string field out of an untrusted JSON body, trimmed, or the empty string
 * when it is absent or not a string.
 *
 * Collapsing "is it a string?" and "trim it" into one place is what keeps
 * `parseCaptureInput` readable: every field on this endpoint wants exactly that
 * treatment, and repeating the ternary per field is what pushed its complexity
 * to 14 before this existed.
 *
 * Empty and absent deliberately return the same value. The caller decides which
 * fields that is fatal for - `url` yes, `note` no - and there is no field here
 * where an explicitly empty string should mean something different from a
 * missing one. */
export const readTrimmedField = (
  record: Record<string, unknown>,
  key: string,
): string => {
  const value = record[key]
  return typeof value === 'string' ? value.trim() : ''
}
