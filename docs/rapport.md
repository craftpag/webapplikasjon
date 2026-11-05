# GPT Wrapper – Prosjektrapport

> Gruppe W11 – Philip André Gaulin og Markus Dixon Vinnogg
>
> ITF31619 Webapplikasjoner, Høgskolen i Østfold, høst 2026
>
> GitHub: <https://github.com/craftpag/webapplikasjon>

## 1. Prosjektet

GPT Wrapper er en chat-app der man snakker med KI-modeller fra OpenAI og Anthropic. Repoet har to deler:

- **Hovedappen (Next.js, i rota).** Brukeren registrerer seg, logger inn, oppretter en samtale med valgt leverandør, sender meldinger og finner samtalen igjen senere. Samtalene lagres i en database, og hver bruker ser bare sine egne. Det er denne appen som dekker kravene til database, innlogging, server actions og hovedflyt.
- **Chat med strømming (RedwoodSDK + Hono, i `frontend/` og `backend/`).** Svaret strømmes inn ord for ord med Server-Sent Events (SSE). Den har ingen brukerkontoer og ingen lagring. Målet var å få SSE-flyten til å fungere skikkelig, med feilhåndtering i alle ledd.

**Hovedflyt i hovedappen:** registrer → logg inn → opprett samtale → send melding → se samtalen igjen.

## 2. Arkitekturvalg

### Hovedappen (Next.js)

**Next.js App Router.** Kurset anbefaler RedwoodSDK, men Next.js er godtatt. Forsiden og chatvisningen er serverkomponenter som henter data direkte fra service-laget. `ChatForm`, `AuthForm` og `LogoutButton` er klientkomponenter, fordi de trenger state (som «Sender…» og feilmeldinger fra `useActionState`). All skriving skjer i server actions.

**Service-lag.** Logikken mot databasen ligger i `src/lib/conversation-service.ts` og `src/lib/auth.ts`. Både API-rutene og server actions kaller disse funksjonene, så reglene står ett sted og kan testes uten Next.js.

**Autorisasjon på serveren, i to lag.** `src/proxy.ts` sender brukere uten sesjons-cookie til `/login`. Det er bare en rask, optimistisk sjekk. Den egentlige sjekken skjer i `getSession()`, som slår opp sesjonen i databasen og sjekker utløpstid, i hver side, action og rute. Alle spørringer filtreres i tillegg på `userId`, så en annens samtale gir 404.

**Database og validering.** Drizzle mot en lokal SQLite-fil. Kursplanen godtar annen database enn D1 med Next.js. Tabellene `users`, `sessions`, `conversations` og `messages` har vi designet selv. Zod-skjemaer i `src/lib/utils.ts` validerer alt som kommer utenfra før det brukes.

**Innlogging og REST.** Vi laget egen innlogging med bcrypt og sesjoner i databasen. Cookien er `httpOnly` og `sameSite=lax`, og sesjonen utløper etter 7 dager. API-et under `/api/conversations` svarer 200, 201, 204, 400, 401, 404 og 502, også når noe går galt.

### Chat med strømming (RedwoodSDK + Hono)

**Serverkomponenter som standard.** Bare `Chat.tsx` har `"use client"`. `BackendStatus` er en async serverkomponent som sjekker `/api/health` før siden sendes, i stedet for `useEffect`.

**Workeren som proxy.** Alle `/api/*`-kall går gjennom Cloudflare-workeren (`frontend/src/app/lib/backend.ts`) til Hono-backenden. Vi slipper CORS, backend-adressen står ett sted (`wrangler.jsonc`), og workeren svarer 502 hvis backenden er nede.

**SSE over `fetch` med egen parser.** `EventSource` støtter bare GET, og vi sender samtalen med POST. Derfor leser `sse.ts` strømmen selv, også når en hendelse er delt over flere nettverksbiter.

**CSS og sikkerhet.** Styling ligger i én CSS-fil med variabler, maks bredde og mørk modus. `headers.ts` setter CSP og andre sikkerhetshoder før alle ruter.

## 3. Testing

| Type | Hovedappen (`npm test`, `npm run test:e2e`) | Chat-appen (`npm run test:chat`) |
| ---- | ------------------------------------------- | -------------------------------- |
| Enhet | Zod-skjemaer og hjelpefunksjoner, servicen, innlogging | SSE-parseren, `utils.ts`, proxyen |
| Komponent | `ChatForm` og `AuthForm` (Testing Library, jsdom) | `Chat.tsx` |
| Integrasjon | Hovedflyten gjennom de ekte API-rutene, med 400/401/404/204 | Backend-rutene |
| E2e | Playwright: registrer → logg inn → lag samtale → se den igjen | – |

Databasen kjører i minnet, og AI-kall er mocket. Integrasjonstesten fanger feil mellom ruter, service og database, mens e2e-testen fanger feil i grensesnittet.

## 4. Bruk av KI

**Verktøy:** Claude Code (Claude Opus 5.5 og **FYLL INN** modell for omskrivingen), Claude (Markus) og ChatGPT. Hele loggen står i vedlegg D.

- **Hovedappen (Philip):** Claude Code skrev appen om fra Vite/Hono til Next.js den 5. november. Det meste av koden i rota er altså KI-generert. Etterpå brukte vi Claude Opus 5.5 til å vurdere repoet mot oppgavekravene. Vurderingen fant feil i KI-koden: en «test av hjelpefunksjoner» testet funksjoner definert i selve testfila, feil passord ga en krasjside, og `middleware.ts` var utdatert i Next 16. Opus 5.5 rettet feilene og la til tester. Alle commits fra den økta er merket `Co-Authored-By: Claude Opus 5.5`.
- **Chat-appen (Markus):** Claude ble brukt til konfigurasjon (Vite med Cloudflare-pluginen, `wrangler.jsonc`, tsconfig) og som utgangspunkt for CSS-variablene. Ifølge Markus skrev han selv SSE-parseren, chat-funksjonen, proxyen og komponentene. Generert Cloudflare-konfigurasjon bygde ofte på eldre API-versjoner, så importstier og typer måtte rettes mot versjonen vi kjører.

**Hva vi sitter igjen med:** KI tok oss raskt til en app som fungerer, men vi brukte det for sent og for mye på én gang. Mye kode kom inn den siste dagen uten at den andre i gruppa gikk gjennom den først, og det bryter regel 2 i vår egen KI-avtale. Vi lærte at KI-kode må leses og testes like kritisk som annen kode, og at KI-bruken må føres i loggen fortløpende.

## 5. Utfordringer

- **To versjoner samtidig.** Vi endte opp med to apper på forskjellig stack som ble laget parallelt den siste dagen. Vi slo dem sammen i ett repo med npm-workspaces. Til neste gang bør vi bli enige om stack tidlig og jobbe i små branches med pull requests.
- **SQLite i tester og bygg.** `db.transaction()` åpner en ny tilkobling i libsql, og i testene med in-memory-database ga det «no such table». Vi løste det med `db.batch()`. `next build` ga `SQLITE_BUSY` fordi flere workere opprettet tabeller samtidig. Det løste vi med én batch og `busy_timeout`.
- **Skjemaendring uten migreringer.** Etter at `userId` ble lagt til, krasjet appen mot den gamle lokale databasen. Neste gang bruker vi `drizzle-kit` med migreringer.
- **Avhengigheter.** better-auth krasjet på en peer-avhengighet (vite 8), og Vitest 3 i rota kolliderte med Vitest 5 i frontend. Vi valgte egen innlogging og samlet alle prosjektene på Vitest 5.
- **SSE delt over flere biter.** Lange svar kom delt midt i en hendelse. Parseren måtte derfor holde på rester mellom bitene.

## 6. Gruppearbeidet

| Hvem | Hva (fra git-historikken) |
| ---- | ------------------------- |
| Philip André Gaulin (`craftpag`/`cpag`) | Baseline og utkast til KI-avtale (28.09), SSE-branch (08.10), Next.js-appen med innlogging, tester og dokumentasjon (05.11, med KI) |
| Markus Dixon Vinnogg (`MarkusDV`) | Godkjente KI-avtalen (28.09), rapportdisposisjon (01.10), RedwoodSDK-frontend og Hono-backend med SSE (05.11), frontend-dokumentasjon og utkast til rapport |

Arbeidsfordelingen i tid har vært ujevn for oss begge. Det var nesten ingen commits mellom 8. oktober og 5. november, og det meste av koden kom inn den siste dagen. **FYLL INN:** hvordan dere fordelte og samarbeidet, og hvorfor arbeidet ble liggende.

## 7. Læringsutbytte

Dette kan vi nå som vi ikke kunne i august:

- Forskjellen på serverkomponenter og klientkomponenter, og når `"use client"` trengs.
- Server actions og `useActionState`, og hvorfor autorisasjon må håndheves på serveren og ikke bare skjules i grensesnittet.
- Å designe et relasjonelt skjema med Drizzle, med fremmednøkler og eierskap.
- Sesjonsbasert innlogging: bcrypt, `httpOnly`-cookies og utløpstid.
- REST med riktige statuskoder, og strømming med SSE over `fetch`.
- Testing på fire nivåer: enhet, komponent, integrasjon og e2e.
- At KI skriver kode fort, men at vi selv må forstå, gjennomgå og dokumentere den.

## 8. Sign-off uke 40

| Punkt | Status |
| ----- | ------ |
| Kravliste og «ikke med»-liste | Vedlegg A og B |
| Prosessverktøy med fordelte oppgaver | GitHub Projects – **FYLL INN lenke** |
| Designskisser | **Legg ved i `docs/skisser/`** |
| Repo med hele gruppen invitert | Ja, begge har commits i repoet |
| KI-avtale | Vedlegg D, foreløpig bare signert av Markus |
| Alle starter prosjektet lokalt | **FYLL INN, bekreft** |
| Grunnkomponenter og utils | `src/app/components/`, `src/lib/utils.ts`, `frontend/src/app/lib/utils.ts` |
| Minst én test som kjører | `npm run test:all` |
| Disposisjon for rapporten | Commit `bf8bfcb` (28.09) |
| I gang med pensum | **FYLL INN** |

## Vedlegg

- A: [Kravliste](kravliste.md)
- B: [«Ikke med»-liste](ikke-med.md)
- C: Designskisser (`docs/skisser/`)
- D: [KI-avtale og KI-logg](ki-avtale.md)
- E: [Frontend-dokumentasjon for chat-appen](frontend-chat.md) (Markus)
