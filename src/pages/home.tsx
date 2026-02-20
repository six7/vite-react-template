import { useEffect, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type CellColor = string | null

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

type Piece = {
  type: TetrominoType
  shape: number[][]
  color: string
  x: number
  y: number
}

type GameState = {
  board: CellColor[][]
  currentPiece: Piece | null
  nextPiece: Piece | null
  score: number
  level: number
  lines: number
  gameOver: boolean
  gameStarted: boolean
}

type GameAction =
  | { type: 'START' }
  | { type: 'TICK' }
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'ROTATE' }
  | { type: 'HARD_DROP' }

// ─── Constants ────────────────────────────────────────────────────────────────

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_SPEED = 800
const MIN_SPEED = 100
const SPEED_DECREMENT = 50

const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: 'bg-cyan-400 dark:bg-cyan-300',
  O: 'bg-yellow-400 dark:bg-yellow-300',
  T: 'bg-purple-500 dark:bg-purple-400',
  S: 'bg-green-500 dark:bg-green-400',
  Z: 'bg-red-500 dark:bg-red-400',
  J: 'bg-blue-600 dark:bg-blue-500',
  L: 'bg-orange-500 dark:bg-orange-400',
}

const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
}

// Points awarded per lines cleared (multiplied by current level)
const SCORE_TABLE = [0, 100, 300, 500, 800]

const ALL_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const createEmptyBoard = (): CellColor[][] =>
  Array.from({ length: BOARD_HEIGHT }, () => Array<CellColor>(BOARD_WIDTH).fill(null))

const randomType = (): TetrominoType =>
  ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)] ?? 'I'

const spawnPiece = (type: TetrominoType): Piece => {
  const shape = TETROMINO_SHAPES[type]
  const width = shape[0]?.length ?? 1
  return {
    type,
    shape,
    color: TETROMINO_COLORS[type],
    x: Math.floor((BOARD_WIDTH - width) / 2),
    y: 0,
  }
}

const rotateCW = (shape: number[][]): number[][] => {
  const rows = shape.length
  const cols = shape[0]?.length ?? 0
  return Array.from({ length: cols }, (_, ci) =>
    Array.from({ length: rows }, (_, ri) => shape[rows - 1 - ri]?.[ci] ?? 0)
  )
}

const isValid = (board: CellColor[][], piece: Piece, dx = 0, dy = 0): boolean =>
  piece.shape.every((row, ri) =>
    row.every((cell, ci) => {
      if (!cell) return true
      const nx = piece.x + ci + dx
      const ny = piece.y + ri + dy
      if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return false
      if (ny < 0) return true
      return board[ny]?.[nx] == null
    })
  )

const placePieceOnBoard = (board: CellColor[][], piece: Piece): CellColor[][] => {
  const next = board.map((row) => [...row])
  piece.shape.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (!cell) return
      const ny = piece.y + ri
      const nx = piece.x + ci
      if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
        const r = next[ny]
        if (r) r[nx] = piece.color
      }
    })
  })
  return next
}

const clearFullLines = (board: CellColor[][]): { board: CellColor[][]; cleared: number } => {
  const kept = board.filter((row) => row.some((cell) => cell === null))
  const cleared = BOARD_HEIGHT - kept.length
  const empty = Array.from({ length: cleared }, () => Array<CellColor>(BOARD_WIDTH).fill(null))
  return { board: [...empty, ...kept], cleared }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: GameState = {
  board: createEmptyBoard(),
  currentPiece: null,
  nextPiece: null,
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
  gameStarted: false,
}

function lockAndAdvance(state: GameState, piece: Piece): GameState {
  const placed = placePieceOnBoard(state.board, piece)
  const { board, cleared } = clearFullLines(placed)
  const newLines = state.lines + cleared
  const newLevel = Math.floor(newLines / 10) + 1
  const newScore =
    state.score + (SCORE_TABLE[Math.min(cleared, SCORE_TABLE.length - 1)] ?? 0) * state.level
  const next = state.nextPiece ?? spawnPiece(randomType())
  if (!isValid(board, next)) {
    return {
      ...state,
      board,
      currentPiece: null,
      score: newScore,
      lines: newLines,
      level: newLevel,
      gameOver: true,
      gameStarted: false,
    }
  }
  return {
    ...state,
    board,
    currentPiece: next,
    nextPiece: spawnPiece(randomType()),
    score: newScore,
    lines: newLines,
    level: newLevel,
  }
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      return {
        board: createEmptyBoard(),
        currentPiece: spawnPiece(randomType()),
        nextPiece: spawnPiece(randomType()),
        score: 0,
        level: 1,
        lines: 0,
        gameOver: false,
        gameStarted: true,
      }
    case 'TICK': {
      if (!state.gameStarted || state.gameOver || !state.currentPiece) return state
      const p = state.currentPiece
      if (isValid(state.board, p, 0, 1)) return { ...state, currentPiece: { ...p, y: p.y + 1 } }
      return lockAndAdvance(state, p)
    }
    case 'MOVE': {
      if (!state.gameStarted || state.gameOver || !state.currentPiece) return state
      const p = state.currentPiece
      if (action.dy > 0) {
        if (isValid(state.board, p, 0, 1))
          return { ...state, currentPiece: { ...p, y: p.y + 1 }, score: state.score + 1 }
        return lockAndAdvance(state, p)
      }
      if (isValid(state.board, p, action.dx, 0))
        return { ...state, currentPiece: { ...p, x: p.x + action.dx } }
      return state
    }
    case 'ROTATE': {
      if (!state.gameStarted || state.gameOver || !state.currentPiece) return state
      const p = state.currentPiece
      const rotated = { ...p, shape: rotateCW(p.shape) }
      if (isValid(state.board, rotated)) return { ...state, currentPiece: rotated }
      // Wall kicks
      if (isValid(state.board, rotated, 1, 0))
        return { ...state, currentPiece: { ...rotated, x: rotated.x + 1 } }
      if (isValid(state.board, rotated, -1, 0))
        return { ...state, currentPiece: { ...rotated, x: rotated.x - 1 } }
      return state
    }
    case 'HARD_DROP': {
      if (!state.gameStarted || state.gameOver || !state.currentPiece) return state
      let p = state.currentPiece
      let dropped = 0
      while (isValid(state.board, p, 0, 1)) {
        p = { ...p, y: p.y + 1 }
        dropped++
      }
      return lockAndAdvance({ ...state, score: state.score + dropped * 2 }, p)
    }
    default:
      return state
  }
}

// ─── Components ───────────────────────────────────────────────────────────────

function NextPiecePreview({ piece }: { piece: Piece | null }): ReactNode {
  const cells: Array<{ key: string; color: CellColor }> = []
  for (let ri = 0; ri < 4; ri++) {
    for (let ci = 0; ci < 4; ci++) {
      const color = piece && (piece.shape[ri]?.[ci] ?? 0) ? piece.color : null
      cells.push({ key: `n${ri}${ci}`, color })
    }
  }
  return (
    <div
      className="grid grid-cols-4 border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
      aria-label="Next piece preview"
    >
      {cells.map(({ key, color }) => (
        <div key={key} className={color ? `size-5 ${color}` : 'size-5'} />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  // Game tick
  useEffect(() => {
    if (!state.gameStarted || state.gameOver) return
    const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (state.level - 1) * SPEED_DECREMENT)
    const id = setInterval(() => dispatch({ type: 'TICK' }), speed)
    return () => clearInterval(id)
  }, [state.gameStarted, state.gameOver, state.level])

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { gameStarted, gameOver } = stateRef.current
      if (!gameStarted || gameOver) return
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dispatch({ type: 'MOVE', dx: -1, dy: 0 })
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          dispatch({ type: 'MOVE', dx: 1, dy: 0 })
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          dispatch({ type: 'MOVE', dx: 0, dy: 1 })
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          dispatch({ type: 'ROTATE' })
          break
        case ' ':
          e.preventDefault()
          dispatch({ type: 'HARD_DROP' })
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Build display board (board + active piece overlay)
  const display: CellColor[][] = state.board.map((row) => [...row])
  if (state.currentPiece) {
    const p = state.currentPiece
    p.shape.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (!cell) return
        const ny = p.y + ri
        const nx = p.x + ci
        if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
          const r = display[ny]
          if (r) r[nx] = p.color
        }
      })
    })
  }

  // Flatten board for rendering (avoids nested-map array-index key issues)
  const flatCells: Array<{ key: string; color: CellColor }> = []
  for (let ri = 0; ri < BOARD_HEIGHT; ri++) {
    for (let ci = 0; ci < BOARD_WIDTH; ci++) {
      flatCells.push({ key: `${ri},${ci}`, color: display[ri]?.[ci] ?? null })
    }
  }

  const buttonLabel = state.gameOver ? 'Play Again' : state.gameStarted ? 'Restart' : 'Start'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <h1 className="mb-6 font-bold text-4xl text-gray-800 dark:text-gray-100">Tetris</h1>

      <div className="flex gap-6">
        {/* Game board – 10 × 20 CSS grid */}
        <div
          className="grid grid-cols-[repeat(10,1.75rem)] border-2 border-gray-400 dark:border-gray-600"
          data-testid="game-board"
          aria-label="Game board"
        >
          {flatCells.map(({ key, color }) => (
            <div
              key={key}
              className={
                color
                  ? `size-7 border border-gray-200 dark:border-gray-700 ${color}`
                  : 'size-7 border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }
            />
          ))}
        </div>

        {/* Side panel */}
        <div className="flex w-32 flex-col gap-4">
          <div>
            <p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
              Next
            </p>
            <NextPiecePreview piece={state.nextPiece} />
          </div>

          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
              Score
            </p>
            <p className="font-bold text-2xl text-gray-800 dark:text-gray-100" data-testid="score">
              {state.score}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
              Level
            </p>
            <p className="font-bold text-gray-800 text-xl dark:text-gray-100">{state.level}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide dark:text-gray-400">
              Lines
            </p>
            <p className="font-bold text-gray-800 text-xl dark:text-gray-100">{state.lines}</p>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: 'START' })}
            className="rounded bg-indigo-600 px-3 py-2 font-semibold text-sm text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {buttonLabel}
          </button>

          {state.gameOver && (
            <p className="text-center font-bold text-red-500 text-sm dark:text-red-400">
              Game Over
            </p>
          )}
        </div>
      </div>

      {!state.gameStarted && !state.gameOver && (
        <p className="mt-4 text-center text-gray-500 text-sm dark:text-gray-400">
          Arrow keys or WASD to move/rotate • Space for hard drop
        </p>
      )}
    </div>
  )
}
