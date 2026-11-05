# Prosjektrapport

ITF31619 Webapplikasjoner – Høst 2026

**Gruppe:** W11  
**Medlemmer:** Philip André Gaulin, Markus Dixon Vinnogg  
**GitHub:** https://github.com/craftpag/webapplikasjon  

## 1. Prosjektet

GPT Wrapper er en chat-app der brukeren snakker med språkmodeller fra OpenAI og Anthropic gjennom ett felles grensesnitt. Brukeren registrerer seg, logger inn, oppretter en samtale med valgt leverandør, sender meldinger og finner samtalen igjen senere. Samtalene lagres i en database, og hver bruker ser bare sine egne. Uten API-nøkler svarer appen i demo-modus, så den kan prøves uten nøkler.

Repoet har to deler. Hovedappen er bygget med Next.js og ligger i rota. Det er den som dekker kravene til database, innlogging, server actions og hovedflyt. I tillegg ligger en egen chat i frontend/ og backend/, bygget med RedwoodSDK og Hono, der svaret strømmes inn ord for ord med Server-Sent Events (SSE). Den har ingen brukerkontoer eller lagring, men viser hvordan strømming fungerer ende til ende. Designet fra denne chatten brukes også i hovedappen.

Hovedflyten: brukeren logger inn, skriver en tittel og velger leverandør på forsiden. En server action oppretter samtalen og sender brukeren til chatvisningen. Når brukeren sender en melding, lagres den, hele historikken sendes til modellen, og svaret lagres og vises. Går brukeren tilbake til forsiden, ligger samtalen i lista.

## 2. Arkitekturvalg

**Next.js med serverkomponenter.** Kurset anbefaler RedwoodSDK, men Next.js er godtatt. Forsiden og chatvisningen er serverkomponenter som henter data direkte fra service-laget, uten useEffect og uten egen laster-state. Bare skjemaene trenger state, så ChatForm, AuthForm og LogoutButton er klientkomponenter. All skriving skjer i server actions, og innloggingsskjemaene bruker useActionState for å vise feilmeldinger fra serveren.

**Service-lag mellom ruter og database.** Logikken ligger i conversation-service.ts og auth.ts. Både REST-rutene og server actions kaller de samme funksjonene, så reglene står ett sted og kan testes uten Next.js.

**Autorisasjon på serveren.** proxy.ts sender brukere uten sesjons-cookie til /login, men det er bare en rask sjekk. Den egentlige kontrollen skjer i getSession(), som slår opp sesjonen i databasen og sjekker at den ikke er utløpt, i hver side, action og rute. Alle spørringer filtreres i tillegg på userId, så den som prøver å åpne eller slette en annens samtale, får 404.

**Database og validering.** Vi bruker Drizzle mot en lokal SQLite-fil, som kursplanen godtar sammen med Next.js. Skjemaet har fire tabeller vi har designet selv: users, sessions, conversations og messages. Data som kommer utenfra valideres med Zod før det brukes, siden TypeScript bare sjekker typer når koden bygges.

**Innlogging og REST.** Vi laget egen innlogging med bcrypt og sesjoner i databasen. Cookien er httpOnly og sameSite=lax og utløper etter sju dager. REST-API-et under /api/conversations svarer 201 når noe opprettes, 204 ved sletting, 400 ved ugyldig input, 401 uten innlogging, 404 når samtalen ikke finnes og 502 når AI-leverandøren feiler.

**Strømming i chat-appen.** I RedwoodSDK-chatten går alle /api-kall gjennom Cloudflare-workeren til Hono-backenden, så vi slipper CORS, og backend-adressen står ett sted. EventSource støtter bare GET, og vi sender samtalen med POST, så sse.ts leser strømmen selv, også når en hendelse kommer delt over flere nettverksbiter.

**Tester.** Vitest dekker hjelpefunksjonene og Zod-skjemaene, servicen og innloggingen, to komponenter med Testing Library og hovedflyten gjennom de ekte API-rutene med databasen i minnet. En Playwright-test går gjennom hele flyten i en ekte nettleser. Chat-appen har egne tester av SSE-parseren, proxyen og Chat-komponenten.

## 3. KI

Begge brukte Claude. Philip brukte Claude Code med Claude Opus 4.6 til å skrive hovedappen om fra Vite og Hono til Next.js og til å legge til innloggingen den 5. november, så det meste av koden i rota er KI-generert. Etterpå brukte vi Claude Opus 5.5 til å vurdere repoet mot oppgavekravene. Vurderingen fant feil i KI-koden: en test av hjelpefunksjoner testet funksjoner som var definert i selve testfila, feil passord ga en krasjside, og middleware.ts var utdatert i Next 16. Opus 5.5 rettet feilene, la til tester og tok designet fra chat-appen i bruk i hovedappen. Alle commits fra den økta er merket med Co-Authored-By: Claude Opus 5.5.

Markus brukte Claude til konfigurasjonen av Vite med Cloudflare-pluginen, wrangler.jsonc og tsconfig, og som utgangspunkt for CSS-variablene. Ifølge Markus skrev han selv SSE-parseren, chat-funksjonen, proxyen og komponentene. Generert Cloudflare-konfigurasjon bygde ofte på eldre API-versjoner, så importstier og typer måtte rettes mot versjonen vi faktisk kjører.

Vi sitter igjen med at KI tok oss raskt til en app som fungerer, men at vi brukte det for sent og for mye på én gang. Mye kode kom inn den siste dagen uten at den andre gikk gjennom den først, og det bryter vår egen KI-avtale. Vi har lært at KI-kode må leses og testes like kritisk som annen kode, og at bruken må føres i loggen fortløpende. Hele loggen står i vedlegg D.

## 4. Utfordringer

Den største utfordringen var at vi endte opp med to versjoner på forskjellig stack, laget parallelt den siste dagen. Vi slo dem sammen i ett repo med npm-workspaces og tok designet fra chat-appen inn i hovedappen. Sammenslåingen ga nye problemer: Vitest 3 og 5 og to kopier av React kolliderte, og dev-serveren lastet siden på nytt flere ganger i sekundet til vi satte turbopack.root eksplisitt.

SQLite ga også problemer. db.transaction() åpner en ny tilkobling i libsql, og med databasen i minnet i testene ga det «no such table». Vi byttet til db.batch(), som også er atomisk. next build ga SQLITE_BUSY fordi flere workere opprettet tabeller samtidig, og det løste vi med én batch og busy_timeout. Da vi la til userId, krasjet appen mot den gamle lokale databasen, fordi vi ikke bruker migreringer. Neste gang bruker vi drizzle-kit fra starten. I chat-appen kom lange svar delt midt i en SSE-hendelse, så parseren måtte holde på resten mellom bitene.

## 5. Gruppearbeidet

Philip satte opp repoet og utkastet til KI-avtalen 28. september, laget en første SSE-versjon på en egen branch 8. oktober, og laget Next.js-appen med innlogging, tester og dokumentasjon 5. november. Markus godkjente KI-avtalen, jobbet med disposisjonen til rapporten 1. oktober, og laget RedwoodSDK-frontenden og Hono-backenden med SSE, frontend-dokumentasjonen og første utkast til denne rapporten 5. november.

Arbeidsfordelingen i tid har vært ujevn for oss begge. Det var nesten ingen commits mellom 8. oktober og 5. november, og det meste av koden kom inn den siste dagen. Vi jobbet hver for oss i stedet for i små branches med pull requests, og det er hovedgrunnen til at vi fikk to versjoner. [FYLL INN: hvordan dere fordelte og kommuniserte, og hvorfor arbeidet ble liggende i oktober.]

## 6. Læringsutbytte

I august kunne vi ikke skille mellom server- og klientkomponenter. Nå vet vi at det meste kan rendres på serveren, og at "use client" bare trengs der det er state og hendelser. Vi kan skrive server actions og bruke useActionState, og vi forstår hvorfor autorisasjon må håndheves på serveren og ikke bare skjules i grensesnittet.

Vi kan designe et relasjonelt skjema med Drizzle, med fremmednøkler og eierskap, og bygge sesjonsbasert innlogging med bcrypt, httpOnly-cookies og utløpstid. Vi kan lage REST-endepunkter med riktige statuskoder også når noe går galt, og strømme svar med SSE over fetch. Vi har skrevet tester på fire nivåer og vet hva hver av dem fanger og ikke fanger. Til sist har vi lært at KI skriver kode fort, men at vi selv må forstå, gjennomgå og dokumentere den.

---

## Vedlegg A: Sign-off uke 40

Kravlista og «ikke med»-lista står i vedlegg B og C. Som prosessverktøy brukte vi GitHub Issues med etiketten sign-off (github.com/craftpag/webapplikasjon/issues). Ni oppgaver ble opprettet 28.–30. september, og de åtte som er tildelt noen, er tildelt Markus. Bare oppsettet av repoet er lukket. Designskissene ble ikke lagt i repoet, og oppgaven for dem står fortsatt åpen. Repoet ble opprettet på GitHub, og begge har commits der. KI-avtalen står i vedlegg D. [FYLL INN: bekreft at begge startet prosjektet lokalt.] Grunnkomponenter og hjelpefunksjoner ligger i src/app/components og src/lib/utils.ts, og alle testene kjøres med npm run test:all. Disposisjonen for rapporten ble lagt inn 28. september. [FYLL INN: hvordan dere har jobbet med pensum.]

## Vedlegg B: Kravliste

Brukeren skal kunne registrere seg med e-post, navn og passord, logge inn og få en sesjon, opprette en samtale med valgt AI-leverandør, sende en melding og få svar, se alle sine samtaler, se én samtale med alle meldingene og slette en samtale. Beskyttede ruter krever innlogging, og input valideres med riktige feilmeldinger og statuskoder. Alle de funksjonelle kravene er ferdige.

Passord lagres som bcrypt-hash og aldri i klartekst. API-nøkler leses fra miljøvariabler og er ikke hardkodet. API-et følger REST med riktige metoder og statuskoder. Koden er testet med Vitest og Playwright, og appen fungerer i demo-modus uten API-nøkler.

## Vedlegg C: «Ikke med»

Hovedappen strømmer ikke svarene. Det gjør bare chat-appen i frontend/ og backend/, mens Next.js-appen venter på hele svaret. Appen er ikke deployet til Cloudflare og bruker SQLite lokalt i stedet for D1, men skjemaet kan flyttes. Vi bruker ikke migreringer med drizzle-kit, siden tabellene opprettes ved oppstart. Det er ingen rate limiting på innlogging eller AI-kall, men meldinger er begrenset til 4000 tegn.

Vi har ikke e-postbekreftelse eller glemt passord, fordi det krever en e-posttjeneste. OAuth-innlogging valgte vi bort for å lære hvordan innlogging fungerer. Vi har heller ikke admin-panel, filvedlegg, valg av modell, profilside eller mobilapp, og svarene vises som ren tekst uten markdown.

## Vedlegg D: KI-avtale og logg

Avtalen sier at KI kan brukes til oppsett, forklaring av feilmeldinger og dokumentasjon, forslag til kode og tester som gruppa selv går gjennom, og språkvask. KI skal ikke brukes til kode ingen i gruppa kan forklare, til rapporttekst som limes inn uten bearbeiding, eller til å omgå pensum. Den som bruker KI har ansvaret for resultatet, KI-kode skal gjennomgås av den andre før merge, vesentlig bruk skal føres i loggen, og personopplysninger og nøkler skal ikke deles med KI-verktøy. Avtalen er signert av Markus 28. september. [FYLL INN: Philip signerer.]

28. september satte Philip opp repoet og utkast til dokumentene med Claude. 8. oktober laget Philip SSE-strømming på branchen chat-med-sse [FYLL INN: verktøy]. 5. november kl. 20.56 la Markus inn RedwoodSDK-frontenden og Hono-backenden, der Claude ble brukt til oppsett, konfigurasjon og CSS-variabler [FYLL INN: modell]. Samme kveld laget han prosjektrapporten og frontend-dokumentasjonen [FYLL INN: verktøy]. Mellom kl. 21.09 og 21.39 skrev Philip appen om til Next.js med Claude Code og Claude Opus 4.6, og mellom kl. 21.52 og 21.58 kom innloggingen i samme økt. Commit-meldingen for omskrivingen sier feilaktig Opus 5.5.

Fra kl. 21.45 brukte Philip Claude Code med Claude Opus 5.5. Opus 5.5 vurderte repoet mot oppgavekravene og KI-bruken, flyttet hjelpefunksjonene inn i appen og testet dem, endret middleware.ts til proxy.ts, la til utløpstid og sikrere cookie på sesjonene, fikk skjemaene til å vise feilmeldinger, rettet statuskodene i API-et, byttet til Zod-validering, la til komponenttest, integrasjonstest og e2e-test, slo sammen Markus sin branch med main, fikset reload-løkka i dev-serveren, tok designet fra chat-appen i bruk og oppdaterte dokumentasjonen. [FYLL INN: hvem som har gått gjennom koden.]
