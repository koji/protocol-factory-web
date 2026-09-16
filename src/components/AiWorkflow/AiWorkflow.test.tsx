import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AiWorkflow } from './AiWorkflow'

describe('AiWorkflow', () => {
  it('anchors at id=ai-workflow', () => {
    render(<AiWorkflow />)
    expect(screen.getByLabelText('Generate protocols with AI')).toHaveAttribute(
      'id',
      'ai-workflow',
    )
  })

  it('links to the protocol-fix-loop skill repo', () => {
    render(<AiWorkflow />)
    const links = screen.getAllByRole('link', { name: /protocol-fix-loop/i })
    expect(links.length).toBeGreaterThanOrEqual(1)
    for (const link of links) {
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/koji/protocol-fix-loop',
      )
    }
  })

  it('shows the demo video and usage steps', () => {
    render(<AiWorkflow />)
    const video = document.querySelector('video')
    expect(video).not.toBeNull()
    expect(video?.getAttribute('src')).toBe(
      'https://github.com/user-attachments/assets/812fbcdf-a84a-49fd-b631-ae925b64dddf',
    )
    expect(
      screen.getByText('npx skills add koji/protocol-fix-loop'),
    ).toBeInTheDocument()
    expect(screen.getByText('/protocol-fix-loop')).toBeInTheDocument()
    expect(screen.getByText(/Install VSCode or Cursor/i)).toBeInTheDocument()
  })
})
