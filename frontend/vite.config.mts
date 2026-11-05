import { cloudflare } from '@cloudflare/vite-plugin'
import { redwood } from 'rwsdk/vite'
import { defineConfig } from 'vite'

// RedwoodSDK kjører appen som en Cloudflare Worker, også under utvikling.
// Testene har egen konfig i vitest.config.ts, så de slipper å starte en worker.
export default defineConfig({
  plugins: [cloudflare({ viteEnvironment: { name: 'worker' } }), redwood()],
})
