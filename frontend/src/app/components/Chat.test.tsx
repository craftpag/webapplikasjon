import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Chat } from './Chat'

// Bytter ut nettverkskallet med en falsk strøm, så testen bare sjekker komponenten
vi.mock('../lib/chat', () => ({
  streamChat: async function* () {
    yield 'Hei'
    yield ' på deg'
  },
}))

describe('Chat', () => {
  it('viser meldingen og svaret som strømmer inn', async () => {
    render(<Chat />)

    fireEvent.change(screen.getByLabelText('Melding'), { target: { value: 'Hallo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Hallo')).toBeInTheDocument()
    expect(await screen.findByText('Hei på deg')).toBeInTheDocument()
  })

  it('kan ikke sende en tom melding', () => {
    render(<Chat />)

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })
})
