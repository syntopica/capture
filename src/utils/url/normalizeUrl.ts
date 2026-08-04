/** The article's identity: host plus path, with the parts that make one article
 * look like two removed.
 *
 * This is a deliberate port of `normalize()` in
 * `~/p/brain/tools/capture/url_index.py`, and it must stay byte-identical to
 * it. The two read the same question - "do we already have this?" - from two
 * stores, and an index answering a different question than the one it was built
 * from is worse than no index at all. The Python is:
 *
 *     without_query = url.split("?")[0].split("#")[0]
 *     return without_query.rstrip("/").lower()
 *
 * Note what that means and keep it: the whole string is lowercased, path
 * included, not just the host. It loses case in paths that are technically
 * case-sensitive, and it is what the 1484 rows already in the URL index were
 * keyed with. Matching the existing behaviour beats being more correct alone.
 *
 * Medium is the reason any of this exists: it appends tracking parameters and a
 * `?source=` provenance chain, and the same article circulates with and without
 * a trailing slash. */
export const normalizeUrl = (url: string): string =>
  url.split('?')[0]?.split('#')[0]?.replace(/\/+$/, '').toLowerCase() ?? ''
