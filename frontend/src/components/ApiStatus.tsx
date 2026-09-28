import { useEffect, useState } from 'react'
import { fetchJson } from '../lib/api'

type Status = 'laster' | 'ok' | 'feil'

// Viser om frontend får kontakt med backend (GET /api/health)
export function ApiStatus() {
  const [status, setStatus] = useState<Status>('laster')

  useEffect(() => {
    fetchJson<{ status: string }>('/api/health')
      .then((data) => setStatus(data.status === 'ok' ? 'ok' : 'feil'))
      .catch(() => setStatus('feil'))
  }, [])

  return <p className={`api-status api-status-${status}`}>Backend: {status}</p>
}
