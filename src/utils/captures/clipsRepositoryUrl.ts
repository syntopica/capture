/** The clip store on GitHub.
 *
 * Overridable by environment for the same reason the service origin is on the
 * consumer side - a staging deploy should not link into the real clip store -
 * but it has a default, because there is exactly one. It is a public URL and no
 * credential: this service holds none, and following the link is the reader's
 * own GitHub session doing the work. */
export const CLIPS_REPOSITORY_URL =
  process.env.CLIPS_REPOSITORY_URL ??
  'https://github.com/<owner>/<clips-repo>'
