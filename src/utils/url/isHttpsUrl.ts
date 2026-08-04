/** Whether a string is a well-formed `https` URL.
 *
 * `https` only, and the restriction is not about this service's own safety - it
 * never fetches anything, so there is nothing here to attack through a scheme.
 * It is about what lands in the store: a consumer on the owner's Mac will one
 * day fetch these, and a `file:` or `data:` URL that was accepted here is a
 * problem handed downstream to code that has no reason to expect one. Refusing
 * at the only boundary that sees the user is cheaper than validating in every
 * reader. */
export const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
