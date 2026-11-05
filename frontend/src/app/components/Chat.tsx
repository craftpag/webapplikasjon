'use client'

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { streamChat, type ChatMessage } from '../lib/chat'
import { cn } from '../lib/utils'

// Klientkomponent: holder samtalen i state og strømmer svaret inn bit for bit (SSE)
export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // Holder siste melding synlig mens svaret strømmer inn
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages])

  async function send() {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void send()
  }

  // Enter sender, Shift+Enter gir ny linje
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send()
    }
  }

  return (
    <section className="chat">
      {messages.length === 0 ? (
        <p className="empty">Still et spørsmål for å starte.</p>
      ) : (
        <ol className="messages" aria-live="polite">
          {messages.map((message, index) => (
            <li key={index} className={cn('message', `message-${message.role}`)}>
              {message.content || <span className="typing">…</span>}
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div ref={endRef} />

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          aria-label="Melding"
          placeholder="Skriv en melding"
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming || !input.trim()}>
          Send
        </button>
      </form>

      {messages.length > 0 && !isStreaming && (
        <button type="button" className="reset" onClick={() => setMessages([])}>
          Ny samtale
        </button>
      )}
    </section>
  )
}
