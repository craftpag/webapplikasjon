import { getConversation } from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { parseId } from "@/lib/utils"
import { deleteConversationAction } from "@/actions/conversations"
import { ChatForm } from "@/app/components/ChatForm"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

// Serverkomponent: henter samtalen på serveren. Bare ChatForm er klientkomponent.
// Designet (klassene) er fra Markus sin chat i frontend/.
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
    <div className="page">
      <header className="header">
        <div className="header-right">
          <Link href="/" className="back">
            ← Tilbake
          </Link>
          <h1 className="title">{convo.title}</h1>
        </div>
        <span className="status status-ok">{convo.provider}</span>
      </header>

      <main className="main">
        <section className="chat">
          {convo.messages.length === 0 ? (
            <p className="empty">Still et spørsmål for å starte.</p>
          ) : (
            <ol className="messages" aria-live="polite">
              {convo.messages.map((m) => (
                <li key={m.id} className={`message message-${m.role}`}>
                  {m.content}
                </li>
              ))}
            </ol>
          )}

          <ChatForm conversationId={convo.id} />

          <form action={deleteConversationAction} style={{ alignSelf: "center" }}>
            <input type="hidden" name="id" value={convo.id} />
            <button type="submit" className="reset danger">
              Slett samtale
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
