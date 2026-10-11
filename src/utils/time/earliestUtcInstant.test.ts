import { describe, expect, it } from 'vitest'
import { earliestUtcInstant } from './earliestUtcInstant'

describe('earliestUtcInstant', () => {
  it('compares instants, not strings, across mixed offsets', () => {
    expect(
      earliestUtcInstant(['2026-09-30T23:00:00Z', '2026-10-01T00:30:00+02:00']),
    ).toBe('2026-09-30T22:30:00.000Z')
  })
  it('answers in UTC even for a single offset timestamp', () => {
    expect(earliestUtcInstant(['2026-08-04T12:00:00+02:00'])).toBe(
      '2026-08-04T10:00:00.000Z',
    )
  })
  it('skips a timestamp that does not parse', () => {
    expect(earliestUtcInstant(['not a time', '2026-10-01T10:00:00Z'])).toBe(
      '2026-10-01T10:00:00.000Z',
    )
  })
  it('has no instant when nothing parses or nothing is given', () => {
    expect(earliestUtcInstant(['not a time'])).toBeNull()
    expect(earliestUtcInstant([])).toBeNull()
  })
})
