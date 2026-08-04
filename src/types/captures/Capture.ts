/** One row of the inbox, as the drain reads it. */
export type Capture = {
  captureId: string
  url: string
  note: string | null
  captureSource: string
  capturedAt: string
  drainedAt: string | null
}
