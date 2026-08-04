import { CLIPS_REPOSITORY_URL } from './clipsRepositoryUrl'

/** Where a clip directory can be read on GitHub. Composed here rather than by
 * each client, so the repository is named once. */
export const clipUrl = (clipDir: string | null): string | null =>
  clipDir === null ? null : `${CLIPS_REPOSITORY_URL}/tree/main/${clipDir}`
