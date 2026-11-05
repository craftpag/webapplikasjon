import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Placeholder } from './Placeholder'

describe('Placeholder', () => {
  it('viser tittelen den får inn', () => {
    render(<Placeholder title="Forside" />)

    expect(screen.getByRole('heading', { name: 'Forside' })).toBeInTheDocument()
  })
})
