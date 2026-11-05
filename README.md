# Webapplikasjon

Gruppeprosjekt i ITF31619 Webapplikasjoner.

## Kom i gang

Krever Node.js 22.12 eller nyere.

```bash
git clone https://github.com/craftpag/webapplikasjon.git
cd webapplikasjon
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api/health

Frontend er en RedwoodSDK-app som kjører som en Cloudflare Worker (også lokalt, via Vite). Workeren videresender alle `/api`-kall til backend (se `frontend/src/worker.tsx` og `BACKEND_URL` i `frontend/wrangler.jsonc`), så nettleseren bare snakker med én origin.

## Skript

| Kommando        | Hva den gjør                            |
| --------------- | --------------------------------------- |
| `npm run dev`   | Starter frontend og backend samtidig    |
| `npm test`      | Kjører testene i begge prosjektene      |
| `npm run build` | Bygger begge prosjektene                |
| `npm run lint`  | Linter frontend                         |

Kjør et skript i bare ett av prosjektene med `-w`, for eksempel `npm test -w backend`.

## Struktur

```
frontend/   RedwoodSDK (React-serverkomponenter på Cloudflare Workers, bygget med Vite), testet med Vitest og Testing Library
backend/    Hono på Node.js, testet med Vitest
docs/       Kravliste, «ikke med»-liste, KI-avtale, skisser og rapport
```

Alt i `docs/` fra sign-off i uke 40 skal være med i den endelige innleveringen (frist 5.11 kl. 23:59).

## Frontend

```
frontend/src/
  worker.tsx              Inngangen: mellomvare og ruter (defineApp)
  client.tsx              Hydrerer klientkomponentene i nettleseren
  app/
    document.tsx          <html>-rammen rundt alle sider
    headers.ts            Sikkerhetshoder (CSP m.m.)
    styles.css            All styling
    pages/home.tsx        Forsiden, en serverkomponent
    components/
      Chat.tsx            Klientkomponent ("use client"): samtalen og SSE-strømmen
      BackendStatus.tsx   Async serverkomponent: sjekker /api/health før siden sendes
    lib/
      chat.ts             POST /api/chat og leser svaret bit for bit
      sse.ts              Parser text/event-stream
      backend.ts          Kjører i workeren: videresender /api/* til Hono
```

Valg som preger koden:

- **Serverkomponenter som standard.** Bare `Chat` trenger state og hendelser, så bare den er en klientkomponent. Resten rendres i workeren.
- **Workeren som proxy.** `route('/api/*', ...)` sender kall videre til Hono-backenden. Nettleseren ser én origin, så vi slipper CORS, og backend-adressen ligger i én variabel.
- **Strømming med SSE over `fetch`.** `EventSource` støtter bare GET, så vi bruker `fetch` med POST og leser strømmen selv i `lib/sse.ts`.

Testene i frontend kjører i jsdom med egen konfig (`frontend/vitest.config.ts`), uten å starte workeren.
