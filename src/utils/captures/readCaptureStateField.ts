import type { CaptureState } from '@/types/captures/CaptureState'
import { CAPTURE_STATES } from './captureStates'
import { isCaptureState } from './isCaptureState'
import { readTrimmedField } from './readTrimmedField'

/** The `state` field of a push, or the reason it was refused.
 *
 * Absent means "unchanged" rather than an error: the drain marks a capture
 * drained with no body at all, and that call must keep working exactly as it
 * did. Present but unrecognised is refused, because this value ends up choosing
 * the colour of a toolbar icon and a stored typo would surface as a bug in the
 * extension, far from the request that caused it. */
export const readCaptureStateField = (
  record: Record<string, unknown>,
): { value: CaptureState | null } | { error: string } => {
  const state = readTrimmedField(record, 'state')
  if (state === '') return { value: null }
  if (!isCaptureState(state))
    return { error: `state must be one of ${CAPTURE_STATES.join(', ')}` }
  return { value: state }
}
