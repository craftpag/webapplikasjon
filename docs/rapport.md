# GPT Wrapper – Prosjektrapport

> Gruppe W11 – [Navn 1], [Navn 2], [Navn 3]
>
> ITF31619 Webapplikasjoner, Høgskolen i Østfold, høst 2026
>
> GitHub: <https://github.com/craftpag/webapplikasjon>

## 1. Prosjektet

GPT Wrapper er en webapplikasjon som lar brukere chatte med ulike KI-modeller gjennom ett felles grensesnitt. Appen støtter to leverandører: OpenAI (GPT-4o mini) og Anthropic (Claude Sonnet). Brukeren registrerer seg, logger inn, oppretter en samtale med ønsket leverandør, sender meldinger, og ser svarene.

Målet var å bygge en fullstack webapplikasjon med Next.js, server-komponenter, klientkomponenter, server actions, database med Drizzle, innlogging og integrasjon mot eksterne API-er.

## 2. Prosess og arbeidsmetode

Vi brukte GitHub Projects som prosessverktøy. Oppgaver ble opprettet som issues og fordelt mellom gruppemedlemmene.

Fordeling av arbeidet:

- **[Navn 1]:** Backend, API-ruter og database
- **[Navn 2]:** Frontend og design
- **[Navn 3]:** Testing, dokumentasjon og rapport

## 3. Krav og avgrensning

Se vedlegg A (kravliste) og vedlegg B («ikke med»-liste).

Vi fokuserte på å få hovedflyten robust: registrere bruker, logge inn, opprette samtale, sende meldinger, se historikk. Demo-modus ble lagt til slik at appen kan testes uten API-nøkler.

## 4. Design

Appen har fire sider:
- **Registrering** (`/register`): Skjema for å opprette ny brukerkonto
- **Innlogging** (`/login`): Skjema for å logge inn
- **Forsiden** (`/`): Beskyttet side som lister samtaler og har skjema for å opprette nye
- **Chatvisningen** (`/chat/:id`): Viser meldingshistorikk med skjema for å sende nye meldinger

API-endepunktene:

| Metode   | Endepunkt                          | Beskrivelse                     |
| -------- | ---------------------------------- | ------------------------------- |
| `GET`    | `/api/health`                      | Helsesjekk                      |
| `GET`    | `/api/conversations`               | List samtaler                   |
| `POST`   | `/api/conversations`               | Opprett samtale                 |
| `GET`    | `/api/conversations/:id`           | Hent samtale med meldinger      |
| `DELETE` | `/api/conversations/:id`           | Slett samtale                   |
| `POST`   | `/api/conversations/:id/messages`  | Send melding, få AI-svar        |

## 5. Teknisk løsning

### Next.js med App Router

Vi bruker **Next.js** med App Router. Forsiden og chatvisningen er **server-komponenter** som leser data direkte fra databasen. Chatskjemaet og logg ut-knappen er **klientkomponenter** (`"use client"`) som gir interaktivitet. Skriving av data skjer gjennom **server actions** – funksjoner merket med `"use server"` som kjører på serveren.

### Innlogging

Vi bruker **bcryptjs** for å hashe passord. Når brukeren logger inn, opprettes en sesjon med en tilfeldig UUID som lagres i en cookie. Middleware sjekker at cookien finnes for beskyttede sider og API-ruter. Hver samtale har en `userId`, så brukere bare kan se sine egne samtaler.

### Database

Vi bruker **SQLite** gjennom **@libsql/client** med **Drizzle ORM**. SQLite ble valgt fordi det ikke krever en separat databaseserver. Drizzle gir oss type-sikre spørringer.

Skjemaet har fire tabeller: `users` (brukere), `sessions` (sesjoner), `conversations` (samtaler med tittel og leverandør) og `messages` (meldinger med rolle og innhold).

### Service-lag

All forretningslogikk ligger i `conversation-service.ts`. API-ruter og server actions kaller dette service-laget. Alle spørringer filtrerer på `userId` slik at brukere bare får tilgang til egne samtaler.

### AI-integrasjon

`ai.ts` kaller OpenAI og Anthropic via `fetch`. Hver leverandør har sitt eget API-format. Uten API-nøkler returnerer funksjonene en demo-melding.

## 6. Testing

Vi bruker **Vitest** for testing. Vi har tre testfiler:

- **`service.test.ts`**: Enhetstester av service-funksjonene (list, create, get, delete, sendMessage) og integrasjonstest av hovedflyten
- **`auth.test.ts`**: Tester av registrering og innlogging (riktig passord, feil passord, duplikat e-post)
- **`utils.test.ts`**: Tester av hjelpefunksjoner (validering av leverandør, e-post, datoformatering)

AI-modulen er mocket i testene. Testene bruker en in-memory SQLite-database.

## 7. Utfordringer

- Vi hadde problemer med native SQLite-moduler som krasjet i Vitest. Løsningen var å bytte til `@libsql/client` som er ren JavaScript.
- Sortering av meldinger på `createdAt`-strenger ga feil rekkefølge når meldinger ble opprettet i samme millisekund. Vi byttet til sortering på `id`.
- Vi måtte lære oss server actions og Next.js App Router fra bunnen av.

## 8. Bruk av KI

Vi har brukt KI-verktøy i utviklingen, i tråd med KI-avtalen (vedlegg D).

**Verktøy vi brukte:**

- **Claude (Anthropic):** Grunnoppsett, feilsøking, forslag til kodestruktur, hjelp med Drizzle-konfigurasjon
- **ChatGPT (OpenAI):** Dokumentasjonsforklaring, eksempler på Next.js App Router

**Hva vi sitter igjen med:**

KI var nyttig for å komme raskt i gang og for å feilsøke. Vi opplevde at KI-generert kode ofte måtte tilpasses. KI er best som forklaringsverktøy, ikke som erstatning for å lese dokumentasjonen.

## 9. Refleksjon

Gjennom prosjektet har vi lært:

- Hvordan Next.js App Router fungerer med server-komponenter og klientkomponenter
- Forskjellen på server actions og API-ruter
- Hvordan man designer et databaseskjema og bruker Drizzle ORM
- Hvordan man implementerer enkel innlogging med bcrypt og sesjoner
- Hvordan man integrerer eksterne API-er (OpenAI, Anthropic)
- Hvordan man skriver tester med Vitest

Den viktigste lærdommen er at et service-lag mellom ruter og database gjør koden enklere å teste og vedlikeholde. Vi lærte også at autorisasjonssjekker (filtrering på userId) er viktig selv i enkle apper.

## Vedlegg

- A: [Kravliste](kravliste.md)
- B: [«Ikke med»-liste](ikke-med.md)
- C: Designskisser
- D: [KI-avtale](ki-avtale.md)
