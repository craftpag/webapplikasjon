"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { sendMessageAction } from "@/actions/conversations"

// Klientkomponent: sender melding via server action, viser at AI-en skriver,
// og viser feilmelding hvis noe går galt. Design og Enter-oppførsel fra Markus sin Chat.tsx.
export function ChatForm({ conversationId }: { conversationId: number }) {
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Hold skrivefeltet synlig når nye meldinger kommer inn
  useEffect(() => {
    formRef.current?.scrollIntoView?.({ block: "end" })
  }, [sending])

  // Enter sender, Shift+Enter gir ny linje
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (input.trim() && !sending) formRef.current?.requestSubmit()
    }
  }

  return (
    <>
      {sending && <p className="typing">AI skriver …</p>}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <form
        ref={formRef}
        className="composer"
        action={async (formData) => {
          setSending(true)
          setError(null)
          try {
            const result = await sendMessageAction(formData)
            if (result.error) {
              setError(result.error)
            } else {
              setInput("")
            }
          } finally {
            setSending(false)
          }
        }}
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <textarea
          name="content"
          aria-label="Melding"
          placeholder="Skriv en melding"
          rows={1}
          required
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={sending}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          {sending ? "Sender…" : "Send"}
        </button>
      </form>
    </>
  )
}
