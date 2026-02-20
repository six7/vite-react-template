import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  type Board,
  type Cell,
  LINES_PER_LEVEL,
  SCORE_TABLE,
  TETROMINOES,
  TETROMINO_TYPES,
  TICK_MIN,
  TICK_START,
  TICK_STEP,
  type Tetromino,
  type TetrominoType,
} from '#/lib/tetris-constants'

function emptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array<Cell>(BOARD_WIDTH).fill(null))
}

function randomTetromino(): Tetromino {
  const type = (TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)] ??
    'I') as TetrominoType
  const shape = TETROMINOES[type][0] as number[][]
  const col = Math.floor((BOARD_WIDTH - (shape[0]?.length ?? 0)) / 2)
  return { type, shape, row: 0, col }
}

function isValid(board: Board, piece: Tetromino): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < (piece.shape[r]?.length ?? 0); c++) {
      if (piece.shape[r]?.[c] === 0) continue
      const nr = piece.row + r
      const nc = piece.col + c
      if (nr < 0 || nr >= BOARD_HEIGHT || nc < 0 || nc >= BOARD_WIDTH) return false
      if (board[nr]?.[nc] !== null) return false
    }
  }
  return true
}

function lockPiece(board: Board, piece: Tetromino): Board {
  const next = board.map((row) => [...row])
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < (piece.shape[r]?.length ?? 0); c++) {
      if (piece.shape[r]?.[c] === 0) continue
      const nr = piece.row + r
      const nc = piece.col + c
      if (nr >= 0 && nr < BOARD_HEIGHT && nc >= 0 && nc < BOARD_WIDTH) {
        const row = next[nr]
        if (row) row[nc] = piece.type
      }
    }
  }
  return next
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell === null))
  const cleared = BOARD_HEIGHT - kept.length
  const empty = Array.from({ length: cleared }, () => Array<Cell>(BOARD_WIDTH).fill(null))
  return { board: [...empty, ...kept], cleared }
}

function rotatePiece(piece: Tetromino): Tetromino {
  const type = piece.type
  const rotations = TETROMINOES[type]
  const currentIdx = rotations.findIndex((r) => {
    if (r.length !== piece.shape.length) return false
    return r.every((row, ri) => row.every((cell, ci) => cell === piece.shape[ri]?.[ci]))
  })
  const safeIdx = currentIdx === -1 ? 0 : currentIdx
  const nextIdx = (safeIdx + 1) % rotations.length
  return { ...piece, shape: rotations[nextIdx] as number[][] }
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'over'

export interface TetrisState {
  board: Board
  current: Tetromino | null
  next: Tetromino | null
  score: number
  level: number
  lines: number
  status: GameStatus
}

export interface TetrisActions {
  start: () => void
  pause: () => void
  moveLeft: () => void
  moveRight: () => void
  moveDown: () => void
  rotate: () => void
  hardDrop: () => void
}

export function useTetris(): TetrisState & TetrisActions {
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [current, setCurrent] = useState<Tetromino | null>(null)
  const [next, setNext] = useState<Tetromino | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [status, setStatus] = useState<GameStatus>('idle')

  const boardRef = useRef(board)
  const currentRef = useRef(current)
  const statusRef = useRef(status)
  const linesRef = useRef(lines)
  const scoreRef = useRef(score)
  const levelRef = useRef(level)
  const nextRef = useRef(next)

  boardRef.current = board
  currentRef.current = current
  statusRef.current = status
  linesRef.current = lines
  scoreRef.current = score
  levelRef.current = level
  nextRef.current = next

  const spawnNext = useCallback((board: Board, nextPiece: Tetromino) => {
    if (!isValid(board, nextPiece)) {
      setStatus('over')
      return false
    }
    setCurrent(nextPiece)
    setNext(randomTetromino())
    return true
  }, [])

  const lockAndSpawn = useCallback(
    (board: Board, piece: Tetromino) => {
      const locked = lockPiece(board, piece)
      const { board: cleared, cleared: count } = clearLines(locked)
      const newLines = linesRef.current + count
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1
      const newScore = scoreRef.current + (SCORE_TABLE[count] ?? 0) * levelRef.current
      setBoard(cleared)
      setLines(newLines)
      setLevel(newLevel)
      setScore(newScore)
      linesRef.current = newLines
      levelRef.current = newLevel
      scoreRef.current = newScore
      const nextPiece = nextRef.current ?? randomTetromino()
      spawnNext(cleared, nextPiece)
    },
    [spawnNext]
  )

  const tick = useCallback(() => {
    const cur = currentRef.current
    const brd = boardRef.current
    if (!cur || statusRef.current !== 'playing') return
    const moved = { ...cur, row: cur.row + 1 }
    if (isValid(brd, moved)) {
      setCurrent(moved)
    } else {
      lockAndSpawn(brd, cur)
    }
  }, [lockAndSpawn])

  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTick = useCallback(() => {
    if (tickInterval.current) {
      clearInterval(tickInterval.current)
      tickInterval.current = null
    }
  }, [])

  const startTick = useCallback(
    (lvl: number) => {
      stopTick()
      const delay = Math.max(TICK_MIN, TICK_START - (lvl - 1) * TICK_STEP)
      tickInterval.current = setInterval(tick, delay)
    },
    [tick, stopTick]
  )

  useEffect(() => {
    if (status === 'playing') {
      startTick(level)
    } else {
      stopTick()
    }
    return stopTick
  }, [status, level, startTick, stopTick])

  const start = useCallback(() => {
    const fresh = emptyBoard()
    const first = randomTetromino()
    const nxt = randomTetromino()
    setBoard(fresh)
    setScore(0)
    setLines(0)
    setLevel(1)
    linesRef.current = 0
    scoreRef.current = 0
    levelRef.current = 1
    setCurrent(first)
    setNext(nxt)
    nextRef.current = nxt
    setStatus('playing')
  }, [])

  const pause = useCallback(() => {
    setStatus((s) => {
      if (s === 'playing') return 'paused'
      if (s === 'paused') return 'playing'
      return s
    })
  }, [])

  const moveLeft = useCallback(() => {
    const cur = currentRef.current
    const brd = boardRef.current
    if (!cur || statusRef.current !== 'playing') return
    const moved = { ...cur, col: cur.col - 1 }
    if (isValid(brd, moved)) setCurrent(moved)
  }, [])

  const moveRight = useCallback(() => {
    const cur = currentRef.current
    const brd = boardRef.current
    if (!cur || statusRef.current !== 'playing') return
    const moved = { ...cur, col: cur.col + 1 }
    if (isValid(brd, moved)) setCurrent(moved)
  }, [])

  const moveDown = useCallback(() => {
    const cur = currentRef.current
    const brd = boardRef.current
    if (!cur || statusRef.current !== 'playing') return
    const moved = { ...cur, row: cur.row + 1 }
    if (isValid(brd, moved)) {
      setCurrent(moved)
    } else {
      lockAndSpawn(brd, cur)
    }
  }, [lockAndSpawn])

  const rotate = useCallback(() => {
    const cur = currentRef.current
    const brd = boardRef.current
    if (!cur || statusRef.current !== 'playing') return
    const rotated = rotatePiece(cur)
    if (isValid(brd, rotated)) {
      setCurrent(rotated)
    } else {
      // wall kick: try shifting left or right
      const kickLeft = { ...rotated, col: rotated.col - 1 }
      const kickRight = { ...rotated, col: rotated.col + 1 }
      if (isValid(brd, kickLeft)) setCurrent(kickLeft)
      else if (isValid(brd, kickRight)) setCurrent(kickRight)
    }
  }, [])

  const hardDrop = useCallback(() => {
    const cur = currentRef.current
    const brd = boardRef.current
    if (!cur || statusRef.current !== 'playing') return
    let dropped = { ...cur }
    while (isValid(brd, { ...dropped, row: dropped.row + 1 })) {
      dropped = { ...dropped, row: dropped.row + 1 }
    }
    lockAndSpawn(brd, dropped)
  }, [lockAndSpawn])

  return {
    board,
    current,
    next,
    score,
    level,
    lines,
    status,
    start,
    pause,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
  }
}
