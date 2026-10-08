import { parseSSE } from './sse'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

// Sender samtalen til backend og gir svaret bit for bit
export async function* streamChat(messages: ChatMessage[]): AsyncGenerator<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`${res.status} ${res.statusText}`)
  }

  for await (const { event, data } of parseSSE(res.body)) {
    if (event === 'delta') yield JSON.parse(data) as string
    if (event === 'error') throw new Error(data)
  }
}
