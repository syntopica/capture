import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { markCaptureDrained } from '@/services/captures/markCaptureDrained'
import { updateCaptureState } from '@/services/captures/updateCaptureState'
import { parseCaptureStateInput } from '@/utils/captures/parseCaptureStateInput'
import { jsonError } from '@/utils/http/jsonError'
import { jsonOk } from '@/utils/http/jsonOk'

/** Mark a capture as taken, and record how far its clip got.
 *
 * The consumer calls this *after* it has the URL in hand, which is what makes a
 * crashed drain re-runnable: the remainder stays undrained and the next run
 * continues. A body-less call is exactly what it always was and only marks the
 * capture drained.
 *
 * The drained mark stays unconditional when a state is pushed too, and that is
 * the correct reading rather than a side effect: a client that knows how far a
 * clip got is holding that clip already, so there is nothing left for the drain
 * to fetch. Without it the backfill would leave 1485 rows looking like inbox
 * work and the drain would go promote articles the store already has. */
export const PATCH = async (
  request: Request,
  context: { params: Promise<{ captureId: string }> },
): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return jsonError('UNAUTHORIZED', 'invalid capture token', 401)
  const { captureId } = await context.params
  // `Response.json()` is typed `any`; narrowing here is what lets
  // parseCaptureStateInput take `unknown` and do the validating. An absent or
  // unparseable body is the drain's own call shape rather than an error.
  const body: unknown = await request.json().catch(() => null)
  const parsed = parseCaptureStateInput(body)
  if ('error' in parsed) return jsonError('INVALID_STATE', parsed.error, 400)
  if (!(await updateCaptureState(captureId, parsed.input)))
    return jsonError('NOT_FOUND', 'no such capture', 404)
  await markCaptureDrained(captureId)
  return jsonOk({
    capture_id: captureId,
    drained: true,
    state: parsed.input.state,
  })
}
