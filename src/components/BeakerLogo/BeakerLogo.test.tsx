import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BeakerLogo } from './BeakerLogo'

describe('BeakerLogo', () => {
  it('exposes an accessible name when a label is given', () => {
    const { getByRole } = render(<BeakerLogo label="Protocol Factory" />)
    expect(
      getByRole('img', { name: 'Protocol Factory' }),
    ).toBeInTheDocument()
  })

  it('is hidden from assistive tech when no label is given', () => {
    const { container } = render(<BeakerLogo />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
