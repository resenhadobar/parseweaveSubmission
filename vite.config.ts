/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
export default defineConfig({
  base: './',
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: '127.0.0.1',
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
})
