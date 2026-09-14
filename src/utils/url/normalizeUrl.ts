import { IDENTITY_QUERY_PARAMS } from './identityQueryParams'

/** The article's identity: host plus path, with the parts that make one article
 * look like two removed.
 *
 * This is a deliberate port of `normalize()` in
 * `~/p/wiki/tools/capture/url_index.py`, and it must stay byte-identical to
 * it. The two read the same question - "do we already have this?" - from two
 * stores, and an index answering a different question than the one it was built
 * from is worse than no index at all. The Python is:
 *
 *     without_query = url.split("?")[0].split("#")[0]
 *     base = without_query.rstrip("/").lower()
 *     kept_names = IDENTITY_QUERY_PARAMS.get((urlsplit(url).hostname or "").lower(), ())
 *     if not kept_names: return base
 *     query = parse_qs(urlsplit(url).query)
 *     kept = [f"{name}={query[name][0]}" for name in kept_names if query.get(name)]
 *     return f"{base}?{'&'.join(kept)}" if kept else base
 *
 * Note what the base means and keep it: the whole string is lowercased, path
 * included, not just the host. It loses case in paths that are technically
 * case-sensitive, and it is what the 1484 rows already in the URL index were
 * keyed with. Matching the existing behaviour beats being more correct alone.
 *
 * Medium is the reason any of this exists: it appends tracking parameters and a
 * `?source=` provenance chain, and the same article circulates with and without
 * a trailing slash.
 *
 * `IDENTITY_QUERY_PARAMS` is the exception, added 2026-08-04, for the hosts
 * that put the page's identity in the query - dropping it there erases the page
 * rather than its tracking. A kept value is **not** lowercased while the base
 * is: YouTube video ids are case-sensitive, so folding their case would
 * narrowly reintroduce the collision this closes. */
export const normalizeUrl = (url: string): string => {
  const base =
    url.split('?')[0]?.split('#')[0]?.replace(/\/+$/, '').toLowerCase() ?? ''
  const parsed = URL.parse(url)
  if (parsed === null) return base
  const keptNames = IDENTITY_QUERY_PARAMS[parsed.hostname.toLowerCase()]
  if (keptNames === undefined) return base
  const kept = keptNames
    .map((name) => [name, parsed.searchParams.get(name)] as const)
    .filter((pair): pair is readonly [string, string] => pair[1] !== null)
    .map(([name, value]) => `${name}=${value}`)
  return kept.length === 0 ? base : `${base}?${kept.join('&')}`
}
