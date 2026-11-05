"use client"

import { useRef, useState } from "react"
import { sendMessageAction } from "@/actions/conversations"

// Klientkomponent: sender melding via server action, viser "Sender..." mens
// AI-en svarer, og viser feilmelding hvis noe går galt.
export function ChatForm({ conversationId }: { conversationId: number }) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setSending(true)
        setError(null)
        try {
          const result = await sendMessageAction(formData)
          if (result.error) {
            setError(result.error)
          } else {
            formRef.current?.reset()
          }
        } finally {
          setSending(false)
        }
      }}
      style={{ marginBottom: 16 }}
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      <input
        name="content"
        aria-label="Melding"
        placeholder="Skriv en melding..."
        required
        disabled={sending}
        style={{ padding: 8, width: "70%", marginRight: 8 }}
      />
      <button type="submit" disabled={sending} style={{ padding: 8 }}>
        {sending ? "Sender..." : "Send"}
      </button>
      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}
    </form>
  )
}
