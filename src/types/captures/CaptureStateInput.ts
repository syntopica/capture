import type { CaptureState } from '@/types/captures/CaptureState'

/** A validated state push. `null` in either field means "unchanged". */
export type CaptureStateInput = {
  state: CaptureState | null
  clipDir: string | null
}
