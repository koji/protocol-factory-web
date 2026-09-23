import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

const setup = (theme: 'dark' | 'light' = 'dark') =>
  render(<Header theme={theme} onToggleTheme={vi.fn()} />)

describe('Header', () => {
  it('links the brand back to top of page', () => {
    setup()
    const brand = screen.getByRole('link', { name: 'Protocol Factory' })
    expect(brand).toHaveAttribute('href', '#top')
  })

  it('has section anchors for Features and Install', () => {
    setup()
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute(
      'href',
      '#features',
    )
    expect(screen.getByRole('link', { name: 'Install' })).toHaveAttribute(
      'href',
      '#install',
    )
  })

  it('links to the request form', () => {
    setup()
    expect(
      screen.getByRole('link', { name: /request access/i }),
    ).toHaveAttribute('href', expect.stringContaining('docs.google.com/forms'))
  })

  it('contains the theme toggle', () => {
    setup()
    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument()
  })
})
