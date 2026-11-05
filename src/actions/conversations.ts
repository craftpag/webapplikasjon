"use server"

import {
  createConversation,
  deleteConversation,
  sendMessage,
} from "@/lib/conversation-service"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Server action: opprett ny samtale
export async function createConversationAction(formData: FormData) {
  const title = formData.get("title") as string
  const provider = formData.get("provider") as string

  if (!title || !provider) {
    throw new Error("Tittel og leverandør er påkrevd")
  }

  const convo = await createConversation(title, provider)
  redirect(`/chat/${convo.id}`)
}

// Server action: send melding
export async function sendMessageAction(formData: FormData) {
  const conversationId = Number(formData.get("conversationId"))
  const content = formData.get("content") as string

  if (!content?.trim()) {
    throw new Error("Meldingen kan ikke være tom")
  }

  await sendMessage(conversationId, content)
  revalidatePath(`/chat/${conversationId}`)
}

// Server action: slett samtale
export async function deleteConversationAction(formData: FormData) {
  const id = Number(formData.get("id"))
  await deleteConversation(id)
  redirect("/")
}
