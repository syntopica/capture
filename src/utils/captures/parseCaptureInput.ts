import type { CaptureInput } from '@/types/captures/CaptureInput'
import { isHttpsUrl } from '@/utils/url/isHttpsUrl'
import { MAX_NOTE_LENGTH } from './maxNoteLength'

/** Validate a capture body, returning the input or the reason it was refused.
 *
 * **A leaked Shortcuts variable label is refused, not repaired.** Both captures
 * the old GitHub lane produced carry `url: Imagen\nhttps://...` - the label of
 * a Shortcuts variable ended up in the field, and the Contents API committed it
 * because nothing on the far end read it. Trimming whitespace is fair; salvaging
 * an `https://` substring out of a two-line value is not. A service that
 * silently repairs its client's bugs makes them permanent, and the whole reason
 * this endpoint exists instead of a `PUT` is that something here reads the
 * payload. The refusal reaches the phone as the Shortcut's notification, which
 * is where the bug is visible and fixable.
 *
 * `captured_at` is taken from the client with its offset intact rather than
 * stamped here: a phone captures in local time and the offset says where it
 * happened. It is not parsed, because a malformed timestamp is worth keeping
 * over a lost capture. */
export const parseCaptureInput = (
  body: unknown,
): { input: CaptureInput } | { error: string } => {
  if (typeof body !== 'object' || body === null || Array.isArray(body))
    return { error: 'body must be a JSON object' }
  const record = body as Record<string, unknown>
  const url = typeof record.url === 'string' ? record.url.trim() : ''
  if (url === '') return { error: 'url is required' }
  if (!isHttpsUrl(url))
    return {
      error:
        'url must be a single well-formed https URL; a value carrying anything else (a Shortcuts variable label, a second line) is refused rather than repaired',
    }
  const rawNote = typeof record.note === 'string' ? record.note.trim() : ''
  if (rawNote.length > MAX_NOTE_LENGTH)
    return {
      error: `note must be ${String(MAX_NOTE_LENGTH)} characters or fewer`,
    }
  const capturedAt =
    typeof record.captured_at === 'string' && record.captured_at.trim() !== ''
      ? record.captured_at.trim()
      : new Date().toISOString()
  const captureSource =
    typeof record.capture_source === 'string' &&
    record.capture_source.trim() !== ''
      ? record.capture_source.trim().slice(0, 64)
      : 'unknown'
  return {
    input: {
      url,
      note: rawNote === '' ? null : rawNote,
      captureSource,
      capturedAt,
    },
  }
}
