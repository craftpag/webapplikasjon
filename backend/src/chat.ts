import OpenAI from 'openai'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

// Gir tekstbitene fra modellen etter hvert som de kommer
export type StreamChat = (messages: ChatMessage[]) => AsyncIterable<string>

export function createOpenAIChat(model: string): StreamChat {
  let client: OpenAI | undefined

  return async function* (messages) {
    // Opprettes ved første kall, så serveren kan starte uten API-nøkkel
    client ??= new OpenAI()

    const stream = await client.responses.create({
      model,
      input: messages,
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield event.delta
      }
    }
  }
}
