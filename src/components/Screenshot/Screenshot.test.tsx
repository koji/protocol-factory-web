import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Screenshot } from './Screenshot'

describe('Screenshot', () => {
  it('shows the live demo animation', () => {
    render(<Screenshot />)
    const img = screen.getByRole('img', {
      name: /Protocol Factory visualizing an Opentrons protocol/i,
    })
    expect(img).toHaveAttribute(
      'src',
      'https://github.com/user-attachments/assets/eeb96be5-8334-4370-bd4a-1564cb12d690',
    )
    expect(screen.getByText(/Protocol Factory in action/i)).toBeInTheDocument()
  })
})
