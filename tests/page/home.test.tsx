import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import Home from '#/pages/home'

describe('Homepage (Tetris)', () => {
  test('should render without crashing', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(baseElement).toBeTruthy()
  })

  test('should render the game board', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByTestId('game-board')).toBeDefined()
  })

  test('should render the score display', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByTestId('score')).toBeDefined()
  })
})
