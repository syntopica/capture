/** A successful JSON response, in the `{ data }` shape, never cached.
 *
 * `no-store` is not defensive decoration. Every answer here depends on the
 * caller's token and on a row that changes, and the server serves this app through
 * ea-nginx: on the first deploy the drain marked a capture correctly in the
 * database and the very next `GET /api/captures` still listed it, because a
 * response that says nothing about caching is one an intermediary may keep.
 * Any CDN would have done the same, so the fix belongs here rather than in the
 * server's configuration. */
export const jsonOk = (data: unknown, status = 200): Response =>
  Response.json({ data }, { status, headers: { 'cache-control': 'no-store' } })
