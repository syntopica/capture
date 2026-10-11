import { createHash } from 'node:crypto'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

/** The two calls `clips ingest` makes to mirror a desktop clip, end to end
 * through the route handlers and a real database.
 *
 * Guards the 2026-09-30 report: every mirror of clip 01M3QXGJ (an X status)
 * logged `recording ... returned 500`, for both the routing and the publish
 * state. The cause was the deployment, not this code - after the host move the
 * server's `DB_SOCKET` still named the cPanel socket, so every authenticated
 * request failed to connect while unauthenticated ones still answered 401. This
 * pins the code side: the body `clips` sends (a URL and a source, no
 * `captured_at`) is recorded, then the state lands on the id it returned.
 *
 * The handlers and the pool are imported inside the suite rather than at the
 * top: a skipped suite would otherwise still load them, and the coverage
 * ratchet, recorded without a database, would count every line of them as
 * missed.
 *
 * Run with: env $(grep -v '^#' .env.local | xargs) pnpm test */
const configured = (process.env['DB_NAME'] ?? '') !== ''

const load = async () => ({
  POST: (await import('@/app/api/capture/route')).POST,
  PATCH: (await import('@/app/api/captures/[captureId]/route')).PATCH,
  capturePool: (await import('@/db/capturePool')).capturePool,
  findCaptureByUrl: (await import('./findCaptureByUrl')).findCaptureByUrl,
})

describe.skipIf(!configured)(
  'desktop clip mirror against a real database',
  () => {
    const url = 'https://x.com/desktop-clip-probe/status/2101009392611278961'
    const token = 'desktop-clip-mirror-integration-token'
    const digest = createHash('sha256').update(token).digest('hex')
    const headers = {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    }

    const clean = async () => {
      const { capturePool } = await load()
      await capturePool().execute(
        'DELETE FROM captures WHERE normalized_url = ?',
        [url],
      )
      await capturePool().execute(
        'DELETE FROM capture_tokens WHERE token_sha256 = ?',
        [digest],
      )
    }

    beforeEach(async () => {
      await clean()
      const { capturePool } = await load()
      await capturePool().execute(
        'INSERT INTO capture_tokens (token_sha256, label) VALUES (?, ?)',
        [digest, 'integration-test'],
      )
    })

    afterAll(async () => {
      await clean()
      const { capturePool } = await load()
      await capturePool().end()
    })

    const record = async () =>
      (await load()).POST(
        new Request('http://localhost/api/capture', {
          method: 'POST',
          headers,
          body: JSON.stringify({ url, capture_source: 'mac-clips' }),
        }),
      )

    const push = async (captureId: string, state: string) =>
      (await load()).PATCH(
        new Request(`http://localhost/api/captures/${captureId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            state,
            clip_dir: 'clips/needs-claude/2026/09/x-com-status-01m3qxgj',
          }),
        }),
        { params: Promise.resolve({ captureId }) },
      )

    const captureIdOf = async (response: Response): Promise<string> => {
      const body = (await response.json()) as { data: { capture_id: string } }
      return body.data.capture_id
    }

    it('records the routing state, then the publish state, on one capture', async () => {
      const first = await record()
      expect(first.status).toBe(201)
      const captureId = await captureIdOf(first)
      expect((await push(captureId, 'needs-claude')).status).toBe(200)

      const again = await record()
      expect(again.status).toBe(200)
      expect(await captureIdOf(again)).toBe(captureId)
      expect((await push(captureId, 'ingested')).status).toBe(200)

      const stored = await (await load()).findCaptureByUrl(url)
      expect(stored?.state).toBe('ingested')
      expect(stored?.drainedAt).not.toBeNull()
    })
  },
)
