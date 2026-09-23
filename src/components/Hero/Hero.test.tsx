import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from './Hero'

describe('Hero', () => {
  it('renders the product headline', () => {
    render(<Hero />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Protocol Factory' }),
    ).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Hero />)
    expect(
      screen.getByText(/Simulate your Opentrons Python protocols/i),
    ).toBeInTheDocument()
  })

  it('links the primary CTA to the request form', () => {
    render(<Hero />)
    const link = screen.getByRole('link', { name: /request access/i })
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('docs.google.com/forms'),
    )
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('marks the extension as preview', () => {
    render(<Hero />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('links down to the installation guide', () => {
    render(<Hero />)
    expect(
      screen.getByRole('link', { name: /Installation guide/i }),
    ).toHaveAttribute('href', '#install')
  })
})
