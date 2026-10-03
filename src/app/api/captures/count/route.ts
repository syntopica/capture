import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { countUndrainedCaptures } from '@/services/captures/countUndrainedCaptures'
import { jsonError } from '@/utils/http/jsonError'
import { jsonOk } from '@/utils/http/jsonOk'

/** How many captures wait for the drain and since when, for a health
 * dashboard. `?drained=false` is the only supported filter and the default,
 * as on `GET /api/captures`. */
export const GET = async (request: Request): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return jsonError('UNAUTHORIZED', 'invalid capture token', 401)
  return jsonOk(await countUndrainedCaptures())
}
