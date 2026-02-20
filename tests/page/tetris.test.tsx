import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import Tetris from '#/pages/tetris'

describe('Tetris', () => {
  test('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    expect(baseElement).toBeTruthy()
  })

  test('should show TETRIS heading', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    expect(getByText('TETRIS')).toBeDefined()
  })

  test('should show Start Game button on load', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    expect(getByText('Start Game')).toBeDefined()
  })

  test('should display initial score of 0, level 1 and lines 0', () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    // Score, level and lines all start at 0 / 0 / 1 (displayed as text nodes)
    const zeros = getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(2) // score and lines
    expect(getAllByText('1').length).toBeGreaterThanOrEqual(1) // level
  })

  test('should display score, level and lines panels', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    expect(getByText('SCORE')).toBeDefined()
    expect(getByText('LEVEL')).toBeDefined()
    expect(getByText('LINES')).toBeDefined()
  })

  test('should display NEXT piece panel', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    expect(getByText('NEXT')).toBeDefined()
  })

  test('should display CONTROLS panel', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    expect(getByText('CONTROLS')).toBeDefined()
  })

  test('should hide the start overlay and show the board after clicking Start', () => {
    const { getByText, queryByText } = render(
      <MemoryRouter>
        <Tetris />
      </MemoryRouter>
    )
    fireEvent.click(getByText('Start Game'))
    // Start overlay should be gone
    expect(queryByText('Start Game')).toBeNull()
  })
})
