"use server"

import { register, login, logout } from "@/lib/auth"
import { isValidEmail } from "@/lib/utils"
import { redirect } from "next/navigation"

// Returneres til skjemaet slik at feilen kan vises uten å krasje siden
export type FormState = { error?: string }

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email")
  const name = formData.get("name")
  const password = formData.get("password")

  if (
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof password !== "string" ||
    !name.trim()
  ) {
    return { error: "Alle feltene er påkrevd" }
  }

  if (!isValidEmail(email.trim())) {
    return { error: "Ugyldig e-postadresse" }
  }

  if (password.length < 6) {
    return { error: "Passordet må være minst 6 tegn" }
  }

  try {
    await register(email, name, password)
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Noe gikk galt" }
  }

  redirect("/login")
}

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email")
  const password = formData.get("password")

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "E-post og passord er påkrevd" }
  }

  const user = await login(email, password)

  if (!user) {
    return { error: "Feil e-post eller passord" }
  }

  redirect("/")
}

export async function logoutAction() {
  await logout()
  redirect("/login")
}
