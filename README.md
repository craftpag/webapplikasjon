# Webapplikasjon

Gruppeprosjekt i ITF31619 Webapplikasjoner.

## Kom i gang

Krever Node.js 22.12 eller nyere.

```bash
git clone https://github.com/craftpag/webapplikasjon.git
cd webapplikasjon
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/health

Under utvikling videresender frontend alle `/api`-kall til backend (se `frontend/vite.config.ts`).

## Skript

| Kommando        | Hva den gjør                            |
| --------------- | --------------------------------------- |
| `npm run dev`   | Starter frontend og backend samtidig    |
| `npm test`      | Kjører testene i begge prosjektene      |
| `npm run build` | Bygger begge prosjektene                |
| `npm run lint`  | Linter frontend                         |

Kjør et skript i bare ett av prosjektene med `-w`, for eksempel `npm test -w backend`.

## Struktur

```
frontend/   React + TypeScript (Vite), testet med Vitest og Testing Library
backend/    Hono på Node.js, testet med Vitest
docs/       Kravliste, «ikke med»-liste, KI-avtale, skisser og rapport
```

Alt i `docs/` fra sign-off i uke 40 skal være med i den endelige innleveringen (frist 5.11 kl. 23:59).
