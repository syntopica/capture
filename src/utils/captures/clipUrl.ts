import { CLIPS_REPOSITORY_URL } from './clipsRepositoryUrl'

/** Where a clip directory can be read on GitHub. Composed here rather than by
 * each client, so the repository is named once. Null when there is no clip, and
 * null when no clip store is configured: half a URL links nowhere. */
export const clipUrl = (clipDir: string | null): string | null =>
  clipDir === null || CLIPS_REPOSITORY_URL === ''
    ? null
    : `${CLIPS_REPOSITORY_URL}/tree/main/${clipDir}`
