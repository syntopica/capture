import type { NextConfig } from 'next'
import { fileURLToPath } from 'node:url'

/** `standalone` is what makes the cPanel deploy on nova possible: Next.js writes
 * a self-contained server that runs with plain `node server.js`, which is what
 * Passenger starts. See scripts/build-cpanel.sh.
 *
 * `images.unoptimized` is not a tuning knob here, it removes a dependency. This
 * service answers JSON and serves no image at all, but Next.js pulls in `sharp`
 * for the optimiser regardless, and `sharp` ships a per-platform native binary -
 * the traced bundle from this Mac carried `sharp-darwin-arm64.node` straight at
 * a Linux server. That is the exact failure the sibling app on nova already met,
 * where the macOS binary reached production and every image was silently served
 * unoptimised behind a 200. With the optimiser off there is no native code in
 * the bundle at all, which is what lets the build ship its own dependencies
 * instead of installing them on the server.
 *
 * `turbopack.root` is pinned because this repository sits inside `~/p`, which
 * carries a stray `pnpm-lock.yaml` of its own. Next.js infers the workspace root
 * from the nearest lockfiles and picked `~/p` on the first run here, which would
 * have traced dependencies from the wrong tree. */
const nextConfig: NextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  // Turning the optimiser off stops `sharp` being *called*; it does not stop it
  // being traced into the bundle, which the build's own native-binary check
  // caught. Excluding it is the half that actually removes the file.
  outputFileTracingExcludes: {
    '*': ['node_modules/sharp/**', 'node_modules/@img/**'],
  },
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
}

export default nextConfig
