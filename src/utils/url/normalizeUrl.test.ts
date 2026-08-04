import { describe, expect, it } from 'vitest'
import { normalizeUrl } from './normalizeUrl'

/** These cases are the contract with `normalize()` in
 * `~/p/brain/tools/capture/url_index.py`. If one of them changes, the 1484 rows
 * already keyed by the Python version stop matching what this service stores,
 * and the dedup question quietly starts returning the wrong answer. Change both
 * or neither. */
describe('normalizeUrl', () => {
  it('strips the query string, which is how Medium says the same article twice', () => {
    expect(
      normalizeUrl('https://medium.com/@a/post-abc123?source=rss----1a2b3c'),
    ).toBe('https://medium.com/@a/post-abc123')
  })

  it('strips the fragment', () => {
    expect(normalizeUrl('https://example.com/a#section')).toBe(
      'https://example.com/a',
    )
  })

  it('strips a trailing slash, and more than one', () => {
    expect(normalizeUrl('https://example.com/a/')).toBe('https://example.com/a')
    expect(normalizeUrl('https://example.com/a///')).toBe(
      'https://example.com/a',
    )
  })

  it('lowercases the whole URL, path included, as the Python does', () => {
    expect(normalizeUrl('https://Medium.com/@A/Post-ABC')).toBe(
      'https://medium.com/@a/post-abc',
    )
  })

  it('collapses a query and a trailing slash together', () => {
    expect(normalizeUrl('https://example.com/a/?utm_source=x')).toBe(
      'https://example.com/a',
    )
  })

  it('leaves an already-normalized URL alone', () => {
    const url = 'https://nitingavhane.medium.com/glm-5-2-is-free-653632330ba9'
    expect(normalizeUrl(url)).toBe(url)
  })
})

/** The 2026-08-04 exception, and its own cross-language contract: these cases
 * must give the same answers as `IDENTITY_QUERY_PARAMS` in the Python. */
describe('identity-bearing query parameters', () => {
  it('keeps the video id on a YouTube watch url', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=zmrPY6S1FwY')).toBe(
      'https://www.youtube.com/watch?v=zmrPY6S1FwY',
    )
  })

  it('keeps two videos apart, which was the defect', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=aaa')).not.toBe(
      normalizeUrl('https://www.youtube.com/watch?v=bbb'),
    )
  })

  it('preserves the id case, since video ids are case-sensitive', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=AbC')).toBe(
      'https://www.youtube.com/watch?v=AbC',
    )
  })

  it('still drops tracking parameters beside the identity', () => {
    expect(
      normalizeUrl('https://www.youtube.com/watch?v=abc&t=42&si=xyz'),
    ).toBe('https://www.youtube.com/watch?v=abc')
  })

  it('falls back to the base when the identity parameter is absent', () => {
    expect(normalizeUrl('https://m.youtube.com/watch?list=PL123')).toBe(
      'https://m.youtube.com/watch',
    )
  })

  it('leaves youtu.be alone, which carries the id in the path', () => {
    expect(normalizeUrl('https://youtu.be/zmrPY6S1FwY')).toBe(
      'https://youtu.be/zmrpy6s1fwy',
    )
  })
})
