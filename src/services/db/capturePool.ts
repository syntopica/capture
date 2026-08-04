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
 * anywhere else on that server.
 *
 * `DB_SOCKET` takes precedence over host and port when set, and on the cPanel
 * server it is set. cPanel creates database users as `user@'localhost'`, which
 * in MySQL means the unix socket; the server also runs with
 * `skip_name_resolve = ON`, so a TCP connection to 127.0.0.1 stays 127.0.0.1
 * and is matched against a grant that does not exist. The first deploy failed
 * exactly there - `Access denied for user 'cristiandev_capture'@'127.0.0.1'`
 * with the right user and the right password. Granting to `@'127.0.0.1'` by
 * hand would have worked and would have been the wrong fix: cPanel owns those
 * grants and re-syncs them. Connecting over the socket keeps the convention
 * cPanel maintains. */
let pool: Pool | null = null

export const capturePool = (): Pool => {
  const socketPath = process.env.DB_SOCKET ?? ''
  pool ??= mysql.createPool({
    ...(socketPath === ''
      ? {
          host: process.env.DB_HOST ?? '127.0.0.1',
          port: Number(process.env.DB_PORT ?? '3306'),
        }
      : { socketPath }),
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
    connectionLimit: 4,
    charset: 'utf8mb4',
  })
  return pool
}
