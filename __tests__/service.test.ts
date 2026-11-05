import { describe, expect, it, beforeEach, vi } from "vitest"
import { db, conversations, messages, users } from "@/lib/db"
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
} from "@/lib/conversation-service"
import bcrypt from "bcryptjs"

vi.mock("@/lib/ai", () => ({
  askAI: vi.fn(async () => "Testsvar fra AI"),
}))

let testUserId: number

beforeEach(async () => {
  await db.delete(messages)
  await db.delete(conversations)
  await db.delete(users)

  const hash = await bcrypt.hash("test123", 10)
  const [user] = await db
    .insert(users)
    .values({
      email: "test@test.no",
      name: "Test",
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    })
    .returning()

  testUserId = user.id
})

describe("listConversations", () => {
  it("returnerer tom liste", async () => {
    const result = await listConversations(testUserId)
    expect(result).toEqual([])
  })

  it("returnerer bare brukerens samtaler", async () => {
    await createConversation(testUserId, "Min samtale", "openai")

    const result = await listConversations(testUserId)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe("Min samtale")
  })

  it("returnerer samtaler sortert nyest forst", async () => {
    await createConversation(testUserId, "Forste", "openai")
    await new Promise((r) => setTimeout(r, 10))
    await createConversation(testUserId, "Andre", "anthropic")

    const result = await listConversations(testUserId)
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe("Andre")
  })
})

describe("createConversation", () => {
  it("oppretter en samtale", async () => {
    const convo = await createConversation(testUserId, "Test", "openai")
    expect(convo.title).toBe("Test")
    expect(convo.provider).toBe("openai")
    expect(convo.userId).toBe(testUserId)
    expect(convo.id).toBeDefined()
  })
})

describe("getConversation", () => {
  it("returnerer samtale med meldinger", async () => {
    const convo = await createConversation(testUserId, "Test", "openai")
    const result = await getConversation(convo.id, testUserId)

    expect(result).not.toBeNull()
    expect(result!.title).toBe("Test")
    expect(result!.messages).toEqual([])
  })

  it("returnerer null for ukjent id", async () => {
    const result = await getConversation(999, testUserId)
    expect(result).toBeNull()
  })

  it("returnerer null for andres samtale", async () => {
    const convo = await createConversation(testUserId, "Test", "openai")
    const result = await getConversation(convo.id, 999)
    expect(result).toBeNull()
  })
})

describe("deleteConversation", () => {
  it("sletter samtale og meldinger", async () => {
    const convo = await createConversation(testUserId, "Slett meg", "openai")
    await sendMessage(convo.id, testUserId, "Hei")
    await deleteConversation(convo.id, testUserId)

    const result = await getConversation(convo.id, testUserId)
    expect(result).toBeNull()
  })
})

describe("sendMessage", () => {
  it("lagrer melding og AI-svar", async () => {
    const convo = await createConversation(testUserId, "Chat", "openai")
    const reply = await sendMessage(convo.id, testUserId, "Hva er 2+2?")

    expect(reply.role).toBe("assistant")
    expect(reply.content).toBe("Testsvar fra AI")
  })

  it("kaster feil for ukjent samtale", async () => {
    await expect(sendMessage(999, testUserId, "Hei")).rejects.toThrow(
      "Samtale ikke funnet"
    )
  })

  it("kaster feil for andres samtale", async () => {
    const convo = await createConversation(testUserId, "Chat", "openai")
    await expect(sendMessage(convo.id, 999, "Hei")).rejects.toThrow(
      "Samtale ikke funnet"
    )
  })
})

describe("Hovedflyt: opprett -> send melding -> se igjen", () => {
  it("gjennomforer hele flyten", async () => {
    const convo = await createConversation(testUserId, "Min samtale", "openai")
    expect(convo.id).toBeDefined()

    const reply = await sendMessage(convo.id, testUserId, "Hei, hva er 2+2?")
    expect(reply.content).toBe("Testsvar fra AI")

    const result = await getConversation(convo.id, testUserId)
    expect(result).not.toBeNull()
    expect(result!.messages).toHaveLength(2)
    expect(result!.messages[0].role).toBe("user")
    expect(result!.messages[0].content).toBe("Hei, hva er 2+2?")
    expect(result!.messages[1].role).toBe("assistant")
    expect(result!.messages[1].content).toBe("Testsvar fra AI")
  })
})
