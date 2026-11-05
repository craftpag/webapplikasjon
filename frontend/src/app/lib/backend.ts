// Kjører i workeren (serveren). Kobler RedwoodSDK-appen til Hono-backenden.

// Bytter ut origin, men beholder sti og query: /api/chat?x=1 -> http://localhost:3001/api/chat?x=1
export function toBackendUrl(requestUrl: string, backendUrl: string): string {
  const { pathname, search } = new URL(requestUrl)
  return new URL(pathname + search, backendUrl).toString()
}

// Videresender forespørselen uendret. Svaret (også SSE-strømmen) sendes rett tilbake.
export async function proxyToBackend(
  request: Request,
  backendUrl: string,
): Promise<Response> {
  try {
    return await fetch(new Request(toBackendUrl(request.url, backendUrl), request))
  } catch {
    return Response.json({ error: 'Backend svarer ikke' }, { status: 502 })
  }
}

// Brukes av BackendStatus. Gir opp etter kort tid, så en treg backend ikke holder igjen siden.
export async function isBackendUp(backendUrl: string, timeoutMs = 1500): Promise<boolean> {
  try {
    const res = await fetch(new URL('/api/health', backendUrl), {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { status?: string }
    return data.status === 'ok'
  } catch {
    return false
  }
}
