import type { RowDataPacket } from 'mysql2/promise'
import { describe, expect, it } from 'vitest'
import { captureFromRow } from './captureFromRow'

const row = (overrides: Record<string, unknown>): RowDataPacket =>
  ({
    capture_id: '01KYSGC20YDDHMJPHYF0XHAKR2',
    url: 'https://example.invalid/a',
    note: null,
    capture_source: 'ios-shortcut',
    captured_at: '2026-08-04T12:00:00+02:00',
    drained_at: null,
    state: 'captured',
    state_at: null,
    clip_dir: null,
    ...overrides,
  }) as unknown as RowDataPacket

describe('captureFromRow', () => {
  it('carries the state a push wrote', () => {
    const capture = captureFromRow(
      row({
        state: 'ingested',
        state_at: '2026-08-04 10:00:00',
        clip_dir: 'clips/processed/2026/07/2026-07-26-github-readability-01kyf',
      }),
    )
    expect(capture.state).toBe('ingested')
    expect(capture.stateAt).toBe('2026-08-04 10:00:00')
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
})
