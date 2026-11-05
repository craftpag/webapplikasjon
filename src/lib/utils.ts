// Hjelpefunksjoner for validering som brukes av både API-ruter og server actions.

export const PROVIDERS = ["openai", "anthropic"] as const
export type Provider = (typeof PROVIDERS)[number]

export const MAX_TITLE_LENGTH = 100
export const MAX_MESSAGE_LENGTH = 4000

export function isValidProvider(value: unknown): value is Provider {
  return typeof value === "string" && PROVIDERS.includes(value as Provider)
}

// Gjør om en id fra URL eller skjema til et positivt heltall, ellers null.
export function parseId(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null
  const id = Number(value)
  return id > 0 && Number.isSafeInteger(id) ? id : null
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Returnerer en feilmelding, eller null hvis tittelen er gyldig.
export function validateTitle(title: unknown): string | null {
  if (typeof title !== "string" || !title.trim()) return "Tittel er påkrevd"
  if (title.length > MAX_TITLE_LENGTH) {
    return `Tittelen kan maks være ${MAX_TITLE_LENGTH} tegn`
  }
  return null
}

// Returnerer en feilmelding, eller null hvis meldingen er gyldig.
export function validateMessage(content: unknown): string | null {
  if (typeof content !== "string" || !content.trim()) {
    return "Meldingen kan ikke være tom"
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    return `Meldingen kan maks være ${MAX_MESSAGE_LENGTH} tegn`
  }
  return null
}
