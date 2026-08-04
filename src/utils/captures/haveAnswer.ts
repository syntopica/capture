import type { Capture } from '@/types/captures/Capture'
import { clipUrl } from './clipUrl'

/** What `GET /have` says about a URL.
 *
 * The two arms are written out rather than folded into one object of `??`
 * fallbacks: six of those read as a single expression but cost a branch each,
 * which put the answer over the complexity ceiling on its own.
 *
 * `state: null` means no capture at all, never an unknown state. A client that
 * cannot reach this service must read silence the same way - as "not captured" -
 * because guessing the other way suppresses a capture that never happened. */
export const haveAnswer = (capture: Capture | null) =>
  capture === null
    ? {
        captured: false,
        capture_id: null,
        captured_at: null,
        state: null,
        clip_dir: null,
        clip_url: null,
      }
    : {
        captured: true,
        capture_id: capture.captureId,
        captured_at: capture.capturedAt,
        state: capture.state,
        clip_dir: capture.clipDir,
        clip_url: clipUrl(capture.clipDir),
      }
