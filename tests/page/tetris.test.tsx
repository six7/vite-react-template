import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import TetrisPage from '#/pages/tetris'

function renderTetris() {
  return render(
    <MemoryRouter>
      <TetrisPage />
    </MemoryRouter>
  )
}

describe('TetrisPage', () => {
  it('renders the TETRIS heading', () => {
    renderTetris()
    expect(screen.getByRole('heading', { name: /tetris/i })).toBeDefined()
  })

  it('shows idle start prompt on initial render', () => {
    renderTetris()
    expect(screen.getByText(/press/i)).toBeDefined()
    expect(screen.getByText(/enter/i)).toBeDefined()
  })

  it('renders score, level and lines labels', () => {
    renderTetris()
    expect(screen.getByText(/score/i)).toBeDefined()
    expect(screen.getByText(/level/i)).toBeDefined()
    expect(screen.getByText(/lines/i)).toBeDefined()
  })

  it('renders back home link', () => {
    renderTetris()
    expect(screen.getByRole('link', { name: /back home/i })).toBeDefined()
  })

  it('has accessible game board region', () => {
    renderTetris()
    // section with aria-label serves as the accessible game board region
    const board = document.querySelector('section[aria-label="Tetris game board"]')
    expect(board).not.toBeNull()
  })

  it('has aria-live stats region', () => {
    renderTetris()
    const statsRegion = screen.getByTestId('score').closest('[aria-live]')
    expect(statsRegion).toBeDefined()
    expect(statsRegion?.getAttribute('aria-live')).toBe('polite')
  })

  it('renders initial score of 0', () => {
    renderTetris()
    expect(screen.getByTestId('score').textContent).toBe('0')
    expect(screen.getByTestId('level').textContent).toBe('1')
    expect(screen.getByTestId('lines').textContent).toBe('0')
  })

  it('shows keyboard controls hint', () => {
    renderTetris()
    expect(screen.getByLabelText(/keyboard controls/i)).toBeDefined()
  })
})
