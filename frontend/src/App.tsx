import { ApiStatus } from './components/ApiStatus'
import { Layout } from './components/Layout'
import { Placeholder } from './components/Placeholder'

function App() {
  return (
    <Layout>
      <ApiStatus />
      <Placeholder title="Forside" />
    </Layout>
  )
}

export default App
