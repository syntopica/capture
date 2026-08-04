import type { CaptureState } from '@/types/captures/CaptureState'

/** Every state a client may push, in the order the refusal message lists them. */
export const CAPTURE_STATES: readonly CaptureState[] = [
  'captured',
  'ingested',
  'needs-claude',
]
