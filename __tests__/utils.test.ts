import { describe, expect, it } from "vitest"
import {
  isValidProvider,
  parseId,
  normalizeEmail,
  isValidEmail,
  validateTitle,
  validateMessage,
  MAX_MESSAGE_LENGTH,
} from "@/lib/utils"

describe("isValidProvider", () => {
  it("godtar openai og anthropic", () => {
    expect(isValidProvider("openai")).toBe(true)
    expect(isValidProvider("anthropic")).toBe(true)
  })

  it("avviser ukjente verdier", () => {
    expect(isValidProvider("google")).toBe(false)
    expect(isValidProvider("")).toBe(false)
    expect(isValidProvider(undefined)).toBe(false)
  })
})

describe("parseId", () => {
  it("gjør om gyldig id til tall", () => {
    expect(parseId("42")).toBe(42)
  })

  it("returnerer null for ugyldige id-er", () => {
    expect(parseId("abc")).toBeNull()
    expect(parseId("0")).toBeNull()
    expect(parseId("-1")).toBeNull()
    expect(parseId("1.5")).toBeNull()
    expect(parseId(null)).toBeNull()
  })
})

describe("e-post", () => {
  it("normaliserer store bokstaver og mellomrom", () => {
    expect(normalizeEmail("  Ola@Test.NO ")).toBe("ola@test.no")
  })

  it("validerer format", () => {
    expect(isValidEmail("ola@test.no")).toBe(true)
    expect(isValidEmail("olatest.no")).toBe(false)
    expect(isValidEmail("ola@testno")).toBe(false)
  })
})

describe("validateTitle", () => {
  it("godtar vanlig tittel", () => {
    expect(validateTitle("Min samtale")).toBeNull()
  })

  it("avviser tom og for lang tittel", () => {
    expect(validateTitle("   ")).not.toBeNull()
    expect(validateTitle("x".repeat(101))).not.toBeNull()
  })
})

describe("validateMessage", () => {
  it("godtar vanlig melding", () => {
    expect(validateMessage("Hei")).toBeNull()
  })

  it("avviser tom og for lang melding", () => {
    expect(validateMessage("")).toBe("Meldingen kan ikke være tom")
    expect(validateMessage(123)).not.toBeNull()
    expect(validateMessage("x".repeat(MAX_MESSAGE_LENGTH + 1))).not.toBeNull()
  })
})
