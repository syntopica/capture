/** A failed JSON response, in the `{ error: { code, message } }` shape.
 *
 * `no-store` for the same reason as `jsonOk`: a cached `401` would outlive the
 * token that fixed it. */
export const jsonError = (
  code: string,
  message: string,
  status: number,
): Response =>
  Response.json(
    { error: { code, message } },
    { status, headers: { 'cache-control': 'no-store' } },
  )
