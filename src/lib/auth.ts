import { db, users, sessions } from "./db"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { cookies } from "next/headers"
import { normalizeEmail } from "./utils"

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 dager

export async function register(email: string, name: string, password: string) {
  const cleanEmail = normalizeEmail(email)

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, cleanEmail))

  if (existing.length > 0) {
    throw new Error("E-posten er allerede registrert")
  }

  const hash = await bcrypt.hash(password, 10)

  const [user] = await db
    .insert(users)
    .values({
      email: cleanEmail,
      name: name.trim(),
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    })
    .returning()

  return user
}

export async function login(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))

  if (!user) return null

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return null

  const token = crypto.randomUUID()
  const now = Date.now()
  await db.insert(sessions).values({
    id: token,
    userId: user.id,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
  })

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return user
}

// Henter innlogget bruker fra sesjons-cookien. Brukes som autorisasjonssjekk
// i server-komponenter, server actions og API-ruter.
export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) return null

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, token))

  if (!session) return null

  // Utløpte sesjoner slettes og regnes som utlogget
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, token))
    return null
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))

  return user || null
}

export async function logout() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token))
  }

  cookieStore.delete("session")
}
