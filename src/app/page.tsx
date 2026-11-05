import { listConversations } from "@/lib/conversation-service"
import { getSession } from "@/lib/auth"
import { createConversationAction } from "@/actions/conversations"
import { LogoutButton } from "./components/LogoutButton"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const user = await getSession()
  if (!user) redirect("/login")

  const allConvos = await listConversations(user.id)

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>GPT Wrapper</h1>
        <div>
          <span style={{ marginRight: 8 }}>{user.name}</span>
          <LogoutButton />
        </div>
      </div>

      <p>Chat med OpenAI og Anthropic gjennom ett grensesnitt.</p>

      <form action={createConversationAction} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            name="title"
            placeholder="Tittel på samtale"
            required
            style={{ padding: 8, marginRight: 8 }}
          />
          <select name="provider" style={{ padding: 8, marginRight: 8 }}>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
          <button type="submit" style={{ padding: 8 }}>
            Opprett
          </button>
        </div>
      </form>

      <h2>Samtaler</h2>
      {allConvos.length === 0 ? (
        <p>Ingen samtaler ennå. Opprett en over.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {allConvos.map((c) => (
            <li
              key={c.id}
              style={{
                padding: 12,
                marginBottom: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            >
              <Link
                href={`/chat/${c.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <strong>{c.title}</strong> – {c.provider}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
