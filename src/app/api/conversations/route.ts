import {
  listConversations,
  createConversation,
} from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { isValidProvider, validateTitle } from "@/lib/utils"

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

  const { title, provider } = body ?? {}

  const titleError = validateTitle(title)
  if (titleError) {
    return Response.json({ error: titleError }, { status: 400 })
  }

  if (!isValidProvider(provider)) {
    return Response.json(
      { error: "Leverandør må være 'openai' eller 'anthropic'" },
      { status: 400 }
    )
  }

  const convo = await createConversation(user.id, title.trim(), provider)
  return Response.json(convo, { status: 201 })
}
