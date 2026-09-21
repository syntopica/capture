import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        // vitest's own ratchet: the first run with --coverage raises each
        // value to what the suite actually reaches and writes it back here.
        // Entering an existing repository at a flat 80 turns the build red on
        // day one, and a gate that starts red gets deleted rather than met.
        // Re-baselined on 2026-09-14 for vitest 5. The 4.x thresholds were
        // 80.45 lines and 78.12 statements, and the major bump changed the
        // accounting rather than the tests: totals moved from 87 to 86 lines
        // and 96 to 95 statements, with the covered counts dropping in step.
        // capturePool.ts, the only source file to change since the ratchet was
        // written, has the same 44 lines and differs only in bracket notation.
        // autoUpdate raises these values but never lowers them, so a provider
        // change has to be re-recorded by hand.
        autoUpdate: true,
        lines: 80.23,
        functions: 77.77,
        branches: 69.66,
        statements: 77.89,
      },
    },
    include: ['src/**/*.test.ts'],
  },
})
