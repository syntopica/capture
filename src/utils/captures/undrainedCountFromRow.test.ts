import type { UndrainedCountRow } from '@/types/captures/UndrainedCountRow'
import { describe, expect, it } from 'vitest'
import { undrainedCountFromRow } from './undrainedCountFromRow'

const row = (n: number | string, oldest: string | null) =>
  ({ n, oldest }) as UndrainedCountRow

describe('undrainedCountFromRow', () => {
  it('reports the count and the oldest capture time', () => {
    expect(undrainedCountFromRow(row(3, '2026-10-01T10:00:00.000Z'))).toEqual({
      schemaVersion: 1,
      count: 3,
      oldestAt: '2026-10-01T10:00:00.000Z',
    })
  })
  it('reads a count the driver decoded as a string', () => {
    expect(undrainedCountFromRow(row('12', null)).count).toBe(12)
  })
  it('reports zero and no time for an empty set or no row', () => {
    expect(undrainedCountFromRow(row(0, null))).toEqual({
      schemaVersion: 1,
      count: 0,
      oldestAt: null,
    })
    expect(undrainedCountFromRow(undefined).count).toBe(0)
  })
})
