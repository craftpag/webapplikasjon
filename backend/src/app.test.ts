import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import type { StreamChat } from './chat.js'

const fakeChat: StreamChat = async function* () {
  yield 'Hei'
  yield ' på deg'
}

const failingChat: StreamChat = async function* () {
  throw new Error('API-feil')
}

function postChat(app: ReturnType<typeof createApp>, body: unknown) {
  return app.request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/health', () => {
  it('svarer med status ok', async () => {
    const res = await createApp({ streamChat: fakeChat }).request('/api/health')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })
})

describe('POST /api/chat', () => {
  it('strømmer svaret som SSE', async () => {
    const res = await postChat(createApp({ streamChat: fakeChat }), {
      messages: [{ role: 'user', content: 'Hei' }],
    })

    expect(res.headers.get('Content-Type')).toContain('text/event-stream')
    expect(await res.text()).toBe(
      'event: delta\ndata: "Hei"\n\n' +
        'event: delta\ndata: " på deg"\n\n' +
        'event: done\ndata: \n\n',
    )
  })

  it('avviser forespørsel uten meldinger', async () => {
    const res = await postChat(createApp({ streamChat: fakeChat }), { messages: [] })

    expect(res.status).toBe(400)
  })

  it('sender error-event når modellen feiler', async () => {
    const res = await postChat(createApp({ streamChat: failingChat }), {
      messages: [{ role: 'user', content: 'Hei' }],
    })

    expect(await res.text()).toContain('event: error')
  })
})
