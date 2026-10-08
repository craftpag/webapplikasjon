import { useState, type FormEvent } from 'react'
import { streamChat, type ChatMessage } from '../lib/chat'
import { Button } from './Button'

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = input.trim()
    if (!content || isStreaming) return

    const history: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setError(null)
    setIsStreaming(true)

    try {
      for await (const delta of streamChat(history)) {
        // Legger hver tekstbit til i det siste svaret
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          return [...prev.slice(0, -1), { ...last, content: last.content + delta }]
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt')
      // Et tomt svar kan ikke sendes med i neste forespørsel
      setMessages((prev) =>
        prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev,
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <section className="chat">
      <ul className="chat-messages">
        {messages.map((message, index) => (
          <li key={index} className={`chat-message chat-message-${message.role}`}>
            {message.content}
          </li>
        ))}
      </ul>

      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          aria-label="Melding"
          placeholder="Skriv en melding"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isStreaming}
        />
        <Button type="submit" disabled={isStreaming || !input.trim()}>
          Send
        </Button>
      </form>
    </section>
  )
}
