import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'

/** `standalone` is what makes the cPanel deploy on server-a possible: Next.js writes
 * a self-contained server that runs with plain `node server.js`, which is what
 * Passenger starts. See scripts/build-cpanel.sh.
 *
 * `turbopack.root` is pinned because this repository sits inside `~/p`, which
 * carries a stray `pnpm-lock.yaml` of its own. Next.js infers the workspace root
 * from the nearest lockfiles and picked `~/p` on the first run here, which would
 * have traced dependencies from the wrong tree into the standalone bundle - the
 * class of failure the sibling cPanel app already met from the other direction,
 * where a leftover bundle inside the repo was read as a second project. */
const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
}

export default nextConfig
