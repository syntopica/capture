import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { findCaptureByUrl } from '@/services/captures/findCaptureByUrl'
import { haveAnswer } from '@/utils/captures/haveAnswer'
import { jsonError } from '@/utils/http/jsonError'
import { jsonOk } from '@/utils/http/jsonOk'

/** Has this URL been captured already, and how far did its clip get? The
 * endpoint that justified building a service at all: a GitHub PUT can only
 * report whether a write succeeded, and a duplicate stayed invisible until both
 * copies were refetched.
 *
 * `state` is what a browser extension reads per tab to colour its toolbar icon.
 * `null` there means no capture at all rather than an unknown state - a caller
 * that cannot reach this service must read the silence as "not captured", since
 * guessing the other way suppresses a capture that never happened. */
export const GET = async (request: Request): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return jsonError('UNAUTHORIZED', 'invalid capture token', 401)
  const url = new URL(request.url).searchParams.get('url')?.trim() ?? ''
  if (url === '') return jsonError('INVALID_QUERY', 'url is required', 400)
  const capture = await findCaptureByUrl(url)
  return jsonOk(haveAnswer(capture))
}
