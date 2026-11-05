import { afterEach, describe, expect, it, vi } from 'vitest'
import { isBackendUp, proxyToBackend, toBackendUrl } from './backend'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('toBackendUrl', () => {
  it('beholder sti og query, men bytter origin', () => {
    expect(toBackendUrl('http://localhost:5173/api/chat?x=1', 'http://localhost:3001')).toBe(
      'http://localhost:3001/api/chat?x=1',
    )
  })
})

describe('proxyToBackend', () => {
  it('sender forespørselen videre og gir tilbake svaret', async () => {
    const fetchMock = vi.fn(async (_input: Request) => new Response('ok', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await proxyToBackend(
      new Request('http://localhost:5173/api/health'),
      'http://localhost:3001',
    )

    expect(await res.text()).toBe('ok')
    const forwarded = fetchMock.mock.calls[0][0]
    expect(forwarded.url).toBe('http://localhost:3001/api/health')
  })

  it('svarer 502 når backenden ikke svarer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))))

    const res = await proxyToBackend(
      new Request('http://localhost:5173/api/health'),
      'http://localhost:3001',
    )

    expect(res.status).toBe(502)
  })
})

describe('isBackendUp', () => {
  it('er true når /api/health svarer status ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ status: 'ok' })))

    expect(await isBackendUp('http://localhost:3001')).toBe(true)
  })

  it('er false når kallet feiler', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('nede'))))

    expect(await isBackendUp('http://localhost:3001')).toBe(false)
  })
})
