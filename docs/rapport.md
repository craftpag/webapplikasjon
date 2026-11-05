# GPT Wrapper – Prosjektrapport

> Gruppe W11 – **FYLL INN: fullt navn på alle medlemmer**
>
> ITF31619 Webapplikasjoner, Høgskolen i Østfold, høst 2026
>
> GitHub: <https://github.com/craftpag/webapplikasjon>

## 1. Prosjektet

GPT Wrapper er en webapp der man chatter med KI-modeller fra OpenAI (GPT-4o mini) og Anthropic (Claude Sonnet) i ett felles grensesnitt. Brukeren registrerer seg, logger inn, oppretter en samtale med valgt leverandør, sender meldinger og finner samtalen igjen senere. Hver bruker ser bare sine egne samtaler. Uten API-nøkler svarer appen med en demo-melding, så den kan prøves uten nøkler.

Målet var å lage en fullstack-app med serverkomponenter, klientkomponenter, server actions, egen database, innlogging og et REST-API med riktige statuskoder.

**Hovedflyt:** registrer → logg inn → opprett samtale → send melding → se samtalen igjen i lista og i chatvisningen.

## 2. Arkitekturvalg

**Next.js App Router.** Kursets anbefalte stack var RedwoodSDK på Cloudflare, men Next.js er godtatt. Vi valgte Next.js fordi det har mest dokumentasjon. Forsiden og chatvisningen er serverkomponenter som henter data direkte fra service-laget. `ChatForm`, `AuthForm` og `LogoutButton` er klientkomponenter, fordi de trenger state (for eksempel «Sender…» og feilmeldinger). All skriving skjer i server actions.

**Service-lag.** All logikk mot databasen ligger i `src/lib/conversation-service.ts` og `src/lib/auth.ts`. Både API-rutene og server actions kaller disse funksjonene, så logikken finnes bare ett sted og kan testes uten Next.js.

**Autorisasjon på serveren, i to lag.** `src/proxy.ts` sender brukere uten sesjons-cookie til `/login`, eller gir 401 i API-et. Det er bare en rask, optimistisk sjekk. Den egentlige sjekken skjer i `getSession()`, som slår opp sesjonen i databasen og sjekker utløpstid. I tillegg filtrerer alle spørringer i service-laget på `userId`. Hvis man prøver å lese eller slette andres samtale, får man 404 og ingenting lekker.

**Database.** Drizzle ORM mot SQLite via `@libsql/client`, med fire tabeller vi har designet selv: `users`, `sessions`, `conversations` og `messages`. **Avvik fra kravet:** kravet er Drizzle mot D1. Vi kjører SQLite lokalt fordi appen ikke er deployet til Cloudflare. D1 er også SQLite, så skjemaet kan brukes som det er, men vi har ikke koblet til D1.

**Innlogging.** Vi laget egen innlogging med bcrypt-hashing og sesjoner lagret i databasen, i stedet for better-auth. Sesjonen er en tilfeldig UUID i en `httpOnly`-cookie med `sameSite=lax`, og den utløper etter 7 dager.

**REST-API.** Endepunktene ligger under `/api/conversations` og bruker 200, 201, 204, 400 (ugyldig input eller JSON), 401 (ikke innlogget), 404 (finnes ikke, eller er ikke din) og 502 (AI-leverandøren feilet).

| Metode | Endepunkt | Svar |
| ------ | --------- | ---- |
| `GET` | `/api/conversations` | 200, 401 |
| `POST` | `/api/conversations` | 201, 400, 401 |
| `GET` | `/api/conversations/:id` | 200, 401, 404 |
| `DELETE` | `/api/conversations/:id` | 204, 401, 404 |
| `POST` | `/api/conversations/:id/messages` | 201, 400, 401, 404, 502 |

## 3. Testing

Vi har 35 Vitest-tester, og de kjøres med `npm test`. Databasen kjører i minnet og AI-kallet er mocket, så testene trenger ingen nøkler.

- **Enhetstester av hjelpefunksjoner** (`utils.test.ts`): validering av leverandør, id, e-post, tittel og melding.
- **Enhetstester av servicen** (`service.test.ts`, `auth.test.ts`): opprett, list, hent og slett samtaler, at man ikke kommer til andres samtaler, og registrering og innlogging.
- **Komponenttest** (`components.test.tsx`): `ChatForm` sender riktig data og viser feil, og `AuthForm` viser feilen fra server action.
- **Integrasjonstest av hovedflyten** (`hovedflyt.integration.test.ts`): registrer, logg inn, opprett samtale, send melding og hent samtalen igjen gjennom de ekte API-rutene. Den sjekker også 400, 401, 404 og 204.

E2e-test med Playwright har vi ikke rukket. Hovedflyten er testet manuelt i nettleser.

## 4. Bruk av KI

**Verktøy:** Claude Code (**FYLL INN modell** for grunnoppsett og omskriving), Claude Code med Claude Opus 5.5, og ChatGPT. Hele loggen står i vedlegg D.

**Hva vi brukte det til, ærlig:**

- **28. september:** grunnoppsett av repoet (Vite + Hono) og utkast til dokumentene i `docs/`.
- **5. november, kl. 21.09–21.39:** Claude Code skrev hele appen om fra Vite/Hono til Next.js. Det gjaldt ruter, service-lag, skjema, server actions, tester og README. Det meste av koden i repoet er altså KI-generert.
- **5. november, kl. 21.52–21.58:** innlogging med bcrypt og sesjoner (**FYLL INN verktøy**).
- **5. november, med Claude Opus 5.5:** vi ba først om en vurdering av repoet mot oppgavekravene. Vurderingen viste at innlogging, komponenttest og dokumentasjon av KI-bruken manglet. Opus 5.5 rettet deretter feil og la til tester (se vedlegg D). Alle commits fra den økta er merket `Co-Authored-By: Claude Opus 5.5`.
- **ChatGPT:** forklaring av Next.js App Router og Drizzle.

**Hva vi sitter igjen med:** KI tok oss raskt fra en tom baseline til en app som fungerer. Men vi brukte det for sent og for mye på én gang. Store mengder kode kom inn den siste kvelden, uten at noen andre i gruppa gikk gjennom den først, og det bryter regel 2 i vår egen KI-avtale. Vurderingen fra KI fant også feil i KI-skrevet kode: en «test av hjelpefunksjoner» testet funksjoner som var definert i selve testfila, feil passord ga en krasjside, og Next 16 hadde gjort `middleware.ts` utdatert. Vi lærte at KI-kode må leses og testes like kritisk som annen kode, og at KI-bruk må føres i loggen fortløpende, ikke i etterkant. **FYLL INN: hvem i gruppa kan forklare hvilke deler av koden.**

## 5. Utfordringer

- **Ny stack sent i prosjektet.** Vi startet med Vite + Hono og byttet til Next.js rett før fristen, fordi kravene ville ha serverkomponenter og server actions. Bytte av stack så sent førte til hastverk. Det skulle vi gjort tidlig i oktober.
- **SQLite i tester og bygg.** `db.transaction()` i libsql åpner en ny tilkobling, og med en in-memory-database i testene fikk vi «no such table». Vi løste det med `db.batch()`, som også kjører atomisk. `next build` kjører flere workere samtidig og ga `SQLITE_BUSY`. Det løste vi ved å opprette tabellene i én batch med `busy_timeout`.
- **Rekkefølge på meldinger.** Sortering på `createdAt` ga feil rekkefølge når to meldinger fikk samme millisekund. Vi sorterer nå på `id`.
- **Skjemaendring uten migreringer.** Da vi la til `userId`, krasjet appen mot den gamle lokale databasen, fordi `CREATE TABLE IF NOT EXISTS` ikke legger til nye kolonner. Vi måtte slette den lokale databasen. Neste gang ville vi brukt `drizzle-kit` med migreringer.
- **Feil som krasjet siden.** Server actions som kastet feil ga en feilside. De returnerer nå en feilmelding som klientkomponenten viser.
- **FYLL INN** eventuelle andre utfordringer dere selv har hatt, for eksempel med Git eller samarbeid.

## 6. Gruppearbeidet

**FYLL INN.** Skriv konkret hvem som gjorde hva. Git-historikken viser dette, og sensor vil sjekke:

- **craftpag (FYLL INN navn):** baseline 28.09, SSE-branch 08.10, omskriving og innlogging 05.11 (med KI).
- **MarkusDV (FYLL INN navn):** godkjente KI-avtalen 28.09, og arbeidet med rapportdisposisjonen 01.10.
- **FYLL INN tredje medlem:** har ingen commits i repoet.

Arbeidsfordelingen har vært ujevn. Det kom lite aktivitet mellom 8. oktober og 5. november, og mesteparten av appen ble laget av én person med KI den siste kvelden. **FYLL INN** årsaken og hva hver person faktisk bidro med utenom Git (for eksempel skisser, oppgaver i GitHub Projects eller testing).

## 7. Læringsutbytte

Dette kan vi nå som vi ikke kunne i august:

- Forskjellen på serverkomponenter og klientkomponenter, og når man trenger `"use client"`.
- Server actions for skriving, og hvorfor autorisasjonen må sjekkes på serveren i hver action og ikke bare i proxy.
- Å designe et relasjonelt skjema med Drizzle, med fremmednøkler og eierskap (`userId`).
- Sesjonsbasert innlogging: hashing med bcrypt, `httpOnly`-cookies og utløpstid.
- REST-design med riktige metoder og statuskoder, også når noe går galt.
- Testing på flere nivåer: enhet, komponent med Testing Library og integrasjon gjennom ekte route handlers.
- At KI kan skrive mye kode fort, men at vi selv må forstå, gjennomgå og dokumentere den.

## 8. Sign-off uke 40

| Punkt | Status |
| ----- | ------ |
| Kravliste og «ikke med»-liste | Vedlegg A og B |
| Prosessverktøy med fordelte oppgaver | GitHub Projects – **FYLL INN lenke** |
| Designskisser | **Mangler i repoet – legg ved i `docs/skisser/`** |
| Repo med hele gruppen invitert | **FYLL INN, bekreft** |
| KI-avtale | Vedlegg D, foreløpig bare signert av Markus |
| Alle starter prosjektet lokalt | **FYLL INN, bekreft** |
| Grunnkomponenter og utils | `src/app/components/`, `src/lib/utils.ts` |
| Minst én test som kjører | 35 tester, `npm test` |
| Disposisjon for rapporten | Commit `bf8bfcb` (28.09) |
| I gang med pensum | **FYLL INN** |

## Vedlegg

- A: [Kravliste](kravliste.md)
- B: [«Ikke med»-liste](ikke-med.md)
- C: Designskisser (`docs/skisser/`)
- D: [KI-avtale og KI-logg](ki-avtale.md)
