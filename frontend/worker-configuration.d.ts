/* eslint-disable */
// Typer for bindingene i wrangler.jsonc. Kan genereres på nytt med `npm run generate -w frontend`
declare namespace Cloudflare {
  interface GlobalProps {
    mainModule: typeof import('./src/worker')
  }
  interface Env {
    ASSETS: Fetcher
    BACKEND_URL: string
  }
}
interface Env extends Cloudflare.Env {}
