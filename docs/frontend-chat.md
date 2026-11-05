# Frontend – kort dokumentasjon

GPT Wrapper med SSE, ITF31619 Webapplikasjoner

**Skrevet av:** Markus Dixon Vinnogg  
**Gjelder:** frontend/ og backend/ i https://github.com/craftpag/webapplikasjon  

## 1. Hva frontenden gjør

Frontenden er en enkel chat. Brukeren skriver en melding, og svaret fra modellen strømmes inn bit for bit mens det skrives. Øverst vises det om backenden er tilkoblet. Den samme CSS-en brukes også i Next.js-appen i rota, så begge appene ser like ut.

## 2. Teknologi

Frontenden er bygget med RedwoodSDK 1.7.5, som bruker React-serverkomponenter. Vite er byggeverktøy og utviklingsserver, og appen kjører som en Cloudflare Worker, også lokalt. Koden er skrevet i TypeScript og testet med Vitest og Testing Library. All styling ligger i én CSS-fil, src/app/styles.css, med lys og mørk modus.

## 3. Struktur

Inngangen er worker.tsx, som definerer mellomvare og ruter med defineApp, mens client.tsx starter klientkomponentene i nettleseren. document.tsx er html-rammen rundt sidene, og headers.ts setter sikkerhetshoder som CSP. Forsiden ligger i pages/home.tsx og er en serverkomponent.

Komponentene ligger i app/components. Chat.tsx er klientkomponenten som holder samtalen og strømmingen, og BackendStatus.tsx er en serverkomponent som sjekker /api/health. Hjelpekoden ligger i app/lib: chat.ts sender POST til /api/chat og leser svaret, sse.ts parser text/event-stream, backend.ts videresender /api/* til backenden, og utils.ts har små hjelpefunksjoner.

## 4. Hovedflyt

Brukeren skriver en melding i Chat og trykker Enter. chat.ts sender hele samtalen med POST til /api/chat. Workeren i worker.tsx videresender kallet til Hono-backenden på BACKEND_URL, som er http://localhost:3001 og står i wrangler.jsonc. Backenden svarer med en SSE-strøm med hendelsene delta, done og error. sse.ts deler strømmen opp i hendelser, og Chat legger hver tekstbit til det siste svaret i state.

## 5. Viktige valg

**Serverkomponenter som standard.** Bare Chat trenger state og hendelser, så bare den har "use client". Resten rendres på serveren og sendes ferdig til nettleseren. BackendStatus er en async serverkomponent som henter status før siden sendes, i stedet for med useEffect i nettleseren.

**Workeren som proxy.** Nettleseren snakker bare med én origin. Vi slipper CORS, og backend-adressen står ett sted. Er backenden nede, svarer workeren 502 med en feilmelding.

**SSE over fetch i stedet for EventSource.** EventSource støtter bare GET, men vi må sende samtalen med POST. Derfor leser vi strømmen selv med fetch og en egen parser.

## 6. Feilhåndtering

Hvis kallet feiler, vises feilmeldingen under samtalen, og et tomt svar fjernes, så det ikke sendes med i neste forespørsel. Hvis backenden er nede, viser statusen øverst «backend nede», og /api-kall får 502. Send-knappen er deaktivert mens svaret strømmer og når feltet er tomt.

## 7. Tester

Testene kjøres med npm run test:chat fra rota, eller npm test -w frontend, og kjører i jsdom med egen konfig i vitest.config.ts. sse.test.ts tester parseren, også hendelser som er delt over flere biter. utils.test.ts tester hjelpefunksjonene, og backend.test.ts tester proxyen: riktig URL, 502 når backenden er nede, og helsesjekken. Chat.test.tsx er en komponenttest som sjekker at en melding sendes og at svaret vises.

## 8. Kjøre appen

Kjør npm install i rota, kopier backend/.env.example til backend/.env og sett OPENAI_API_KEY, og start med npm run dev:chat. Frontenden kjører på http://localhost:5173 og backenden på http://localhost:3001/api/health.
