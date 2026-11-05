// Integrasjonstest av hovedflyten gjennom de ekte API-rutene:
// registrer -> logg inn -> opprett samtale -> send melding -> se samtalen igjen.
// Bare cookies og AI-kallet er mocket. Databasen er ekte (in-memory SQLite).
import { describe, expect, it, beforeEach, vi } from "vitest"
import { db, users, sessions, conversations, messages } from "@/lib/db"
import { register, login } from "@/lib/auth"
import * as listRoute from "@/app/api/conversations/route"
import * as itemRoute from "@/app/api/conversations/[id]/route"
import * as messagesRoute from "@/app/api/conversations/[id]/messages/route"

const { jar } = vi.hoisted(() => ({ jar: new Map<string, string>() }))

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name)! } : undefined,
    set: (name: string, value: string) => jar.set(name, value),
    delete: (name: string) => jar.delete(name),
  }),
}))

vi.mock("@/lib/ai", () => ({
  askAI: vi.fn(async () => "Svar fra AI"),
}))

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const params = (id: number | string) => ({
  params: Promise.resolve({ id: String(id) }),
})

beforeEach(async () => {
  jar.clear()
  await db.delete(messages)
  await db.delete(conversations)
  await db.delete(sessions)
  await db.delete(users)
})

describe("Hovedflyt gjennom API-et", () => {
  it("logg inn, lag samtale, send melding og se den igjen", async () => {
    // 1. Registrer og logg inn (setter sesjons-cookie)
    await register("ola@test.no", "Ola", "hemmelig123")
    const user = await login("ola@test.no", "hemmelig123")
    expect(user).not.toBeNull()
    expect(jar.get("session")).toBeDefined()

    // 2. Opprett samtale
    const createRes = await listRoute.POST(
      jsonRequest({ title: "Min samtale", provider: "openai" })
    )
    expect(createRes.status).toBe(201)
    const convo = await createRes.json()

    // 3. Send melding
    const msgRes = await messagesRoute.POST(
      jsonRequest({ content: "Hei!" }),
      params(convo.id)
    )
    expect(msgRes.status).toBe(201)
    expect((await msgRes.json()).content).toBe("Svar fra AI")

    // 4. Se samtalen igjen, i lista og med meldingene
    const listRes = await listRoute.GET()
    const list = await listRes.json()
    expect(list).toHaveLength(1)
    expect(list[0].title).toBe("Min samtale")

    const getRes = await itemRoute.GET(new Request("http://localhost"), params(convo.id))
    expect(getRes.status).toBe(200)
    const full = await getRes.json()
    expect(full.messages.map((m: { role: string }) => m.role)).toEqual([
      "user",
      "assistant",
    ])
  })

  it("gir 401 uten innlogging", async () => {
    const res = await listRoute.GET()
    expect(res.status).toBe(401)
  })

  it("gir 400 for ugyldig input og ugyldig JSON", async () => {
    await register("ola@test.no", "Ola", "hemmelig123")
    await login("ola@test.no", "hemmelig123")

    const badProvider = await listRoute.POST(
      jsonRequest({ title: "x", provider: "google" })
    )
    expect(badProvider.status).toBe(400)

    const badJson = await listRoute.POST(
      new Request("http://localhost/api", { method: "POST", body: "{ikke json" })
    )
    expect(badJson.status).toBe(400)
  })

  it("gir 404 når man prøver å lese eller slette en annens samtale", async () => {
    await register("ola@test.no", "Ola", "hemmelig123")
    await login("ola@test.no", "hemmelig123")
    const convo = await (
      await listRoute.POST(jsonRequest({ title: "Privat", provider: "openai" }))
    ).json()

    // Kari logger inn i samme "nettleser" og får en ny sesjon
    await register("kari@test.no", "Kari", "hemmelig123")
    await login("kari@test.no", "hemmelig123")

    const getRes = await itemRoute.GET(new Request("http://localhost"), params(convo.id))
    expect(getRes.status).toBe(404)

    const delRes = await itemRoute.DELETE(new Request("http://localhost"), params(convo.id))
    expect(delRes.status).toBe(404)
  })

  it("gir 204 når eier sletter samtalen", async () => {
    await register("ola@test.no", "Ola", "hemmelig123")
    await login("ola@test.no", "hemmelig123")
    const convo = await (
      await listRoute.POST(jsonRequest({ title: "Slett", provider: "openai" }))
    ).json()

    const res = await itemRoute.DELETE(new Request("http://localhost"), params(convo.id))
    expect(res.status).toBe(204)
  })
})
