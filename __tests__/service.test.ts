import { describe, expect, it, beforeEach, vi } from "vitest"
import { db, conversations, messages } from "@/lib/db"
import {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  sendMessage,
} from "@/lib/conversation-service"

// Mock AI slik at vi slipper ekte API-kall
vi.mock("@/lib/ai", () => ({
  askAI: vi.fn(async () => "Testsvar fra AI"),
}))

// Rydd opp mellom tester
beforeEach(async () => {
  await db.delete(messages)
  await db.delete(conversations)
})

// --- Enhetstester av service-laget ---

describe("listConversations", () => {
  it("returnerer tom liste", async () => {
    const result = await listConversations()
    expect(result).toEqual([])
  })

  it("returnerer samtaler sortert nyest først", async () => {
    await createConversation("Første", "openai")
    await createConversation("Andre", "anthropic")

    const result = await listConversations()
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe("Andre")
  })
})

describe("createConversation", () => {
  it("oppretter en samtale", async () => {
    const convo = await createConversation("Test", "openai")
    expect(convo.title).toBe("Test")
    expect(convo.provider).toBe("openai")
    expect(convo.id).toBeDefined()
  })
})

describe("getConversation", () => {
  it("returnerer samtale med meldinger", async () => {
    const convo = await createConversation("Test", "openai")
    const result = await getConversation(convo.id)

    expect(result).not.toBeNull()
    expect(result!.title).toBe("Test")
    expect(result!.messages).toEqual([])
  })

  it("returnerer null for ukjent id", async () => {
    const result = await getConversation(999)
    expect(result).toBeNull()
  })
})

describe("deleteConversation", () => {
  it("sletter samtale og meldinger", async () => {
    const convo = await createConversation("Slett meg", "openai")
    await sendMessage(convo.id, "Hei")
    await deleteConversation(convo.id)

    const result = await getConversation(convo.id)
    expect(result).toBeNull()
  })
})

describe("sendMessage", () => {
  it("lagrer melding og AI-svar", async () => {
    const convo = await createConversation("Chat", "openai")
    const reply = await sendMessage(convo.id, "Hva er 2+2?")

    expect(reply.role).toBe("assistant")
    expect(reply.content).toBe("Testsvar fra AI")
  })

  it("kaster feil for ukjent samtale", async () => {
    await expect(sendMessage(999, "Hei")).rejects.toThrow(
      "Samtale ikke funnet"
    )
  })
})

// --- Integrasjonstest av hovedflyten ---

describe("Hovedflyt: opprett → send melding → se igjen", () => {
  it("gjennomfører hele flyten", async () => {
    // 1. Opprett en samtale
    const convo = await createConversation("Min samtale", "openai")
    expect(convo.id).toBeDefined()

    // 2. Send en melding
    const reply = await sendMessage(convo.id, "Hei, hva er 2+2?")
    expect(reply.content).toBe("Testsvar fra AI")

    // 3. Hent samtalen og sjekk meldingene
    const result = await getConversation(convo.id)
    expect(result).not.toBeNull()
    expect(result!.messages).toHaveLength(2)
    expect(result!.messages[0].role).toBe("user")
    expect(result!.messages[0].content).toBe("Hei, hva er 2+2?")
    expect(result!.messages[1].role).toBe("assistant")
    expect(result!.messages[1].content).toBe("Testsvar fra AI")
  })
})
