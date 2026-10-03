import type { UndrainedCount } from '@/types/captures/UndrainedCount'
import type { UndrainedCountRow } from '@/types/captures/UndrainedCountRow'

export const undrainedCountFromRow = (
  row: UndrainedCountRow | undefined,
): UndrainedCount => ({
  schemaVersion: 1,
  count: Number(row?.n ?? 0),
  oldestAt: row?.oldest ?? null,
})
