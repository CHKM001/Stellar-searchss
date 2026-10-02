import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'server/index.test.ts',
      'server/chat.test.ts',
      'tests/networkBadge.test.tsx',
    ],
    environmentMatchGlobs: [
      ['server/**', 'node'],
      ['tests/**', 'node'],
      ['src/**', 'jsdom'],
    ],
  },
})
