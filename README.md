# GPT Wrapper

Gruppeprosjekt i ITF31619 Webapplikasjoner – Høgskolen i Østfold, høst 2026.

**Gruppe W11:** [Navn 1], [Navn 2], [Navn 3]

## Hva appen gjør

GPT Wrapper er en chat-app som lar brukere snakke med ulike KI-modeller gjennom ett felles grensesnitt. Appen støtter OpenAI og Anthropic som leverandører.

## Hovedflyt

1. Bruker registrerer seg med e-post, navn og passord
2. Bruker logger inn og får tilgang til beskyttede sider
3. Bruker oppretter en ny samtale og velger leverandør (OpenAI eller Anthropic)
4. Bruker sender meldinger og får svar fra AI-en
5. Bruker kan se samtalehistorikken og slette samtaler

## Kom i gang

Krever Node.js 22 eller nyere.

```bash
git clone https://github.com/craftpag/webapplikasjon.git
cd webapplikasjon
npm ci
```

Bruk `npm ci`, ikke `npm install`. `npm ci` installerer nøyaktig det som står i `package-lock.json`. `npm install` kan på Windows hoppe over de native pakkene til Vite og rolldown (en kjent npm-feil), og da starter ikke testene.

Kopier `.env.example` til `.env` og fyll inn API-nøkler (valgfritt – appen fungerer i demo-modus uten):

```bash
cp .env.example .env
```

Start appen:

```bash
npm run dev
```

Åpne http://localhost:3000 i nettleseren. Registrer en bruker og logg inn.

Databasen (`data.db`) opprettes automatisk ved første start. Hvis du har en gammel `data.db` fra før innloggingen ble lagt til, slett den. Vi bruker ikke migreringer, så nye kolonner blir ikke lagt til i en eksisterende database.

## Kjøre tester

```bash
npm test
```

Testene bruker en in-memory database og mocker AI-kall. Ingen API-nøkler trengs.

| Testfil | Type |
| ------- | ---- |
| `__tests__/utils.test.ts` | Enhetstester av hjelpefunksjoner |
| `__tests__/service.test.ts`, `__tests__/auth.test.ts` | Enhetstester av service-laget og innlogging |
| `__tests__/components.test.tsx` | Komponenttest (Testing Library + jsdom) |
| `__tests__/hovedflyt.integration.test.ts` | Integrasjonstest av hovedflyten gjennom API-rutene |
| `e2e/hovedflyt.e2e.ts` | E2e-test i ekte nettleser (Playwright) |

E2e-testen bygger appen, starter den på port 3100 med en egen database og demo-modus, og går gjennom hovedflyten:

```bash
npx playwright install chromium   # første gang
npm run test:e2e
```

## Prosjektstruktur

```
src/
  app/
    api/
      health/route.ts                  Helsesjekk-endepunkt
      conversations/route.ts           GET liste, POST opprett samtale
      conversations/[id]/route.ts      GET hent, DELETE slett samtale
      conversations/[id]/messages/route.ts   POST send melding
    chat/[id]/page.tsx                 Server-komponent: chatvisning
    components/
      AuthForm.tsx                     Klientkomponent: skjema for innlogging og registrering
      ChatForm.tsx                     Klientkomponent: meldingsskjema
      LogoutButton.tsx                 Klientkomponent: logg ut-knapp
    login/page.tsx                     Innloggingsside
    register/page.tsx                  Registreringsside
    layout.tsx                         Root layout
    page.tsx                           Server-komponent: forsiden
  actions/
    auth.ts                            Server actions for innlogging
    conversations.ts                   Server actions for samtaler
  lib/
    db.ts                              Drizzle-skjema og SQLite-tilkobling
    auth.ts                            Registrering, innlogging, sesjon
    ai.ts                              Kaller OpenAI / Anthropic via fetch
    conversation-service.ts            CRUD-operasjoner for samtaler (filtrert på userId)
    utils.ts                           Zod-skjemaer og hjelpefunksjoner for validering
  proxy.ts                             Sender uinnloggede til /login (optimistisk sjekk)
__tests__/                             Se tabellen under «Kjøre tester»
docs/
  kravliste.md, ikke-med.md, ki-avtale.md, rapport.md
```

## Valg som preger koden

1. **Service-lag mellom ruter og database.** API-rutene og server actions kaller de samme funksjonene i `src/lib/`. Logikken finnes bare ett sted og kan testes uten Next.js.
2. **Autorisasjon på serveren, i hvert kall.** `getSession()` sjekker sesjonen i databasen i alle sider, actions og ruter, og alle spørringer filtreres på `userId`. `proxy.ts` er bare en rask sjekk av om cookien finnes.
3. **Serverkomponenter leser, server actions skriver.** Klientkomponenter brukes bare der vi trenger state, som «Sender…» og feilmeldinger.

Andre valg: Zod validerer alt som kommer utenfra (request body og skjema) før det brukes. Drizzle mot SQLite (`@libsql/client`) i stedet for D1, fordi appen bare kjører lokalt. Egen innlogging med bcrypt og sesjoner. `fetch` direkte mot OpenAI og Anthropic.

## Chat-appen i `frontend/` og `backend/` (RedwoodSDK + Hono)

Repoet har også en annen versjon av chatten, laget av Markus på branchen `frontend-chat` og merget inn i `main`. Den bruker stacken kurset anbefaler: RedwoodSDK som Cloudflare Worker, og en Hono-backend som strømmer svaret fra OpenAI med SSE. Den har ingen database eller innlogging. Hovedappen er Next.js-appen over.

```bash
cp backend/.env.example backend/.env   # sett OPENAI_API_KEY
npm run dev:chat                       # frontend http://localhost:5173, backend http://localhost:3001
npm run test:chat                      # testene i frontend/ og backend/
```

```
frontend/src/
  worker.tsx              Inngangen: mellomvare og ruter (defineApp)
  app/pages/home.tsx      Forsiden, en serverkomponent
  app/components/Chat.tsx Klientkomponent: samtalen og SSE-strømmen
  app/lib/sse.ts          Parser text/event-stream
  app/lib/backend.ts      Videresender /api/* fra workeren til Hono
backend/src/
  app.ts                  Hono-ruter (/api/health, /api/chat)
  chat.ts                 Strømmer svar fra OpenAI
```

`npm run test:all` kjører testene i begge appene.

## KI-bruk

Store deler av koden er laget med KI (Claude Code, blant annet Claude Opus 5.5). Se [docs/ki-avtale.md](docs/ki-avtale.md) for loggen.

## Skript

| Kommando        | Hva den gjør           |
| --------------- | ---------------------- |
| `npm run dev`   | Starter appen lokalt   |
| `npm run build` | Bygger for produksjon  |
| `npm start`     | Kjører bygget versjon  |
| `npm test`      | Kjører Vitest-testene  |
| `npm run test:e2e` | Kjører e2e-testen (Playwright) |

## API-endepunkter

Alle endepunkter under `/api/conversations` krever innlogging (session-cookie). Uten innlogging gir de 401. Ugyldig input gir 400, og en samtale som ikke finnes eller tilhører en annen gir 404. `DELETE` gir 204, og hvis AI-leverandøren feiler gir sending av melding 502.

| Metode   | Endepunkt                          | Beskrivelse                |
| -------- | ---------------------------------- | -------------------------- |
| `GET`    | `/api/health`                      | Helsesjekk                 |
| `GET`    | `/api/conversations`               | List samtaler              |
| `POST`   | `/api/conversations`               | Opprett samtale            |
| `GET`    | `/api/conversations/:id`           | Hent samtale med meldinger |
| `DELETE` | `/api/conversations/:id`           | Slett samtale              |
| `POST`   | `/api/conversations/:id/messages`  | Send melding, få AI-svar   |

GitHub: https://github.com/craftpag/webapplikasjon
