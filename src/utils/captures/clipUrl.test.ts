import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('clipUrl', () => {
  const load = async () => (await import('./clipUrl')).clipUrl

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    delete process.env['CLIPS_REPOSITORY_URL']
  })

  it('points at the clip directory on the default branch', async () => {
    process.env['CLIPS_REPOSITORY_URL'] = 'https://github.com/an-owner/clips'
    const clipUrl = await load()
    expect(clipUrl('clips/processed/2026/07/a-clip')).toBe(
      'https://github.com/an-owner/clips/tree/main/clips/processed/2026/07/a-clip',
    )
  })

  it('has nothing to link to for a capture with no clip', async () => {
    process.env['CLIPS_REPOSITORY_URL'] = 'https://github.com/an-owner/clips'
    const clipUrl = await load()
    expect(clipUrl(null)).toBeNull()
  })

  it('has nothing to link to when no clip store is configured', async () => {
    const clipUrl = await load()
    expect(clipUrl('clips/processed/2026/07/a-clip')).toBeNull()
  })
})
