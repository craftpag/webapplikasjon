// Validering av data som kommer utenfra (request body, skjema, URL).
// TypeScript sjekker bare når koden bygges. Zod sjekker dataene når appen kjører.
import { z } from "zod"

export const PROVIDERS = ["openai", "anthropic"] as const
export type Provider = (typeof PROVIDERS)[number]

export const MAX_TITLE_LENGTH = 100
export const MAX_MESSAGE_LENGTH = 4000

export const providerSchema = z.enum(PROVIDERS, {
  error: "Leverandør må være 'openai' eller 'anthropic'",
})

export const titleSchema = z
  .string({ error: "Tittel er påkrevd" })
  .trim()
  .min(1, "Tittel er påkrevd")
  .max(MAX_TITLE_LENGTH, `Tittelen kan maks være ${MAX_TITLE_LENGTH} tegn`)

export const messageSchema = z
  .string({ error: "Meldingen kan ikke være tom" })
  .refine((s) => s.trim().length > 0, "Meldingen kan ikke være tom")
  .refine(
    (s) => s.length <= MAX_MESSAGE_LENGTH,
    `Meldingen kan maks være ${MAX_MESSAGE_LENGTH} tegn`
  )

// Body for POST /api/conversations og skjemaet på forsiden
export const createConversationSchema = z.object({
  title: titleSchema,
  provider: providerSchema,
})

// Body for POST /api/conversations/:id/messages
export const sendMessageSchema = z.object({
  content: messageSchema,
})

// Id fra URL eller skjema: bare sifre, og større enn 0
const idSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER))

// Henter første feilmelding fra en Zod-feil, til bruk i 400-svar og skjema
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Ugyldig input"
}

export function isValidProvider(value: unknown): value is Provider {
  return providerSchema.safeParse(value).success
}

// Gjør om en id fra URL eller skjema til et positivt heltall, ellers null.
export function parseId(value: unknown): number | null {
  const result = idSchema.safeParse(value)
  return result.success ? result.data : null
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return z.email().safeParse(email).success
}

// Returnerer en feilmelding, eller null hvis tittelen er gyldig.
export function validateTitle(title: unknown): string | null {
  const result = titleSchema.safeParse(title)
  return result.success ? null : firstError(result.error)
}

// Returnerer en feilmelding, eller null hvis meldingen er gyldig.
export function validateMessage(content: unknown): string | null {
  const result = messageSchema.safeParse(content)
  return result.success ? null : firstError(result.error)
}
