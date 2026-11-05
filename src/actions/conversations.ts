"use server"

import {
  createConversation,
  deleteConversation,
  sendMessage,
} from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import {
  isValidProvider,
  parseId,
  validateMessage,
  validateTitle,
} from "@/lib/utils"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Alle actions starter med å sjekke sesjonen på serveren. Service-laget
// filtrerer i tillegg på userId, så man bare kan endre egne samtaler.

export async function createConversationAction(formData: FormData) {
  const user = await getSession()
  if (!user) redirect("/login")

  const title = formData.get("title")
  const provider = formData.get("provider")

  const titleError = validateTitle(title)
  if (titleError) throw new Error(titleError)

  if (!isValidProvider(provider)) {
    throw new Error("Leverandør må være 'openai' eller 'anthropic'")
  }

  const convo = await createConversation(user.id, (title as string).trim(), provider)
  redirect(`/chat/${convo.id}`)
}

export type SendMessageState = { error?: string }

export async function sendMessageAction(
  formData: FormData
): Promise<SendMessageState> {
  const user = await getSession()
  if (!user) redirect("/login")

  const conversationId = parseId(formData.get("conversationId"))
  if (!conversationId) return { error: "Ugyldig samtale" }

  const content = formData.get("content")
  const contentError = validateMessage(content)
  if (contentError) return { error: contentError }

  try {
    await sendMessage(conversationId, user.id, content as string)
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Noe gikk galt" }
  }

  revalidatePath(`/chat/${conversationId}`)
  return {}
}

export async function deleteConversationAction(formData: FormData) {
  const user = await getSession()
  if (!user) redirect("/login")

  const id = parseId(formData.get("id"))
  if (!id) throw new Error("Ugyldig samtale")

  await deleteConversation(id, user.id)
  redirect("/")
}
