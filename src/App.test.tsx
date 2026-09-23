import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders every section of the landing page', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Protocol Factory' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Features')).toBeInTheDocument()
    expect(screen.getByLabelText('Screenshot')).toBeInTheDocument()
    expect(screen.getByLabelText('Installation guide')).toBeInTheDocument()
  })

  it('points every call-to-action at the request form', () => {
    render(<App />)
    const ctas = screen.getAllByRole('link', { name: /request access/i })
    expect(ctas.length).toBeGreaterThanOrEqual(3)
    for (const link of ctas) {
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining('docs.google.com/forms'),
      )
    }
  })

  it('places the try-cta band before the installation guide', () => {
    render(<App />)
    const heading = screen.getByRole('heading', {
      name: 'Want to try the extension?',
    })
    const install = screen.getByLabelText('Installation guide')
    expect(
      heading.compareDocumentPosition(install) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('disclaims affiliation with Opentrons', () => {
    render(<App />)
    expect(
      screen.getByText(/not affiliated with or endorsed by Opentrons/i),
    ).toBeInTheDocument()
  })
})
