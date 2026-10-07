import type { Pool } from 'mysql2/promise'

/** A box holding the live pool, empty until it is created on first use. */
export type PoolRef = {
  current: Pool | null
}
