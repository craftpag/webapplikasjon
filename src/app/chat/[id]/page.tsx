import { getConversation } from "@/lib/conversation-service"
import {
  sendMessageAction,
  deleteConversationAction,
} from "@/actions/conversations"
import { notFound } from "next/navigation"

// Server-komponent: henter samtale med meldinger
export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const convo = await getConversation(Number(id))

  if (!convo) notFound()

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <a href="/">← Tilbake</a>
      <h1>{convo.title}</h1>
      <p>Leverandør: {convo.provider}</p>

      {/* Meldingshistorikk */}
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

      {/* Server action: send melding */}
      <form action={sendMessageAction} style={{ marginBottom: 16 }}>
        <input type="hidden" name="conversationId" value={convo.id} />
        <input
          name="content"
          placeholder="Skriv en melding..."
          required
          style={{ padding: 8, width: "70%", marginRight: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>
          Send
        </button>
      </form>

      {/* Server action: slett samtale */}
      <form action={deleteConversationAction}>
        <input type="hidden" name="id" value={convo.id} />
        <button
          type="submit"
          style={{ padding: 8, color: "red", background: "none", border: "1px solid red" }}
        >
          Slett samtale
        </button>
      </form>
    </main>
  )
}
