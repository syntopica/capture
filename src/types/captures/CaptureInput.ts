/** A validated capture request body. `url` is a well-formed `https` URL and
 * `note` is already length-capped; the route handler has no further checking to
 * do by the time it holds one of these. */
export type CaptureInput = {
  url: string
  note: string | null
  captureSource: string
  capturedAt: string
}
