# Frontend-chat (RedwoodSDK) – kort dokumentasjon

> Skrevet av Markus Dixon Vinnogg (fra `frontend-dokumentasjon.docx`). Gjelder appen i `frontend/` og `backend/`, fra branchen `frontend-chat`.

## 1. Hva frontenden gjør

En enkel chat. Brukeren skriver en melding, og svaret fra modellen strømmes inn bit for bit mens det skrives. Øverst vises det om backenden er tilkoblet.

## 2. Teknologi

- RedwoodSDK 1.7.5 (React-serverkomponenter)
- Vite som byggeverktøy og utviklingsserver
- Kjører som en Cloudflare Worker, også lokalt
- TypeScript, Vitest og Testing Library
- Ren CSS i én fil (`src/app/styles.css`), med lys og mørk modus

## 3. Struktur

| Fil | Beskrivelse |
| --- | ----------- |
| `worker.tsx` | Inngangen: mellomvare og ruter (`defineApp`) |
| `client.tsx` | Starter klientkomponentene i nettleseren |
| `app/document.tsx` | `<html>`-rammen rundt sidene |
| `app/headers.ts` | Sikkerhetshoder (CSP m.m.) |
| `app/pages/home.tsx` | Forsiden (serverkomponent) |
| `app/components/Chat.tsx` | Klientkomponent: samtalen og strømmingen |
| `app/components/BackendStatus.tsx` | Serverkomponent: sjekker `/api/health` |
| `app/lib/chat.ts` | `POST /api/chat` og leser svaret |
| `app/lib/sse.ts` | Parser `text/event-stream` |
| `app/lib/backend.ts` | Videresender `/api/*` til backenden |
| `app/lib/utils.ts` | Små hjelpefunksjoner |

## 4. Hovedflyt

1. Brukeren skriver en melding i `Chat` og trykker Enter.
2. `chat.ts` sender hele samtalen med POST til `/api/chat`.
3. Workeren (`worker.tsx`) videresender kallet til Hono-backenden på `BACKEND_URL` (`http://localhost:3001`, satt i `wrangler.jsonc`).
4. Backenden svarer med en SSE-strøm (`event: delta` / `done` / `error`).
5. `sse.ts` deler strømmen opp i hendelser, og `Chat` legger hver tekstbit til det siste svaret i state.

## 5. Viktige valg

**Serverkomponenter som standard.** Bare `Chat` trenger state og hendelser, så bare den har `"use client"`. Resten rendres på serveren og sendes ferdig til nettleseren. `BackendStatus` er en async serverkomponent som henter status før siden sendes, i stedet for med `useEffect` i nettleseren.

**Workeren som proxy.** Nettleseren snakker bare med én origin. Vi slipper CORS, og backend-adressen står ett sted. Er backenden nede, svarer workeren 502 med en feilmelding.

**SSE over fetch i stedet for EventSource.** `EventSource` støtter bare GET, men vi må sende samtalen med POST. Derfor leser vi strømmen selv med `fetch` og en egen parser.

## 6. Feilhåndtering

- Kallet feiler: feilmeldingen vises under samtalen, og et tomt svar fjernes, så det ikke sendes med i neste forespørsel.
- Backenden er nede: statusen øverst viser «backend nede», og `/api`-kall får 502.
- Send-knappen er deaktivert mens svaret strømmer og når feltet er tomt.

## 7. Tester

Kjøres med `npm run test:chat` fra rota (eller `npm test -w frontend`). Testene kjører i jsdom med egen konfig (`frontend/vitest.config.ts`).

| Test | Hva den dekker |
| ---- | -------------- |
| `sse.test.ts` | Parseren, også hendelser delt over flere biter |
| `utils.test.ts` | Hjelpefunksjonene |
| `backend.test.ts` | Proxyen: riktig URL, 502 når backenden er nede, og helsesjekken |
| `Chat.test.tsx` | Komponenttest: melding sendes og svaret vises |

## 8. Kjøre appen

```bash
npm install
cp backend/.env.example backend/.env   # sett OPENAI_API_KEY
npm run dev:chat
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api/health
