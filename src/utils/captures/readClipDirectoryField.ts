import { readTrimmedField } from './readTrimmedField'

/** The `clip_dir` field of a push, or the reason it was refused.
 *
 * It is checked rather than trusted because the service composes it into a
 * GitHub URL and hands that to a client. A value climbing out of the repository
 * root would make this endpoint a way to point that link anywhere - worth
 * refusing even though the link is public and carries no credential. */
export const readClipDirectoryField = (
  record: Record<string, unknown>,
): { value: string | null } | { error: string } => {
  const clipDir = readTrimmedField(record, 'clip_dir')
  if (clipDir === '') return { value: null }
  if (!clipDir.startsWith('clips/') || clipDir.includes('..'))
    return { error: 'clip_dir must be a path under clips/' }
  return { value: clipDir }
}
