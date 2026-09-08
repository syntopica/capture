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
        autoUpdate: true,
        lines: 80.45,
        functions: 77.77,
        branches: 68.96,
        statements: 78.12,
      },
    },
    include: ['src/**/*.test.ts'],
  },
})
