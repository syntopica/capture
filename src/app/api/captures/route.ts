import { authorizeRequest } from '@/services/auth/authorizeRequest'
import { listUndrainedCaptures } from '@/services/captures/listUndrainedCaptures'
import { DRAIN_PAGE_LIMIT } from '@/utils/captures/drainPageLimit'

/** What the drain reads. `?drained=false` is the only supported filter and it
 * is also the default: this endpoint exists to hand work to the consumer on the
 * Mac, not to browse the archive. */
export const GET = async (request: Request): Promise<Response> => {
  if (!(await authorizeRequest(request)))
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'invalid capture token' } },
      { status: 401 },
    )
  const requested = Number(
    new URL(request.url).searchParams.get('limit') ?? DRAIN_PAGE_LIMIT,
  )
  const limit =
    Number.isInteger(requested) && requested > 0
      ? Math.min(requested, DRAIN_PAGE_LIMIT)
      : DRAIN_PAGE_LIMIT
  const captures = await listUndrainedCaptures(limit)
  return Response.json({
    data: captures.map((capture) => ({
      capture_id: capture.captureId,
      url: capture.url,
      note: capture.note,
      capture_source: capture.captureSource,
      captured_at: capture.capturedAt,
    })),
  })
}
