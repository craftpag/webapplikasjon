import {
  listConversations,
  createConversation,
} from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { createConversationSchema, firstError } from "@/lib/utils"

// GET /api/conversations – innlogget brukers samtaler
export async function GET() {
  const user = await getSession()
  if (!user) {
    return Response.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const result = await listConversations(user.id)
  return Response.json(result)
}

// POST /api/conversations – opprett samtale. 201 ved suksess, 400 ved ugyldig input
export async function POST(request: Request) {
  const user = await getSession()
  if (!user) {
    return Response.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Ugyldig JSON" }, { status: 400 })
  }

  // Zod validerer body før den brukes. Ukjente felter fjernes.
  const parsed = createConversationSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: firstError(parsed.error) }, { status: 400 })
  }

  const { title, provider } = parsed.data
  const convo = await createConversation(user.id, title, provider)
  return Response.json(convo, { status: 201 })
}
