# GPT Wrapper

Gruppeprosjekt i ITF31619 Webapplikasjoner – Høgskolen i Østfold, høst 2026.

**Gruppe W11:** [Navn 1], [Navn 2], [Navn 3]

## Hva appen gjør

GPT Wrapper er en chat-app som lar brukere snakke med ulike KI-modeller gjennom ett felles grensesnitt. Appen støtter OpenAI og Anthropic som leverandører.

## Hovedflyt

1. Bruker oppretter en ny samtale og velger leverandør (OpenAI eller Anthropic)
2. Bruker sender meldinger og får svar fra AI-en
3. Bruker kan se samtalehistorikken og slette samtaler

## Kom i gang

Krever Node.js 22 eller nyere.

```bash
git clone https://github.com/craftpag/webapplikasjon.git
cd webapplikasjon
npm install
```

Kopier `.env.example` til `.env` og fyll inn API-nøkler (valgfritt – appen fungerer i demo-modus uten):

```bash
cp .env.example .env
```

Start appen:

```bash
npm run dev
```

Åpne http://localhost:3000 i nettleseren.

## Kjøre tester

```bash
npm test
```

Testene bruker en in-memory database og mocker AI-kall. Ingen API-nøkler trengs.

## Prosjektstruktur

```
src/
  app/
    api/
      health/route.ts               Helsesjekk-endepunkt
      conversations/route.ts         GET liste, POST opprett samtale
      conversations/[id]/route.ts    GET hent, DELETE slett samtale
      conversations/[id]/messages/route.ts   POST send melding
    chat/[id]/page.tsx               Server-komponent: chatvisning
    layout.tsx                       Root layout
    page.tsx                         Server-komponent: forsiden med form
  actions/
    conversations.ts                 Server actions for skriving av data
  lib/
    db.ts                            Drizzle-skjema og SQLite-tilkobling
    ai.ts                            Kaller OpenAI / Anthropic via fetch
    conversation-service.ts          CRUD-operasjoner for samtaler og meldinger
__tests__/
  service.test.ts                    Enhets- og integrasjonstester (Vitest)
docs/
  kravliste.md, ikke-med.md, ki-avtale.md, rapport.md
```

## Arkitekturvalg

1. **Next.js med App Router**: Server-komponenter for å lese data, server actions for å skrive. Ingen client-side state-håndtering.
2. **Drizzle + SQLite**: Drizzle ORM gir type-sikre spørringer. SQLite via `@libsql/client` trenger ingen ekstern databaseserver.
3. **Fetch mot AI-API-er**: Vi bruker `fetch` direkte mot OpenAI og Anthropic for full kontroll over API-kallene.

## Skript

| Kommando        | Hva den gjør           |
| --------------- | ---------------------- |
| `npm run dev`   | Starter appen lokalt   |
| `npm run build` | Bygger for produksjon  |
| `npm start`     | Kjører bygget versjon  |
| `npm test`      | Kjører testene         |

## API-endepunkter

| Metode   | Endepunkt                          | Beskrivelse                |
| -------- | ---------------------------------- | -------------------------- |
| `GET`    | `/api/health`                      | Helsesjekk                 |
| `GET`    | `/api/conversations`               | List samtaler              |
| `POST`   | `/api/conversations`               | Opprett samtale            |
| `GET`    | `/api/conversations/:id`           | Hent samtale med meldinger |
| `DELETE` | `/api/conversations/:id`           | Slett samtale              |
| `POST`   | `/api/conversations/:id/messages`  | Send melding, få AI-svar   |

GitHub: https://github.com/craftpag/webapplikasjon
