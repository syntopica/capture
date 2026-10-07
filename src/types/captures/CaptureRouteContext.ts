/** The route context Next hands a `/api/captures/[captureId]` handler. */
export type CaptureRouteContext = {
  params: Promise<{ captureId: string }>
}
