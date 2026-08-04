import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { markCaptureDrained } from '@/services/captures/markCaptureDrained'
import { jsonError } from '@/utils/http/jsonError'
import { jsonOk } from '@/utils/http/jsonOk'

/** Mark a capture as taken. The consumer calls this *after* it has the URL in
 * hand, which is what makes a crashed drain re-runnable: the remainder stays
 * undrained and the next run continues. */
export const PATCH = async (
  request: Request,
  context: { params: Promise<{ captureId: string }> },
): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return jsonError('UNAUTHORIZED', 'invalid capture token', 401)
  const { captureId } = await context.params
  if (!(await markCaptureDrained(captureId)))
    return jsonError('NOT_FOUND', 'no such capture', 404)
  return jsonOk({ capture_id: captureId, drained: true })
}
