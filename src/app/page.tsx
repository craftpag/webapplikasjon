import { listConversations } from "@/lib/conversation-service"
import { createConversationAction } from "@/actions/conversations"

// Server-komponent: leser data direkte fra databasen
export default async function Home() {
  const allConvos = await listConversations()

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>GPT Wrapper</h1>
      <p>Chat med OpenAI og Anthropic gjennom ett grensesnitt.</p>

      {/* Server action: oppretter samtale på serveren */}
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
              <a href={`/chat/${c.id}`} style={{ textDecoration: "none" }}>
                <strong>{c.title}</strong> — {c.provider}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
