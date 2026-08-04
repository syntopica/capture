import { capturePool } from '@/db/capturePool'
import type { RowDataPacket } from 'mysql2/promise'
import { createHash } from 'node:crypto'

/** Whether the request carries a live capture token, and a note of its use.
 *
 * The token is looked up by SHA-256 and never stored in the clear, so a
 * database dump leaks no credential. Matching by primary key rather than by
 * comparing candidates is also what makes this constant-work regardless of how
 * many tokens exist - there is no list to walk and no early exit to time.
 *
 * Revocation is `revoked_at` and therefore one UPDATE, not a redeploy. That
 * property is the entire reason a capture token replaced a GitHub PAT: the PAT
 * could only be rotated, everywhere it had been copied, including an
 * iCloud-synced Shortcut plist.
 *
 * `last_used_at` is written on success so an unexpected capture is visible
 * afterwards. It is deliberately not awaited into the response path's
 * correctness: the request is already authorised by then. */
export const authorizeRequest = async (request: Request): Promise<boolean> => {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  /* An empty-string check leaks whether a token was sent, not what it was. The
   * comparison that touches the secret is the primary-key lookup below, which is
   * constant work whatever the token is: no candidate list to walk, no early
   * exit to time. The directive has to sit on its own line immediately above the
   * statement - a multi-line `//` explanation between them makes
   * `disable-next-line` apply to the next comment instead of to the code. */
  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token === '') return false
  const digest = createHash('sha256').update(token).digest('hex')
  const [rows] = await capturePool().query<RowDataPacket[]>(
    'SELECT token_sha256 FROM capture_tokens WHERE token_sha256 = ? AND revoked_at IS NULL',
    [digest],
  )
  if (rows.length === 0) return false
  await capturePool().execute(
    'UPDATE capture_tokens SET last_used_at = UTC_TIMESTAMP() WHERE token_sha256 = ?',
    [digest],
  )
  return true
}
