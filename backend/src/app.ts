import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'
import type { StreamChat } from './chat.js'

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      }),
    )
    .min(1),
})

export function createApp({ streamChat }: { streamChat: StreamChat }) {
  const app = new Hono().basePath('/api')

  app.get('/health', (c) => c.json({ status: 'ok' }))

  app.post('/chat', async (c) => {
    const body = await c.req.json().catch(() => null)
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return c.json({ error: 'Ugyldig forespørsel' }, 400)
    }

    return streamSSE(c, async (stream) => {
      try {
        for await (const delta of streamChat(parsed.data.messages)) {
          // JSON-koding tar vare på linjeskift i teksten
          await stream.writeSSE({ event: 'delta', data: JSON.stringify(delta) })
        }
        await stream.writeSSE({ event: 'done', data: '' })
      } catch (error) {
        console.error(error)
        await stream.writeSSE({ event: 'error', data: 'Fikk ikke svar fra modellen' })
      }
    })
  })

  return app
}
