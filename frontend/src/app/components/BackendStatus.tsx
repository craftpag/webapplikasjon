import { env } from 'cloudflare:workers'
import { isBackendUp } from '../lib/backend'

// Async serverkomponent: sjekker /api/health på serveren før siden sendes.
// Ingen useEffect og ingen ekstra forespørsel fra nettleseren.
export async function BackendStatus() {
  const up = await isBackendUp(env.BACKEND_URL)

  return (
    <span className={up ? 'status status-ok' : 'status status-feil'}>
      {up ? 'tilkoblet' : 'backend nede'}
    </span>
  )
}
