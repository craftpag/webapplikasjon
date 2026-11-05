import { eq, desc } from "drizzle-orm"
import { db, conversations, messages } from "./db"
import { askAI } from "./ai"

// Hent alle samtaler
export async function listConversations() {
  return db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.createdAt))
}

// Opprett ny samtale
export async function createConversation(title: string, provider: string) {
  const [result] = await db
    .insert(conversations)
    .values({
      title,
      provider,
      createdAt: new Date().toISOString(),
    })
    .returning()

  return result
}

// Hent én samtale med meldinger
export async function getConversation(id: number) {
  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))

  if (!convo) return null

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt)

  return { ...convo, messages: msgs }
}

// Slett en samtale og alle meldingene
export async function deleteConversation(id: number) {
  await db.delete(messages).where(eq(messages.conversationId, id))
  await db.delete(conversations).where(eq(conversations.id, id))
}

// Send melding og få svar fra AI
export async function sendMessage(conversationId: number, content: string) {
  // Finn samtalen
  const [convo] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))

  if (!convo) throw new Error("Samtale ikke funnet")

  // Lagre brukerens melding
  await db.insert(messages).values({
    conversationId,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  })

  // Hent hele historikken for kontekst
  const allMsgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)

  const chatHistory = allMsgs.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Kall AI
  const answer = await askAI(convo.provider, chatHistory)

  // Lagre svaret
  await db.insert(messages).values({
    conversationId,
    role: "assistant",
    content: answer,
    createdAt: new Date().toISOString(),
  })

  return { role: "assistant" as const, content: answer }
}
