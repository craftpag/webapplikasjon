import { defineConfig } from "@playwright/test"

const PORT = 3100

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      // Egen database for e2e, og tomme nøkler så AI-en svarer i demo-modus
      DATABASE_URL: "file:e2e.db",
      OPENAI_API_KEY: "",
      ANTHROPIC_API_KEY: "",
    },
  },
})
