import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { findCaptureByUrl } from '@/services/captures/findCaptureByUrl'

/** Has this URL been captured already? The endpoint that justified building a
 * service at all: a GitHub PUT can only report whether a write succeeded, and
 * a duplicate stayed invisible until both copies were refetched. */
export const GET = async (request: Request): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'invalid capture token' } },
      { status: 401 },
    )
  const url = new URL(request.url).searchParams.get('url')?.trim() ?? ''
  if (url === '')
    return Response.json(
      { error: { code: 'INVALID_QUERY', message: 'url is required' } },
      { status: 400 },
    )
  const capture = await findCaptureByUrl(url)
  return Response.json({
    data: {
      captured: capture !== null,
      capture_id: capture?.captureId ?? null,
      captured_at: capture?.capturedAt ?? null,
    },
  })
}
