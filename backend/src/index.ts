import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { createOpenAIChat } from './chat.js'

const port = Number(process.env.PORT ?? 3001)
const model = process.env.OPENAI_MODEL ?? 'gpt-5.4-mini'

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY mangler, så /api/chat vil feile. Se backend/.env.example')
}

const app = createApp({ streamChat: createOpenAIChat(model) })

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
