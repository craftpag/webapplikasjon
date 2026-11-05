import { initClient, initClientNavigation } from 'rwsdk/client'

// Hydrerer klientkomponentene ("use client") i nettleseren
const { handleResponse, onHydrated } = initClientNavigation()
initClient({ handleResponse, onHydrated })
