import { env } from 'cloudflare:workers'
import { render, route } from 'rwsdk/router'
import { defineApp } from 'rwsdk/worker'

import { Document } from '@/app/document'
import { setCommonHeaders } from '@/app/headers'
import { proxyToBackend } from '@/app/lib/backend'
import { Home } from '@/app/pages/home'

export type AppContext = {}

// Alt starter her. Rekkefølgen betyr noe: mellomvare først, så rutene.
export default defineApp([
  setCommonHeaders(),

  // /api/* sendes videre til Hono-backenden, så nettleseren bare snakker med én origin
  route('/api/*', ({ request }) => proxyToBackend(request, env.BACKEND_URL)),

  // Sidene rendres som serverkomponenter inne i Document
  render(Document, [route('/', Home)]),
])
