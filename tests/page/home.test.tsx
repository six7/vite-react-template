import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Home from '#/pages/home'

describe('Homepage', () => {
  test('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(baseElement).toBeTruthy()
  })

  test('should render game board', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(getByTestId('game-board')).toBeDefined()
  })

  test('should render score display', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(getByTestId('score-display')).toBeDefined()
  })

  test('should render start button', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(getByText('Start Game')).toBeDefined()
  })

  describe('game logic', () => {
    beforeEach(() => {
      // Always return the I-piece (index 0) for deterministic tests
      vi.spyOn(Math, 'random').mockReturnValue(0)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('clicking Start Game begins the game and hides the start button', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )

      fireEvent.click(screen.getByText('Start Game'))

      expect(screen.queryByText('Start Game')).toBeNull()
      expect(screen.getByTestId('game-board')).toBeDefined()
    })

    test('keyboard controls before game starts do not crash', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )

      // Keys should be ignored before the game starts
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      fireEvent.keyDown(window, { key: 'ArrowUp' })
      fireEvent.keyDown(window, { key: ' ' })

      // Game board and start button should still be present
      expect(screen.getByTestId('game-board')).toBeDefined()
      expect(screen.getByText('Start Game')).toBeDefined()
    })

    test('ArrowLeft and ArrowRight move the piece without crashing', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )

      fireEvent.click(screen.getByText('Start Game'))

      fireEvent.keyDown(window, { key: 'ArrowLeft' })
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      fireEvent.keyDown(window, { key: 'a' })
      fireEvent.keyDown(window, { key: 'd' })

      // Board should still be present after movements
      expect(screen.getByTestId('game-board')).toBeDefined()
    })

    test('ArrowUp rotates the piece without crashing', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )

      fireEvent.click(screen.getByText('Start Game'))

      fireEvent.keyDown(window, { key: 'ArrowUp' })
      fireEvent.keyDown(window, { key: 'w' })

      expect(screen.getByTestId('game-board')).toBeDefined()
    })

    test('Space hard drop locks piece and updates score', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )

      fireEvent.click(screen.getByText('Start Game'))

      // Score starts at 0
      expect(screen.getByTestId('score-display').textContent).toBe('0')

      // Hard drop the I-piece (starts at row 0, drops 19 rows → bonus = 19 * 2 = 38)
      fireEvent.keyDown(window, { key: ' ' })

      expect(screen.getByTestId('score-display').textContent).toBe('38')
    })

    test('ArrowDown soft drops the piece without crashing', () => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      )

      fireEvent.click(screen.getByText('Start Game'))

      fireEvent.keyDown(window, { key: 'ArrowDown' })
      fireEvent.keyDown(window, { key: 's' })

      expect(screen.getByTestId('game-board')).toBeDefined()
    })
  })
})
