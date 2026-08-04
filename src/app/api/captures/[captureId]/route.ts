import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { markCaptureDrained } from '@/services/captures/markCaptureDrained'

/** Mark a capture as taken. The consumer calls this *after* it has the URL in
 * hand, which is what makes a crashed drain re-runnable: the remainder stays
 * undrained and the next run continues. */
export const PATCH = async (
  request: Request,
  context: { params: Promise<{ captureId: string }> },
): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'invalid capture token' } },
      { status: 401 },
    )
  const { captureId } = await context.params
  if (!(await markCaptureDrained(captureId)))
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'no such capture' } },
      { status: 404 },
    )
  return Response.json({ data: { capture_id: captureId, drained: true } })
}
