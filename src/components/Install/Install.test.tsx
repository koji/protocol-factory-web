import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Install } from './Install'

describe('Install', () => {
  it('anchors at id=install', () => {
    render(<Install />)
    expect(screen.getByLabelText('Installation guide')).toHaveAttribute(
      'id',
      'install',
    )
  })

  it('lists prerequisites including the OT-2 pin note', () => {
    render(<Install />)
    expect(screen.getByText('Python 3.8 or later')).toBeInTheDocument()
    expect(screen.getByText('pip install opentrons')).toBeInTheDocument()
    expect(screen.getByText('pip install opentrons==9.0.0')).toBeInTheDocument()
  })

  it('mentions interpreter selection and separate environments for Flex and OT-2', () => {
    render(<Install />)
    expect(screen.getByText(/Python: Select Interpreter/i)).toBeInTheDocument()
    expect(
      screen.getByText(/separate virtual environment/i),
    ).toBeInTheDocument()
  })

  it('explains both install methods', () => {
    render(<Install />)
    const methodA = screen.getByLabelText('Method A: Command Palette')
    expect(
      within(methodA).getByText('Extensions: Install from VSIX...'),
    ).toBeInTheDocument()
    const methodB = screen.getByLabelText('Method B: Command line')
    expect(
      within(methodB).getByText(
        'code --install-extension protocol-factory-0.2.9-alpha.vsix',
      ),
    ).toBeInTheDocument()
  })
})
