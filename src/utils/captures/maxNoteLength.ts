/** The cap on a capture note. The Shortcut's prompt is a one-line "Nota
 * (opcional)", so this is generous rather than tight; it exists because the
 * endpoint is public and an uncapped TEXT column is a free write amplifier. */
export const MAX_NOTE_LENGTH = 2000
