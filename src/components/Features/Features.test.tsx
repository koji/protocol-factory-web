import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FEATURES, Features } from './Features'

describe('Features', () => {
  it('renders seven feature cards', () => {
    render(<Features />)
    expect(screen.getAllByRole('article')).toHaveLength(FEATURES.length)
    expect(FEATURES).toHaveLength(7)
  })

  it('renders each feature title and description', () => {
    render(<Features />)
    for (const feature of FEATURES) {
      expect(screen.getByText(feature.title)).toBeInTheDocument()
      expect(screen.getByText(feature.description)).toBeInTheDocument()
    }
  })

  it('labels the region for anchor navigation', () => {
    render(<Features />)
    const region = screen.getByLabelText('Features')
    expect(region).toHaveAttribute('id', 'features')
  })

  it('shows the runtime parameters demo video', () => {
    const { container } = render(<Features />)
    const video = container.querySelector('video')
    expect(video).not.toBeNull()
    expect(video?.getAttribute('src')).toBe(
      '/videos/protocol-factory-runtime-params.mp4',
    )
    expect(
      screen.getByLabelText(
        'Demo video of tweaking runtime parameters in Protocol Factory',
      ),
    ).toBeInTheDocument()
  })
})
