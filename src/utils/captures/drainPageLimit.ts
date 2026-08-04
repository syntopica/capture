/** How many captures one drain page returns, and the ceiling a caller may ask
 * for. The inbox is a handful of URLs a day, so this is a bound against a
 * runaway query rather than pagination anybody will feel. */
export const DRAIN_PAGE_LIMIT = 200
