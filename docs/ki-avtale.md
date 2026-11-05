# KI-avtale

Dette er et utkast. Gruppa går gjennom avtalen, justerer den og godkjenner den ved å skrive navn nederst.

## Formål

Avtalen sier hvordan gruppa bruker KI-verktøy i prosjektet. Da bruker alle KI likt, og bruken kan dokumenteres i rapporten.

## Dette kan KI brukes til

- Grunnoppsett og boilerplate, som prosjektmaler og konfigurasjon
- Forklaring av feilmeldinger, begreper og dokumentasjon
- Forslag til kode og tester, som gruppa selv går gjennom og forstår
- Idémyldring og språkvask

## Dette skal KI ikke brukes til

- Kode som ingen i gruppa kan forklare
- Rapporttekst som limes inn uten å bli bearbeidet
- Å omgå pensum. Alle skal selv forstå det som leveres.

## Regler

1. Den som bruker KI, har ansvaret for resultatet og skal kunne forklare det.
2. Kode laget med KI skal gjennomgås av minst én annen i gruppa før den merges.
3. Vesentlig KI-bruk føres i loggen under og oppsummeres i rapporten.
4. Personopplysninger, passord og API-nøkler skal ikke deles med KI-verktøy.

## Verktøy

| Verktøy | Brukes til |
| ------- | ---------- |
| Claude Code med Claude Opus 5.5 (`claude-opus-5-5`) | Vurdering av prosjektet mot kravene, feilretting, tester og dokumentasjon 5. november (se avsnittet under) |
| Claude Code med Claude Opus 4.6 | Omskriving til Next.js og innlogging 5. november |
| Claude | Grunnoppsett 28.09 |
| ChatGPT | Forklaring av dokumentasjon, eksempler på Next.js App Router |

## Logg over KI-bruk

| Dato | Hva | Verktøy | Hvem |
| ---- | --- | ------- | ---- |
| 28.09.2026 | Grunnoppsett av repoet (baseline), oppgaver i GitHub og utkast til dokumenter i `docs/` | Claude | craftpag |
| 08.10.2026 | SSE-strømming av chat på branchen `chat-med-sse` (ikke merget) | – | craftpag |
| 05.11.2026 (commit 20.56) | RedwoodSDK-frontend og Hono-backend med SSE (branch `frontend-chat`): Claude til Vite/Cloudflare-oppsett, `wrangler.jsonc`, tsconfig og grunnlaget i `styles.css`. Ifølge Markus er SSE-parser, chat, proxy og komponenter skrevet selv | Claude | Markus |
| 05.11.2026 | Første utkast til `prosjektrapport.docx` og `frontend-dokumentasjon.docx` | – | Markus |
| 05.11.2026, 21.09–21.39 | Omskriving fra Vite/Hono til Next.js: ruter, service-lag, Drizzle-skjema, server actions, tester, README og rapportutkast. Commit `52bfb70` (meldingen sier feilaktig Opus 5.5) | Claude Code, Claude Opus 4.6 | craftpag |
| 05.11.2026, 21.52–21.58 | Innlogging med bcrypt og sesjoner, `userId` på samtaler, login- og registreringssider, auth-tester | Claude Code, Claude Opus 4.6 | craftpag |
| 05.11.2026, 21.45–22.30 | Vurdering av repoet mot oppgavekravene og KI-bruken, feilretting, nye tester og dokumentasjon. Commit `f0f61d2` og senere | Claude Code, Claude Opus 5.5 | craftpag |

## Detaljer: bruk av Claude Opus 5.5 (5. november)

Opus 5.5 ble brukt i Claude Code den 5. november, etter at appen var skrevet om til Next.js. Commits fra denne økta har linjen `Co-Authored-By: Claude Opus 5.5` og kan spores med `git log`.

| Hva Opus 5.5 gjorde | Filer |
| ------------------- | ----- |
| Vurderte repoet mot kravene i «Gruppeinnlevering prosjekt + rapport», inkludert hvor mye KI-bruk som var udokumentert | (ingen kodeendring) |
| Committet omskrivingen med en melding om at den var KI-generert | commit `52bfb70` |
| Flyttet hjelpefunksjoner fra testfila inn i appkoden, og skrev testene om til å teste dem | `src/lib/utils.ts`, `__tests__/utils.test.ts` |
| Endret `middleware.ts` til `proxy.ts`, slik Next 16 krever | `src/proxy.ts` |
| La til utløpstid på sesjoner, `sameSite` og `secure` på cookien, og normalisering av e-post | `src/lib/auth.ts`, `src/lib/db.ts` |
| Fikk skjemaene til å vise feilmeldinger med `useActionState` i stedet for å krasje | `src/actions/auth.ts`, `src/actions/conversations.ts`, `src/app/components/AuthForm.tsx`, `src/app/components/ChatForm.tsx`, login- og registreringssidene |
| Validering og statuskoder i API-et: 400 ved ugyldig JSON, 204 ved sletting, 502 ved AI-feil | `src/app/api/conversations/**` |
| Atomisk sletting med `db.batch`, og opprettelse av tabeller med `busy_timeout` (rettet `SQLITE_BUSY` under `next build`) | `src/lib/conversation-service.ts`, `src/lib/db.ts` |
| Komponenttest og integrasjonstest av hovedflyten gjennom API-rutene | `__tests__/components.test.tsx`, `__tests__/hovedflyt.integration.test.ts`, `vitest.config.ts` |
| E2e-test av hovedflyten med Playwright | `e2e/hovedflyt.e2e.ts`, `playwright.config.ts` |
| Validering med Zod-skjemaer i stedet for håndskrevne sjekker | `src/lib/utils.ts`, API-rutene, `src/actions/conversations.ts` |
| Kjørte bygget og testet hovedflyten manuelt i nettleseren | (ingen kodeendring) |
| Oppdaterte KI-avtalen, rapporten og README | `docs/`, `README.md` |

Philip har gått gjennom koden før innlevering (regel 2). Han jobber til daglig med Freshnup.no og Menighetsportalen.no, to KI-baserte plattformer i drift, der det er fast praksis å lese KI-kode før den går i produksjon.

## Godkjent av

| Navn | Dato |
| ---- | ---- |
| Markus | 28.09.2026 |
