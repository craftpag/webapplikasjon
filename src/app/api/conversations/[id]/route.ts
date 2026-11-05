import {
  getConversation,
  deleteConversation,
} from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { parseId } from "@/lib/utils"

type Params = { params: Promise<{ id: string }> }

// GET /api/conversations/:id – 404 hvis samtalen ikke finnes eller tilhører en annen
export async function GET(_request: Request, { params }: Params) {
  const user = await getSession()
  if (!user) {
    return Response.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const id = parseId((await params).id)
  const convo = id ? await getConversation(id, user.id) : null

  if (!convo) {
    return Response.json({ error: "Samtale ikke funnet" }, { status: 404 })
  }

  return Response.json(convo)
}

// DELETE /api/conversations/:id – 204 uten innhold når samtalen er slettet
export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSession()
  if (!user) {
    return Response.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const id = parseId((await params).id)
  const convo = id ? await getConversation(id, user.id) : null

  if (!id || !convo) {
    return Response.json({ error: "Samtale ikke funnet" }, { status: 404 })
  }

  await deleteConversation(id, user.id)
  return new Response(null, { status: 204 })
}
