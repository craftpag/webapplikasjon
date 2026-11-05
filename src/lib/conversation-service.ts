import { eq, desc, and, asc } from "drizzle-orm"
import { db, conversations, messages } from "./db"
import { askAI } from "./ai"

export async function listConversations(userId: number) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt))
}

export async function createConversation(
  userId: number,
  title: string,
  provider: string
) {
  const [result] = await db
    .insert(conversations)
    .values({
      userId,
      title,
      provider,
      createdAt: new Date().toISOString(),
    })
    .returning()

  return result
}

export async function getConversation(id: number, userId: number) {
  const [convo] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))

  if (!convo) return null

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.id))

  return { ...convo, messages: msgs }
}

export async function deleteConversation(id: number, userId: number) {
  const [convo] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))

  if (!convo) throw new Error("Samtale ikke funnet")

  // batch kjører begge slettingene atomisk (alt eller ingenting).
  // db.transaction() åpner en ny tilkobling i libsql, og fungerer ikke med :memory:.
  await db.batch([
    db.delete(messages).where(eq(messages.conversationId, id)),
    db.delete(conversations).where(eq(conversations.id, id)),
  ])
}

export async function sendMessage(
  conversationId: number,
  userId: number,
  content: string
) {
  const [convo] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId)
      )
    )

  if (!convo) throw new Error("Samtale ikke funnet")

  const allMsgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.id))

  const chatHistory = [
    ...allMsgs.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content },
  ]

  const answer = await askAI(convo.provider, chatHistory)

  await db.insert(messages).values([
    {
      conversationId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    },
    {
      conversationId,
      role: "assistant",
      content: answer,
      createdAt: new Date().toISOString(),
    },
  ])

  return { role: "assistant" as const, content: answer }
}
