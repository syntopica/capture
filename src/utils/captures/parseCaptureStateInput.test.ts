import { describe, expect, it } from 'vitest'
import { parseCaptureStateInput } from './parseCaptureStateInput'

describe('parseCaptureStateInput', () => {
  it('accepts an absent body, because a drained mark carries none', () => {
    expect(parseCaptureStateInput(null)).toStrictEqual({
      input: { state: null, clipDir: null },
    })
  })

  it('accepts a known state and a clip directory', () => {
    expect(
      parseCaptureStateInput({
        state: 'ingested',
        clip_dir: 'clips/processed/2026/07/a-clip',
      }),
    ).toStrictEqual({
      input: { state: 'ingested', clipDir: 'clips/processed/2026/07/a-clip' },
    })
  })

  it('refuses a state nobody can render', () => {
    expect(parseCaptureStateInput({ state: 'done' })).toStrictEqual({
      error: 'state must be one of captured, ingested, needs-claude',
    })
  })

  it('refuses a clip directory outside clips/', () => {
    expect(
      parseCaptureStateInput({ clip_dir: '../../etc/passwd' }),
    ).toStrictEqual({ error: 'clip_dir must be a path under clips/' })
  })

  it('refuses a clip directory that climbs out from inside clips/', () => {
    expect(
      parseCaptureStateInput({ clip_dir: 'clips/../../etc/passwd' }),
    ).toStrictEqual({ error: 'clip_dir must be a path under clips/' })
  })

  it('refuses a body that is not an object', () => {
    expect(parseCaptureStateInput(['ingested'])).toStrictEqual({
      error: 'body must be a JSON object',
    })
  })
})
