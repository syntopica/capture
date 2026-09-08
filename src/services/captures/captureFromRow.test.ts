import type { CaptureRow } from '@/types/captures/CaptureRow'
import { describe, expect, it } from 'vitest'
import { captureFromRow } from './captureFromRow'

/** The columns a test varies. Not `Partial<CaptureRow>`: that keeps the
 * driver's `constructor.name` literal, which an object literal cannot supply. */
type Overrides = Partial<
  Pick<CaptureRow, 'note' | 'drained_at' | 'state' | 'state_at' | 'clip_dir'>
>

/** The columns every query has always selected. The state columns are added
 * per test, so a row built with no overrides is the row a query written before
 * those columns existed returns. */
const row = (overrides: Overrides): CaptureRow =>
  ({
    capture_id: '01KYSGC20YDDHMJPHYF0XHAKR2',
    url: 'https://example.invalid/a',
    note: null,
    capture_source: 'ios-shortcut',
    captured_at: '2026-08-04T12:00:00+02:00',
    drained_at: null,
    ...overrides,
  }) as CaptureRow

describe('captureFromRow', () => {
  it('carries the state a push wrote', () => {
    const stateAt = new Date('2026-08-04T10:00:00Z')
    const capture = captureFromRow(
      row({
        state: 'ingested',
        state_at: stateAt,
        clip_dir: 'clips/processed/2026/07/2026-07-26-github-readability-01kyf',
      }),
    )
    expect(capture.state).toBe('ingested')
    expect(capture.stateAt).toBe(String(stateAt))
    expect(capture.clipDir).toBe(
      'clips/processed/2026/07/2026-07-26-github-readability-01kyf',
    )
  })

  it('reads a row that predates the columns as captured, with nothing else claimed', () => {
    const capture = captureFromRow(row({}))
    expect(capture.state).toBe('captured')
    expect(capture.stateAt).toBeNull()
    expect(capture.clipDir).toBeNull()
  })

  it('hands the DATETIME the driver decoded to the caller as a string', () => {
    const drainedAt = new Date('2026-08-05T08:30:00Z')
    const capture = captureFromRow(
      row({ drained_at: drainedAt, note: 'read later' }),
    )
    expect(capture.drainedAt).toBe(String(drainedAt))
    expect(capture.note).toBe('read later')
  })
})
