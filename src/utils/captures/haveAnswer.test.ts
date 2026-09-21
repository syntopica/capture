import type { Capture } from '@/types/captures/Capture'
import { describe, expect, it } from 'vitest'
import { haveAnswer } from './haveAnswer'

const capture: Capture = {
  captureId: '01KYSGC20YDDHMJPHYF0XHAKR2',
  url: 'https://example.invalid/a',
  note: null,
  captureSource: 'chrome-extension',
  capturedAt: '2026-08-04T12:00:00+02:00',
  drainedAt: null,
  state: 'ingested',
  stateAt: '2026-08-04 10:00:00',
  clipDir: 'clips/processed/2026/08/a-clip',
}

describe('haveAnswer', () => {
  it('carries the state and a link to the clip', () => {
    expect(haveAnswer(capture)).toStrictEqual({
      captured: true,
      capture_id: '01KYSGC20YDDHMJPHYF0XHAKR2',
      captured_at: '2026-08-04T12:00:00+02:00',
      state: 'ingested',
      clip_dir: 'clips/processed/2026/08/a-clip',
      clip_url: null,
    })
  })

  it('says nothing at all about a URL with no capture', () => {
    expect(haveAnswer(null)).toStrictEqual({
      captured: false,
      capture_id: null,
      captured_at: null,
      state: null,
      clip_dir: null,
      clip_url: null,
    })
  })

  it('has no clip to link to for a capture the store never wrote', () => {
    expect(haveAnswer({ ...capture, clipDir: null }).clip_url).toBeNull()
  })
})
