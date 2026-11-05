import { sendMessage, getConversation } from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { parseId, sendMessageSchema, firstError } from "@/lib/utils"

// POST /api/conversations/:id/messages – send melding og få AI-svar
// 201 ved suksess, 400 ved ugyldig input, 401 uten innlogging,
// 404 for ukjent samtale og 502 hvis AI-leverandøren feiler.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user) {
    return Response.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const conversationId = parseId((await params).id)
  const convo = conversationId
    ? await getConversation(conversationId, user.id)
    : null
  if (!conversationId || !convo) {
    return Response.json({ error: "Samtale ikke funnet" }, { status: 404 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Ugyldig JSON" }, { status: 400 })
  }

  const parsed = sendMessageSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: firstError(parsed.error) }, { status: 400 })
  }

  try {
    const reply = await sendMessage(conversationId, user.id, parsed.data.content)
    return Response.json(reply, { status: 201 })
  } catch {
    return Response.json(
      { error: "Fikk ikke svar fra AI-leverandøren" },
      { status: 502 }
    )
  }
}
