import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
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

  test('should render tech stack text', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(getByText(/Vite \+ React/i)).toBeDefined()
  })
})
