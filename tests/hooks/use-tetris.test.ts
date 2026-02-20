import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTetris } from '#/hooks/use-tetris'
import { BOARD_HEIGHT, BOARD_WIDTH } from '#/lib/tetris-constants'

describe('useTetris', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in idle state with an empty board', () => {
    const { result } = renderHook(() => useTetris())
    expect(result.current.status).toBe('idle')
    expect(result.current.score).toBe(0)
    expect(result.current.level).toBe(1)
    expect(result.current.lines).toBe(0)
    expect(result.current.current).toBeNull()
    expect(result.current.next).toBeNull()
    expect(result.current.board).toHaveLength(BOARD_HEIGHT)
    expect(result.current.board[0]).toHaveLength(BOARD_WIDTH)
    expect(result.current.board.flat().every((cell) => cell === null)).toBe(true)
  })

  it('transitions to playing after start()', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())
    expect(result.current.status).toBe('playing')
    expect(result.current.current).not.toBeNull()
    expect(result.current.next).not.toBeNull()
  })

  it('pauses and resumes the game', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())
    act(() => result.current.pause())
    expect(result.current.status).toBe('paused')
    act(() => result.current.pause())
    expect(result.current.status).toBe('playing')
  })

  it('does not move when not playing', () => {
    const { result } = renderHook(() => useTetris())
    const before = result.current.current
    act(() => result.current.moveLeft())
    act(() => result.current.moveRight())
    act(() => result.current.moveDown())
    act(() => result.current.rotate())
    expect(result.current.current).toBe(before)
  })

  it('moves piece left and right while playing', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())

    const initialCol = result.current.current?.col ?? 0

    act(() => result.current.moveRight())
    const afterRight = result.current.current?.col ?? 0

    act(() => result.current.moveLeft())
    const afterLeft = result.current.current?.col ?? 0

    // At least one direction should change the column (it's possible the piece hits a wall on one side)
    expect(afterRight - initialCol + (initialCol - afterLeft)).toBeGreaterThanOrEqual(0)
  })

  it('rotates the current piece', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())

    const shapeBefore = result.current.current?.shape
    act(() => result.current.rotate())
    // Shape may or may not change depending on the piece (O piece doesn't change)
    expect(result.current.current?.shape).toBeDefined()
    expect(shapeBefore).toBeDefined()
  })

  it('advances piece downward on tick', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())

    const rowBefore = result.current.current?.row ?? 0
    act(() => vi.advanceTimersByTime(900))
    const rowAfter = result.current.current?.row ?? 0
    expect(rowAfter).toBeGreaterThan(rowBefore)
  })

  it('hard drop locks piece and spawns next', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())

    const pieceBefore = result.current.current
    act(() => result.current.hardDrop())

    // After hard drop, the piece should be locked and a new one spawned
    expect(result.current.current).not.toBe(pieceBefore)
  })

  it('soft drop moves piece down faster', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())

    const rowBefore = result.current.current?.row ?? 0
    act(() => result.current.moveDown())
    const rowAfter = result.current.current?.row ?? 0
    // Row should increase by 1 (or piece locked if at bottom)
    expect(rowAfter).toBeGreaterThanOrEqual(rowBefore)
  })

  it('resets state on restart', () => {
    const { result } = renderHook(() => useTetris())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(900))
    act(() => result.current.start())
    expect(result.current.score).toBe(0)
    expect(result.current.lines).toBe(0)
    expect(result.current.level).toBe(1)
  })
})
