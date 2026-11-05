import {
  listConversations,
  createConversation,
} from "@/lib/conversation-service"

// GET /api/conversations - hent alle samtaler
export async function GET() {
  const result = await listConversations()
  return Response.json(result)
}

// POST /api/conversations - opprett ny samtale
export async function POST(request: Request) {
  const { title, provider } = await request.json()

  if (!title || !provider) {
    return Response.json(
      { error: "Tittel og leverandør er påkrevd" },
      { status: 400 }
    )
  }

  if (provider !== "openai" && provider !== "anthropic") {
    return Response.json(
      { error: "Leverandør må være 'openai' eller 'anthropic'" },
      { status: 400 }
    )
  }

  const convo = await createConversation(title, provider)
  return Response.json(convo, { status: 201 })
}
