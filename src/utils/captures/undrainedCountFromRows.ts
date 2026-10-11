import type { UndrainedCaptureTimeRow } from '@/types/captures/UndrainedCaptureTimeRow'
import type { UndrainedCount } from '@/types/captures/UndrainedCount'
import { earliestUtcInstant } from '@/utils/time/earliestUtcInstant'

/** The health answer for the undrained captures: every row counts, and the
 * oldest is the earliest instant in UTC whatever offset each client sent. */
export const undrainedCountFromRows = (
  rows: readonly UndrainedCaptureTimeRow[],
): UndrainedCount => ({
  schemaVersion: 1,
  count: rows.length,
  oldestAt: earliestUtcInstant(rows.map((row) => row.captured_at)),
})
