import type { UndrainedCaptureTimeRow } from '@/types/captures/UndrainedCaptureTimeRow'
import { describe, expect, it } from 'vitest'
import { undrainedCountFromRows } from './undrainedCountFromRows'

const rows = (...times: string[]): UndrainedCaptureTimeRow[] =>
  times.map((captured_at) => ({ captured_at }) as UndrainedCaptureTimeRow)

describe('undrainedCountFromRows', () => {
  it('reports the count and the oldest capture time in UTC', () => {
    expect(
      undrainedCountFromRows(
        rows(
          '2026-10-01T10:00:00.000Z',
          '2026-10-01T11:30:00+02:00',
          '2026-10-02T08:00:00Z',
        ),
      ),
    ).toEqual({
      schemaVersion: 1,
      count: 3,
      oldestAt: '2026-10-01T09:30:00.000Z',
    })
  })
  it('counts a capture whose time does not parse without dating by it', () => {
    expect(
      undrainedCountFromRows(rows('garbage', '2026-10-01T10:00:00Z')),
    ).toEqual({
      schemaVersion: 1,
      count: 2,
      oldestAt: '2026-10-01T10:00:00.000Z',
    })
  })
  it('reports zero and no time for an empty set', () => {
    expect(undrainedCountFromRows([])).toEqual({
      schemaVersion: 1,
      count: 0,
      oldestAt: null,
    })
  })
})
