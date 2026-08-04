/** Hosts where the query carries the page's identity, and which parameters
 * carry it.
 *
 * Everywhere else the query is tracking noise and `normalizeUrl` drops it. On
 * `youtube.com/watch` that same rule erases the video: every watch URL keys as
 * `https://www.youtube.com/watch`, so the second video captured is answered as
 * a duplicate of the first. Found 2026-08-04, when a citation backfill posted
 * `watch?v=zmrPY6S1FwY` and this service replied `already_captured` pointing at
 * an unrelated clip from a week earlier.
 *
 * `youtu.be` is absent on purpose - it carries the id in the path, so the
 * default rule is already right there.
 *
 * This table is the twin of `IDENTITY_QUERY_PARAMS` in
 * `~/p/brain/tools/capture/url_index.py` and must stay in step with it, for the
 * same reason the two `normalize` implementations do. */
export const IDENTITY_QUERY_PARAMS: Readonly<
  Record<string, readonly string[]>
> = {
  'youtube.com': ['v'],
  'www.youtube.com': ['v'],
  'm.youtube.com': ['v'],
}
