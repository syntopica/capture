import type { Pool } from 'mysql2/promise'
import mysql from 'mysql2/promise'

/** The MySQL pool, created once per process and reused.
 *
 * MySQL rather than a SQLite file, and not for performance - at a handful of
 * captures a day nothing here is a bottleneck. The deploy to nova is
 * `rsync --delete`, which is why the sibling app on that box carries a
 * documented `--exclude '.env'`; a database file inside the application
 * directory is one forgotten exclusion away from taking the whole capture
 * history with it. MySQL sits outside the deploy path and inside the cPanel
 * backups.
 *
 * The credentials are its own database and its own user, with no grants
 * anywhere else on that server. */
let pool: Pool | null = null

export const capturePool = (): Pool => {
  pool ??= mysql.createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
    connectionLimit: 4,
    charset: 'utf8mb4',
  })
  return pool
}
