import { BackendStatus } from '../components/BackendStatus'
import { Chat } from '../components/Chat'

// Serverkomponent (standard i RedwoodSDK). Kjører i workeren og sendes ferdig rendret.
// Bare Chat er en klientkomponent, fordi den trenger state og hendelser.
export function Home() {
  return (
    <div className="page">
      <header className="header">
        <span className="brand">Chat</span>
        <BackendStatus />
      </header>
      <main className="main">
        <Chat />
      </main>
    </div>
  )
}
