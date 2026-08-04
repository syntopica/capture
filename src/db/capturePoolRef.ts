import type { Pool } from 'mysql2/promise'

/** The one live pool, held in a box so it can be created on first use.
 *
 * A bare `let pool` beside `capturePool` would be a hidden module-level
 * declaration, which the Primary Unit Rule forbids: one file, one exported
 * unit, and no private state smuggled in alongside it. Making the box itself
 * the file's export keeps the memoisation and states plainly that it exists. */
export const capturePoolRef: { current: Pool | null } = { current: null }
