import { describe, expect, it } from 'vitest'
import { cn, formatDate } from './utils'

describe('cn', () => {
  it('slår sammen klasser og hopper over tomme verdier', () => {
    expect(cn('btn', false, 'btn-primary', undefined, null)).toBe(
      'btn btn-primary',
    )
  })
})

describe('formatDate', () => {
  it('formaterer dato på norsk', () => {
    expect(formatDate(new Date(2026, 9, 1))).toBe('01.10.2026')
  })
})
