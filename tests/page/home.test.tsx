import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
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
})
