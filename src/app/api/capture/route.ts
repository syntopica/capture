import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { recordCapture } from '@/services/captures/recordCapture'
import { parseCaptureInput } from '@/utils/captures/parseCaptureInput'
import { jsonError } from '@/utils/http/jsonError'
import { jsonOk } from '@/utils/http/jsonOk'

/** Record a URL. The response says whether it was already there, so the phone
 * can show "already clipped" without a second round trip. */
export const POST = async (request: Request): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return jsonError('UNAUTHORIZED', 'invalid capture token', 401)
  const body = await request.json().catch(() => null)
  const parsed = parseCaptureInput(body)
  if ('error' in parsed) return jsonError('INVALID_CAPTURE', parsed.error, 400)
  const recorded = await recordCapture(parsed.input)
  return jsonOk(
    {
      capture_id: recorded.captureId,
      already_captured: recorded.alreadyCaptured,
    },
    recorded.alreadyCaptured ? 200 : 201,
  )
}
