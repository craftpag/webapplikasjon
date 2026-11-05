import {
  getConversation,
  deleteConversation,
} from "@/lib/conversation-service"

// GET /api/conversations/:id - hent samtale med meldinger
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const convo = await getConversation(Number(id))

  if (!convo) {
    return Response.json({ error: "Samtale ikke funnet" }, { status: 404 })
  }

  return Response.json(convo)
}

// DELETE /api/conversations/:id - slett samtale
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const convo = await getConversation(Number(id))

  if (!convo) {
    return Response.json({ error: "Samtale ikke funnet" }, { status: 404 })
  }

  await deleteConversation(Number(id))
  return Response.json({ message: "Samtale slettet" })
}
