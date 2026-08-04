import { describe, expect, it } from 'vitest'
import { clipUrl } from './clipUrl'

describe('clipUrl', () => {
  it('points at the clip directory on the default branch', () => {
    expect(clipUrl('clips/processed/2026/07/a-clip')).toBe(
      'https://github.com/CristianDeluxe/brain-clips/tree/main/clips/processed/2026/07/a-clip',
    )
  })

  it('has nothing to link to for a capture with no clip', () => {
    expect(clipUrl(null)).toBeNull()
  })
})
