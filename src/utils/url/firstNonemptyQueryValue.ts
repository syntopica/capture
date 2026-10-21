/** Match parse_qs: blank values are discarded before choosing the first one. */
export const firstNonemptyQueryValue = (
  params: URLSearchParams,
  name: string,
): string | null => params.getAll(name).find(Boolean) ?? null
