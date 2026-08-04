import type { CaptureState } from '@/types/captures/CaptureState'
import { CAPTURE_STATES } from './captureStates'

/** Whether a string is a state this service stores.
 *
 * A type predicate rather than a boolean helper so the caller keeps the narrowed
 * type: without it every use site needs a cast, and a cast is exactly the thing
 * that would let an unrecognised value through while looking checked. */
export const isCaptureState = (value: string): value is CaptureState =>
  CAPTURE_STATES.includes(value as CaptureState)
