import type { CaptureState } from '@/types/captures/CaptureState'
import { readCaptureStateField } from './readCaptureStateField'
import { readClipDirectoryField } from './readClipDirectoryField'

/** Validate the optional body of a state push.
 *
 * An absent body is valid and means "state unchanged". That is not leniency: it
 * is the body-less PATCH the drain has always sent, and it must keep meaning
 * "mark this drained" and nothing more.
 *
 * The two fields are read by their own modules rather than inline. Each carries
 * its own reason for refusing, and both reasons are worth reading next to the
 * check they justify. */
export const parseCaptureStateInput = (
  body: unknown,
):
  | { input: { state: CaptureState | null; clipDir: string | null } }
  | { error: string } => {
  if (body === null || body === undefined)
    return { input: { state: null, clipDir: null } }
  if (typeof body !== 'object' || Array.isArray(body))
    return { error: 'body must be a JSON object' }
  const record = body as Record<string, unknown>
  const state = readCaptureStateField(record)
  if ('error' in state) return { error: state.error }
  const clipDir = readClipDirectoryField(record)
  if ('error' in clipDir) return { error: clipDir.error }
  return { input: { state: state.value, clipDir: clipDir.value } }
}
