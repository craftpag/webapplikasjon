import type { AppContext } from '../src/worker'

declare module 'rwsdk/worker' {
  interface DefaultAppContext extends AppContext {}

  // App er typen til defineApp-eksporten i src/worker.tsx
  export type App = typeof import('../src/worker').default
}
