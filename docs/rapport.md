# GPT Wrapper – Prosjektrapport

> Gruppe W11 – [Navn 1], [Navn 2], [Navn 3]
>
> ITF31619 Webapplikasjoner, Høgskolen i Østfold, høst 2026
>
> GitHub: <https://github.com/craftpag/webapplikasjon>

## 1. Prosjektet

GPT Wrapper er en webapplikasjon som lar brukere chatte med ulike KI-modeller gjennom ett felles grensesnitt. Appen støtter to leverandører: OpenAI (GPT-4o mini) og Anthropic (Claude Sonnet). Brukeren oppretter en samtale med ønsket leverandør, sender meldinger, og ser svarene.

Målet var å bygge en fullstack webapplikasjon med Next.js, server-komponenter, server actions, database og integrasjon mot eksterne API-er.

## 2. Prosess og arbeidsmetode

Vi brukte GitHub Projects som prosessverktøy. Oppgaver ble opprettet som issues og fordelt mellom gruppemedlemmene. Hver oppgave fikk en ansvarlig og en frist.

Arbeidsflyten i Git var basert på feature branches. Vi lagde en ny branch for hver oppgave, og åpnet pull request når koden var klar. Minst én annen i gruppen skulle godkjenne før merge til `main`.

Fordeling av arbeidet:

- **[Navn 1]:** Backend, API-ruter og database
- **[Navn 2]:** Frontend og design
- **[Navn 3]:** Testing, dokumentasjon og rapport

[Dersom arbeidsfordelingen har vært ujevn eller noen ikke har bidratt, beskriv det her.]

## 3. Krav og avgrensning

Se vedlegg A (kravliste) og vedlegg B («ikke med»-liste).

Vi fokuserte på å få hovedflyten robust: opprette samtale, sende meldinger, se historikk. Demo-modus ble lagt til slik at appen kan testes uten API-nøkler.

## 4. Design

Designskissene ble laget tidlig for å avklare hvilke sider og endepunkter vi trengte.

Appen har to sider:
- **Forsiden** (`/`): Lister samtaler og har et skjema for å opprette nye
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

Vi bruker **Next.js** med App Router og server-komponenter. Forsiden og chatvisningen er server-komponenter som leser data direkte fra databasen. Skriving av data (opprette samtale, sende melding, slette) skjer gjennom **server actions** – funksjoner merket med `"use server"` som kjører på serveren.

### Database

Vi bruker **SQLite** gjennom **@libsql/client** med **Drizzle ORM**. SQLite ble valgt fordi det ikke krever en separat databaseserver. Drizzle gir oss type-sikre spørringer.

Skjemaet har to tabeller: `conversations` (samtaler med tittel og leverandør) og `messages` (meldinger med rolle og innhold).

### Service-lag

All forretningslogikk ligger i `conversation-service.ts`. API-ruter og server actions kaller dette service-laget. Det gjør koden enkel å teste – vi tester service-funksjonene direkte uten å trenge Next.js i testene.

### AI-integrasjon

`ai.ts` kaller OpenAI og Anthropic via `fetch`. Hver leverandør har sitt eget API-format. Uten API-nøkler returnerer funksjonene en demo-melding.

## 6. Testing

Vi bruker **Vitest** for testing. Testfilen `__tests__/service.test.ts` inneholder:

- **Enhetstester** av service-funksjonene (list, create, get, delete, sendMessage)
- **Integrasjonstest** av hovedflyten (opprett samtale → send melding → hent samtale med meldinger)

AI-modulen er mocket i testene. Testene bruker en in-memory SQLite-database.

## 7. Bruk av KI

Vi har brukt KI-verktøy i utviklingen, i tråd med KI-avtalen (vedlegg D).

**Verktøy vi brukte:**

- **Claude (Anthropic):** Grunnoppsett, forklaring av feilmeldinger, forslag til kodestruktur
- **ChatGPT (OpenAI):** Dokumentasjonsforklaring, eksempler på Drizzle og Next.js

**Hva vi sitter igjen med:**

KI var nyttig for å komme raskt i gang. Vi opplevde at KI-generert kode ofte måtte tilpasses. KI er best som forklaringsverktøy, ikke som erstatning for å lese dokumentasjonen.

## 8. Refleksjon

Gjennom prosjektet har vi lært:

- Hvordan Next.js App Router fungerer med server-komponenter og server actions
- Hvordan man designer et databaseskjema og bruker Drizzle ORM
- Hvordan man setter opp REST API-ruter med riktige statuskoder
- Hvordan man integrerer eksterne API-er (OpenAI, Anthropic)
- Hvordan man skriver tester med Vitest
- Hvordan man jobber med Git i et team

Den viktigste lærdommen er at et service-lag mellom ruter og database gjør koden enklere å teste og vedlikeholde.

## Vedlegg

- A: [Kravliste](kravliste.md)
- B: [«Ikke med»-liste](ikke-med.md)
- C: Designskisser
- D: [KI-avtale](ki-avtale.md)
