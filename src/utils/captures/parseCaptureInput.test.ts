import { describe, expect, it } from 'vitest'
import { parseCaptureInput } from './parseCaptureInput'

describe('parseCaptureInput', () => {
  it('accepts a plain https URL', () => {
    const parsed = parseCaptureInput({ url: 'https://example.com/a' })
    // Asserted field by field rather than with `expect.any(String)`, which is
    // typed `any` and pollutes the whole object literal with it.
    expect('input' in parsed && parsed.input.url).toBe('https://example.com/a')
    expect('input' in parsed && parsed.input.note).toBeNull()
    expect('input' in parsed && parsed.input.captureSource).toBe('unknown')
    expect('input' in parsed && typeof parsed.input.capturedAt).toBe('string')
  })

  it('refuses the leaked Shortcuts variable label rather than salvaging it', () => {
    // Verbatim shape of both captures the old GitHub lane produced.
    const parsed = parseCaptureInput({
      url: 'Imagen\nhttps://nitingavhane.medium.com/glm-5-2-is-free-653632330ba9',
    })
    expect('error' in parsed).toBe(true)
  })

  it('refuses a non-https scheme', () => {
    expect('error' in parseCaptureInput({ url: 'file:///etc/passwd' })).toBe(
      true,
    )
    expect('error' in parseCaptureInput({ url: 'http://example.com' })).toBe(
      true,
    )
  })

  it('trims surrounding whitespace, which is not a client bug worth failing on', () => {
    const parsed = parseCaptureInput({ url: '  https://example.com/a\n' })
    expect('input' in parsed && parsed.input.url).toBe('https://example.com/a')
  })

  it('keeps the client timestamp with its offset intact', () => {
    const parsed = parseCaptureInput({
      url: 'https://example.com/a',
      captured_at: '2026-07-29T05:02:15+02:00',
    })
    expect('input' in parsed && parsed.input.capturedAt).toBe(
      '2026-07-29T05:02:15+02:00',
    )
  })

  it('refuses a body that is not an object', () => {
    expect('error' in parseCaptureInput('https://example.com')).toBe(true)
    expect('error' in parseCaptureInput(null)).toBe(true)
    expect('error' in parseCaptureInput([{ url: 'https://example.com' }])).toBe(
      true,
    )
  })

  it('caps the note', () => {
    const parsed = parseCaptureInput({
      url: 'https://example.com/a',
      note: 'x'.repeat(2001),
    })
    expect('error' in parsed).toBe(true)
  })
})
