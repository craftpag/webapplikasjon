import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Egen konfig for testene: vanlig jsdom, uten Cloudflare- og RedwoodSDK-pluginene.
// Testene dekker hjelpefunksjonene og klientkomponentene, ikke selve workeren.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
