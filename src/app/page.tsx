import { listConversations } from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { createConversationAction } from "@/actions/conversations"
import { LogoutButton } from "./components/LogoutButton"
import { redirect } from "next/navigation"
import Link from "next/link"

// Serverkomponent: leser samtalene direkte fra service-laget, filtrert på innlogget bruker
export default async function Home() {
  const user = await getSession()
  if (!user) redirect("/login")

  const allConvos = await listConversations(user.id)

  return (
    <div className="page">
      <header className="header">
        <h1 className="brand">GPT Wrapper</h1>
        <div className="header-right">
          <span className="status status-ok">{user.name}</span>
          <LogoutButton />
        </div>
      </header>

      <main>
        <section className="section">
          <h2>Ny samtale</h2>
          <form action={createConversationAction} className="row">
            <input
              name="title"
              className="input"
              placeholder="Tittel på samtale"
              aria-label="Tittel"
              required
              maxLength={100}
            />
            <select name="provider" className="select" aria-label="Leverandør">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
            <button type="submit" className="primary">
              Opprett
            </button>
          </form>
        </section>

        <section className="section">
          <h2>Samtaler</h2>
          {allConvos.length === 0 ? (
            <p className="hint">Ingen samtaler ennå. Opprett en over.</p>
          ) : (
            <ul className="conversations">
              {allConvos.map((c) => (
                <li key={c.id}>
                  <Link href={`/chat/${c.id}`}>
                    <span className="conversation-title">{c.title}</span>
                    <span className="conversation-provider">{c.provider}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
