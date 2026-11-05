# Ikke med

Ting vi vurderte, men valgte bort eller ikke rakk:

| #  | Funksjon | Grunn |
| -- | -------- | ----- |
| 1  | Strømming (SSE) i hovedappen | Finnes i chat-appen i `frontend/` og `backend/`, men ikke i Next.js-appen, som venter på hele svaret |
| 2  | Deployment til Cloudflare og D1 | Appen kjører bare lokalt med SQLite. Skjemaet er SQLite og kan flyttes til D1 |
| 3  | Migreringer med drizzle-kit | Tabellene opprettes med `CREATE TABLE IF NOT EXISTS` ved oppstart |
| 4  | Tailwind og egen mobiltilpasning | Enkel inline-stil med maks bredde, ikke testet grundig på mobil |
| 5  | Rate limiting på innlogging og AI-kall | Ikke prioritert. Meldinger er begrenset til 4000 tegn |
| 6  | E-postbekreftelse og glemt passord | Krever e-posttjeneste. Registrering sier derfor rett ut om e-posten er tatt |
| 7  | OAuth-innlogging (Google/GitHub) | Valgte enkel e-post og passord for å lære hvordan innlogging fungerer |
| 8  | Admin-panel | Ikke nødvendig for MVP |
| 9  | Filvedlegg i samtaler | For komplekst for tidsrammen |
| 10 | Valg av spesifikk AI-modell | Hardkodet til én modell per leverandør |
| 11 | Brukerinnstillinger og profilside | Kan legges til senere |
| 12 | Mobilapp | Bare webgrensesnitt |
