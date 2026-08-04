import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { findCaptureByUrl } from '@/services/captures/findCaptureByUrl'
import { jsonError } from '@/utils/http/jsonError'
import { jsonOk } from '@/utils/http/jsonOk'

/** Has this URL been captured already? The endpoint that justified building a
 * service at all: a GitHub PUT can only report whether a write succeeded, and
 * a duplicate stayed invisible until both copies were refetched. */
export const GET = async (request: Request): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return jsonError('UNAUTHORIZED', 'invalid capture token', 401)
  const url = new URL(request.url).searchParams.get('url')?.trim() ?? ''
  if (url === '') return jsonError('INVALID_QUERY', 'url is required', 400)
  const capture = await findCaptureByUrl(url)
  return jsonOk({
    captured: capture !== null,
    capture_id: capture?.captureId ?? null,
    captured_at: capture?.capturedAt ?? null,
  })
}
