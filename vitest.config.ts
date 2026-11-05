import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  esbuild: {
    // Next bruker "react-jsx" i tsconfig; Vitest trenger å vite det samme
    jsx: "automatic",
  },
  test: {
    setupFiles: ["./test-setup.ts"],
    // frontend/ og backend/ (Markus sin chat-app) har egne Vitest-oppsett, se npm run test:chat
    exclude: ["**/node_modules/**", "frontend/**", "backend/**", "e2e/**"],
  },
})
