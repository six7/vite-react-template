import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '#/components/ui-react-aria'

// --- Types ---
type Cell = string | null
type Board = Cell[][]
type Position = { row: number; col: number }
type TetrominoShape = number[][]

interface Piece {
  shape: TetrominoShape
  color: string
  pos: Position
}

interface GameState {
  board: Board
  currentPiece: Piece | null
  nextPiece: Piece | null
  score: number
  lines: number
  level: number
  gameOver: boolean
  gameStarted: boolean
}

// --- Constants ---
const ROWS = 20
const COLS = 10
const BASE_TICK_MS = 800
const TICK_DECREASE = 50
const MIN_TICK_MS = 100
const POINTS_PER_LINE = [0, 100, 300, 500, 800]

const TETROMINOES: { shape: TetrominoShape; color: string }[] = [
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-500',
  }, // O
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'bg-purple-500',
  }, // T
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'bg-green-500',
  }, // S
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'bg-red-500',
  }, // Z
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'bg-blue-500',
  }, // J
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'bg-orange-500',
  }, // L
]

// --- Helpers ---
function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null))
}

function randomPiece(): Piece {
  const idx = Math.floor(Math.random() * TETROMINOES.length)
  const t = TETROMINOES[idx] ?? TETROMINOES[0]
  if (!t) throw new Error('No tetrominoes defined')
  const firstRow = t.shape[0]
  return {
    shape: t.shape.map((r) => [...r]),
    color: t.color,
    pos: { row: 0, col: Math.floor((COLS - (firstRow?.length ?? 0)) / 2) },
  }
}

function rotate(shape: TetrominoShape): TetrominoShape {
  const rows = shape.length
  const cols = shape[0]?.length ?? 0
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r]?.[c] ?? 0)
  )
}

function collides(board: Board, shape: TetrominoShape, pos: Position): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < (shape[r]?.length ?? 0); c++) {
      if (shape[r]?.[c]) {
        const nr = pos.row + r
        const nc = pos.col + c
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return true
        if (board[nr]?.[nc]) return true
      }
    }
  }
  return false
}

function lockPiece(board: Board, piece: Piece): Board {
  const newBoard = board.map((r) => [...r])
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < (piece.shape[r]?.length ?? 0); c++) {
      if (piece.shape[r]?.[c]) {
        const nr = piece.pos.row + r
        const nc = piece.pos.col + c
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const row = newBoard[nr]
          if (row) row[nc] = piece.color
        }
      }
    }
  }
  return newBoard
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => !cell))
  const cleared = ROWS - kept.length
  const empty = Array.from({ length: cleared }, () =>
    Array.from({ length: COLS }, () => null as Cell)
  )
  return { board: [...empty, ...kept], cleared }
}

// --- Component ---
export default function Home() {
  const [state, setState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    gameStarted: false,
  })

  const stateRef = useRef(state)
  stateRef.current = state

  const startGame = useCallback(() => {
    setState({
      board: createEmptyBoard(),
      currentPiece: randomPiece(),
      nextPiece: randomPiece(),
      score: 0,
      lines: 0,
      level: 1,
      gameOver: false,
      gameStarted: true,
    })
  }, [])

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.gameStarted || prev.gameOver || !prev.currentPiece) return prev
      const newPos = { ...prev.currentPiece.pos, row: prev.currentPiece.pos.row + 1 }
      if (!collides(prev.board, prev.currentPiece.shape, newPos)) {
        return { ...prev, currentPiece: { ...prev.currentPiece, pos: newPos } }
      }
      // Lock piece
      const locked = lockPiece(prev.board, prev.currentPiece)
      const { board, cleared } = clearLines(locked)
      const newLines = prev.lines + cleared
      const newLevel = Math.floor(newLines / 10) + 1
      const newScore = prev.score + (POINTS_PER_LINE[cleared] ?? 0) * prev.level
      const next = prev.nextPiece ?? randomPiece()
      if (collides(board, next.shape, next.pos)) {
        return {
          ...prev,
          board,
          score: newScore,
          lines: newLines,
          level: newLevel,
          currentPiece: null,
          gameOver: true,
        }
      }
      return {
        ...prev,
        board,
        currentPiece: next,
        nextPiece: randomPiece(),
        score: newScore,
        lines: newLines,
        level: newLevel,
      }
    })
  }, [])

  // Game tick
  useEffect(() => {
    if (!state.gameStarted || state.gameOver) return
    const ms = Math.max(MIN_TICK_MS, BASE_TICK_MS - (state.level - 1) * TICK_DECREASE)
    const id = setInterval(tick, ms)
    return () => clearInterval(id)
  }, [state.gameStarted, state.gameOver, state.level, tick])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current
      if (!s.gameStarted || s.gameOver || !s.currentPiece) return

      const move = (dCol: number, dRow: number) => {
        setState((prev) => {
          if (!prev.currentPiece) return prev
          const newPos = {
            row: prev.currentPiece.pos.row + dRow,
            col: prev.currentPiece.pos.col + dCol,
          }
          if (collides(prev.board, prev.currentPiece.shape, newPos)) return prev
          return { ...prev, currentPiece: { ...prev.currentPiece, pos: newPos } }
        })
      }

      const doRotate = () => {
        setState((prev) => {
          if (!prev.currentPiece) return prev
          const rotated = rotate(prev.currentPiece.shape)
          if (!collides(prev.board, rotated, prev.currentPiece.pos)) {
            return { ...prev, currentPiece: { ...prev.currentPiece, shape: rotated } }
          }
          // Wall kick: try shifting left/right
          for (const offset of [-1, 1, -2, 2]) {
            const kicked = { ...prev.currentPiece.pos, col: prev.currentPiece.pos.col + offset }
            if (!collides(prev.board, rotated, kicked)) {
              return {
                ...prev,
                currentPiece: { ...prev.currentPiece, shape: rotated, pos: kicked },
              }
            }
          }
          return prev
        })
      }

      const hardDrop = () => {
        setState((prev) => {
          if (!prev.currentPiece) return prev
          let dropRow = prev.currentPiece.pos.row
          while (
            !collides(prev.board, prev.currentPiece.shape, {
              row: dropRow + 1,
              col: prev.currentPiece.pos.col,
            })
          ) {
            dropRow++
          }
          const dropped = { ...prev.currentPiece, pos: { ...prev.currentPiece.pos, row: dropRow } }
          const locked = lockPiece(prev.board, dropped)
          const { board, cleared } = clearLines(locked)
          const newLines = prev.lines + cleared
          const newLevel = Math.floor(newLines / 10) + 1
          const newScore =
            prev.score +
            (POINTS_PER_LINE[cleared] ?? 0) * prev.level +
            (dropRow - prev.currentPiece.pos.row) * 2
          const next = prev.nextPiece ?? randomPiece()
          if (collides(board, next.shape, next.pos)) {
            return {
              ...prev,
              board,
              score: newScore,
              lines: newLines,
              level: newLevel,
              currentPiece: null,
              gameOver: true,
            }
          }
          return {
            ...prev,
            board,
            currentPiece: next,
            nextPiece: randomPiece(),
            score: newScore,
            lines: newLines,
            level: newLevel,
          }
        })
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          move(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          move(1, 0)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          move(0, 1)
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          doRotate()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Build display board with current piece overlaid
  const displayBoard = useMemo(() => {
    const board = state.board.map((row) => [...row])
    if (state.currentPiece) {
      // Ghost piece
      let ghostRow = state.currentPiece.pos.row
      while (
        !collides(state.board, state.currentPiece.shape, {
          row: ghostRow + 1,
          col: state.currentPiece.pos.col,
        })
      ) {
        ghostRow++
      }
      for (let r = 0; r < state.currentPiece.shape.length; r++) {
        for (let c = 0; c < (state.currentPiece.shape[r]?.length ?? 0); c++) {
          if (state.currentPiece.shape[r]?.[c]) {
            const nr = ghostRow + r
            const nc = state.currentPiece.pos.col + c
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !board[nr]?.[nc]) {
              const ghostRowRef = board[nr]
              if (ghostRowRef) ghostRowRef[nc] = 'ghost'
            }
          }
        }
      }
      // Current piece
      for (let r = 0; r < state.currentPiece.shape.length; r++) {
        for (let c = 0; c < (state.currentPiece.shape[r]?.length ?? 0); c++) {
          if (state.currentPiece.shape[r]?.[c]) {
            const nr = state.currentPiece.pos.row + r
            const nc = state.currentPiece.pos.col + c
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              const boardRow = board[nr]
              if (boardRow) boardRow[nc] = state.currentPiece.color
            }
          }
        }
      }
    }
    return board
  }, [state.board, state.currentPiece])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
        {/* Game Board */}
        <div>
          <div
            data-testid="game-board"
            className="grid border-2 border-gray-400 dark:border-gray-600"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            }}
          >
            {displayBoard.flat().map((cell, i) => {
              const key = `cell-${String(i)}`
              return (
                <div
                  key={key}
                  className={`h-6 w-6 border border-gray-200 sm:h-7 sm:w-7 dark:border-gray-800 ${
                    cell === 'ghost'
                      ? 'bg-gray-300 dark:bg-gray-700'
                      : cell
                        ? `${cell} brightness-110`
                        : 'bg-gray-50 dark:bg-gray-950'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex w-40 flex-col gap-4">
          <div className="rounded-lg bg-white p-3 shadow dark:bg-gray-800">
            <h2 className="mb-2 font-bold text-gray-700 text-sm uppercase tracking-wide dark:text-gray-300">
              Next
            </h2>
            {state.nextPiece && (
              <div
                className="grid justify-center gap-0"
                style={{
                  gridTemplateColumns: `repeat(${state.nextPiece.shape[0]?.length ?? 0}, 1.25rem)`,
                }}
              >
                {state.nextPiece.shape.flat().map((cell, i) => {
                  const key = `next-${String(i)}`
                  return (
                    <div
                      key={key}
                      className={`h-5 w-5 ${cell ? state.nextPiece?.color : 'bg-transparent'}`}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-3 shadow dark:bg-gray-800">
            <div className="space-y-1 font-mono text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Score</span>
                <span data-testid="score-display">{state.score}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Lines</span>
                <span>{state.lines}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Level</span>
                <span>{state.level}</span>
              </div>
            </div>
          </div>

          {(!state.gameStarted || state.gameOver) && (
            <Button variant="primary" onPress={startGame}>
              {state.gameOver ? 'Restart' : 'Start Game'}
            </Button>
          )}

          {state.gameOver && (
            <div className="text-center font-bold text-lg text-red-500">Game Over!</div>
          )}

          <div className="text-gray-500 text-xs dark:text-gray-500">
            <p className="font-semibold">Controls</p>
            <p>← → ↓ or A D S — Move</p>
            <p>↑ or W — Rotate</p>
            <p>Space — Hard Drop</p>
          </div>
        </div>
      </div>
    </div>
  )
}
