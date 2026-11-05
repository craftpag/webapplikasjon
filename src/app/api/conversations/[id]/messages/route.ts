import { sendMessage, getConversation } from "@/lib/conversation-service"

// POST /api/conversations/:id/messages - send melding og få AI-svar
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const conversationId = Number(id)

  // Sjekk at samtalen finnes
  const convo = await getConversation(conversationId)
  if (!convo) {
    return Response.json({ error: "Samtale ikke funnet" }, { status: 404 })
  }

  const { content } = await request.json()

  if (!content || content.trim() === "") {
    return Response.json(
      { error: "Meldingen kan ikke være tom" },
      { status: 400 }
    )
  }

  try {
    const reply = await sendMessage(conversationId, content)
    return Response.json(reply, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Noe gikk galt"
    return Response.json({ error: msg }, { status: 502 })
  }
}
