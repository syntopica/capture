import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { recordCapture } from '@/services/captures/recordCapture'
import { parseCaptureInput } from '@/utils/captures/parseCaptureInput'

/** Record a URL. The response says whether it was already there, so the phone
 * can show "already clipped" without a second round trip. */
export const POST = async (request: Request): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'invalid capture token' } },
      { status: 401 },
    )
  const body = await request.json().catch(() => null)
  const parsed = parseCaptureInput(body)
  if ('error' in parsed)
    return Response.json(
      { error: { code: 'INVALID_CAPTURE', message: parsed.error } },
      { status: 400 },
    )
  const recorded = await recordCapture(parsed.input)
  return Response.json(
    {
      data: {
        capture_id: recorded.captureId,
        already_captured: recorded.alreadyCaptured,
      },
    },
    { status: recorded.alreadyCaptured ? 200 : 201 },
  )
}
