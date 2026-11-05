# Kravliste

## Funksjonelle krav

| #   | Krav                                                      | Status |
| --- | --------------------------------------------------------- | ------ |
| F1  | Bruker kan registrere seg med e-post, navn og passord     | Ferdig |
| F2  | Bruker kan logge inn og får en sesjon                     | Ferdig |
| F3  | Bruker kan opprette samtale med valgt AI-leverandør       | Ferdig |
| F4  | Bruker kan sende melding og få svar fra AI                | Ferdig |
| F5  | Bruker kan se alle sine samtaler                          | Ferdig |
| F6  | Bruker kan se én samtale med alle meldinger               | Ferdig |
| F7  | Bruker kan slette en samtale                              | Ferdig |
| F8  | Beskyttede ruter krever innlogging                        | Ferdig |
| F9  | Validering av input med riktige feilmeldinger og koder    | Ferdig |

## Ikke-funksjonelle krav

| #   | Krav                                                   | Status |
| --- | ------------------------------------------------------ | ------ |
| NF1 | Passord lagres som bcrypt-hash, aldri i klartekst      | Ferdig |
| NF2 | API-nøkler leses fra miljøvariabler, ikke hardkodet    | Ferdig |
| NF3 | REST API med riktige HTTP-metoder og statuskoder       | Ferdig |
| NF4 | Enhetstester og integrasjonstester med Vitest          | Ferdig |
| NF5 | Demo-modus som fungerer uten API-nøkler                | Ferdig |
