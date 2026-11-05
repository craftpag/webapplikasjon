import { getConversation } from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { parseId } from "@/lib/utils"
import { deleteConversationAction } from "@/actions/conversations"
import { ChatForm } from "@/app/components/ChatForm"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSession()
  if (!user) redirect("/login")

  const id = parseId((await params).id)
  const convo = id ? await getConversation(id, user.id) : null

  if (!convo) notFound()

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <Link href="/">&#8592; Tilbake</Link>
      <h1>{convo.title}</h1>
      <p>Leverandør: {convo.provider}</p>

      <div style={{ marginBottom: 20 }}>
        {convo.messages.length === 0 ? (
          <p>Ingen meldinger ennå. Send en melding under.</p>
        ) : (
          convo.messages.map((m) => (
            <div
              key={m.id}
              style={{
                padding: 10,
                marginBottom: 8,
                background: m.role === "user" ? "#e8f4fd" : "#f0f0f0",
                borderRadius: 4,
              }}
            >
              <strong>{m.role === "user" ? "Du" : "AI"}:</strong> {m.content}
            </div>
          ))
        )}
      </div>

      <ChatForm conversationId={convo.id} />

      <form action={deleteConversationAction}>
        <input type="hidden" name="id" value={convo.id} />
        <button
          type="submit"
          style={{
            padding: 8,
            color: "red",
            background: "none",
            border: "1px solid red",
          }}
        >
          Slett samtale
        </button>
      </form>
    </main>
  )
}
