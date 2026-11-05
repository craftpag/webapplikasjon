import { describe, expect, it, beforeEach, vi } from "vitest"
import { db, users, sessions } from "@/lib/db"
import { register, login } from "@/lib/auth"

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

beforeEach(async () => {
  await db.delete(sessions)
  await db.delete(users)
})

describe("register", () => {
  it("oppretter en ny bruker", async () => {
    const user = await register("test@test.no", "Test", "passord123")
    expect(user.email).toBe("test@test.no")
    expect(user.name).toBe("Test")
    expect(user.id).toBeDefined()
  })

  it("kaster feil for duplikat e-post", async () => {
    await register("test@test.no", "Test", "passord123")
    await expect(register("test@test.no", "Test2", "passord456")).rejects.toThrow(
      "allerede registrert"
    )
  })
})

describe("login", () => {
  it("returnerer bruker ved riktig passord", async () => {
    await register("test@test.no", "Test", "passord123")
    const user = await login("test@test.no", "passord123")
    expect(user).not.toBeNull()
    expect(user!.email).toBe("test@test.no")
  })

  it("returnerer null ved feil passord", async () => {
    await register("test@test.no", "Test", "passord123")
    const user = await login("test@test.no", "feilpassord")
    expect(user).toBeNull()
  })

  it("returnerer null for ukjent e-post", async () => {
    const user = await login("finnes@ikke.no", "passord123")
    expect(user).toBeNull()
  })
})
