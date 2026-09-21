/** The clip store on GitHub.
 *
 * Configuration, not a constant: the store is a private repository of whoever
 * runs this service, so the deployment names it and this repository does not.
 * It is a public URL and no credential - following the link is the reader's
 * own GitHub session doing the work - but an unset value must not become a
 * guess, so the answer carries no link at all until it is set. */
export const CLIPS_REPOSITORY_URL = process.env['CLIPS_REPOSITORY_URL'] ?? ''
