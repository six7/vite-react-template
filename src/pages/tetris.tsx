import { useEffect, useMemo, useReducer, useRef } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────

const COLS = 10
const ROWS = 20
const SCORE_TABLE: readonly number[] = [0, 100, 300, 500, 800]
const GHOST = 'ghost'

// ─── Types ───────────────────────────────────────────────────────────────────

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
type Cell = string | null
type Grid = Cell[][]
type Shape = number[][]

interface Piece {
  type: PieceType
  shape: Shape
  x: number
  y: number
  color: string
}

interface GameState {
  grid: Grid
  currentPiece: Piece | null
  nextType: PieceType
  score: number
  level: number
  lines: number
  gameOver: boolean
  started: boolean
}

type GameAction =
  | { type: 'START' }
  | { type: 'TICK' }
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'ROTATE' }
  | { type: 'HARD_DROP' }

// ─── Tetromino Definitions ───────────────────────────────────────────────────

const SHAPES: Record<PieceType, Shape> = {
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

const COLORS: Record<PieceType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-500',
  L: 'bg-orange-500',
}

const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

// ─── Utilities ───────────────────────────────────────────────────────────────

const createGrid = (): Grid => Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))

const randomType = (): PieceType =>
  PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)] ?? 'I'

/** Rotate a shape matrix 90° clockwise. */
const rotateCW = (shape: Shape): Shape => {
  const rows = shape.length
  const cols = shape[0]?.length ?? 0
  return Array.from({ length: cols }, (_, i) =>
    Array.from({ length: rows }, (_, j) => shape[rows - 1 - j]?.[i] ?? 0)
  )
}

const createPiece = (type: PieceType): Piece => {
  const shape = SHAPES[type]
  const cols = shape[0]?.length ?? 0
  return {
    type,
    shape,
    x: Math.floor(COLS / 2) - Math.floor(cols / 2),
    y: 0,
    color: COLORS[type],
  }
}

const isValid = (grid: Grid, shape: Shape, x: number, y: number): boolean => {
  for (let r = 0; r < shape.length; r++) {
    const row = shape[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      if (!row[c]) continue
      const nx = x + c
      const ny = y + r
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false
      if (ny >= 0 && grid[ny]?.[nx] !== null) return false
    }
  }
  return true
}

const lockPiece = (grid: Grid, piece: Piece): Grid => {
  const next = grid.map((row) => [...row])
  for (let r = 0; r < piece.shape.length; r++) {
    const row = piece.shape[r]
    if (!row) continue
    for (let c = 0; c < row.length; c++) {
      if (!row[c]) continue
      const y = piece.y + r
      const x = piece.x + c
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        const gridRow = next[y]
        if (gridRow) gridRow[x] = piece.color
      }
    }
  }
  return next
}

const clearLines = (grid: Grid): [Grid, number] => {
  const remaining = grid.filter((row) => row.some((cell) => cell === null))
  const cleared = ROWS - remaining.length
  if (cleared === 0) return [grid, 0]
  const emptyRows = Array.from({ length: cleared }, () => Array<Cell>(COLS).fill(null))
  return [[...emptyRows, ...remaining], cleared]
}

const getDropInterval = (level: number): number => Math.max(100, 800 - (level - 1) * 70)

const getGhostY = (grid: Grid, piece: Piece): number => {
  let y = piece.y
  while (isValid(grid, piece.shape, piece.x, y + 1)) y++
  return y
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function lockAndSpawn(state: GameState, piece: Piece): GameState {
  const locked = lockPiece(state.grid, piece)
  const [newGrid, cleared] = clearLines(locked)
  const newLines = state.lines + cleared
  const newLevel = Math.floor(newLines / 10) + 1
  const newScore = state.score + (SCORE_TABLE[cleared] ?? 0) * newLevel
  const nextPiece = createPiece(state.nextType)
  if (!isValid(newGrid, nextPiece.shape, nextPiece.x, nextPiece.y)) {
    return {
      ...state,
      grid: newGrid,
      currentPiece: null,
      score: newScore,
      level: newLevel,
      lines: newLines,
      gameOver: true,
    }
  }
  return {
    ...state,
    grid: newGrid,
    currentPiece: nextPiece,
    nextType: randomType(),
    score: newScore,
    level: newLevel,
    lines: newLines,
  }
}

const initialState: GameState = {
  grid: createGrid(),
  currentPiece: null,
  nextType: randomType(),
  score: 0,
  level: 1,
  lines: 0,
  gameOver: false,
  started: false,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      return {
        grid: createGrid(),
        currentPiece: createPiece(randomType()),
        nextType: randomType(),
        score: 0,
        level: 1,
        lines: 0,
        gameOver: false,
        started: true,
      }
    }
    case 'TICK': {
      if (!state.started || state.gameOver || !state.currentPiece) return state
      const piece = state.currentPiece
      if (isValid(state.grid, piece.shape, piece.x, piece.y + 1)) {
        return { ...state, currentPiece: { ...piece, y: piece.y + 1 } }
      }
      return lockAndSpawn(state, piece)
    }
    case 'MOVE': {
      if (!state.started || state.gameOver || !state.currentPiece) return state
      const piece = state.currentPiece
      const nx = piece.x + action.dx
      const ny = piece.y + action.dy
      if (!isValid(state.grid, piece.shape, nx, ny)) return state
      return { ...state, currentPiece: { ...piece, x: nx, y: ny } }
    }
    case 'ROTATE': {
      if (!state.started || state.gameOver || !state.currentPiece) return state
      const piece = state.currentPiece
      const rotated = rotateCW(piece.shape)
      for (const offset of [0, -1, 1, -2, 2]) {
        if (isValid(state.grid, rotated, piece.x + offset, piece.y)) {
          return { ...state, currentPiece: { ...piece, shape: rotated, x: piece.x + offset } }
        }
      }
      return state
    }
    case 'HARD_DROP': {
      if (!state.started || state.gameOver || !state.currentPiece) return state
      const piece = state.currentPiece
      return lockAndSpawn(state, { ...piece, y: getGhostY(state.grid, piece) })
    }
    default:
      return state
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface GridCell {
  id: string
  color: Cell
}

export default function Tetris() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { grid, currentPiece, nextType, score, level, lines, gameOver, started } = state

  // Ref so the keydown handler can check active state without stale closure.
  const activeRef = useRef(false)
  useEffect(() => {
    activeRef.current = started && !gameOver
  }, [started, gameOver])

  // Game loop – re-created when level or game state changes.
  useEffect(() => {
    if (!started || gameOver) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), getDropInterval(level))
    return () => clearInterval(id)
  }, [started, gameOver, level])

  // Keyboard controls – added once on mount.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = activeRef.current
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (active) e.preventDefault()
          dispatch({ type: 'MOVE', dx: -1, dy: 0 })
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (active) e.preventDefault()
          dispatch({ type: 'MOVE', dx: 1, dy: 0 })
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (active) e.preventDefault()
          dispatch({ type: 'ROTATE' })
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          if (active) e.preventDefault()
          dispatch({ type: 'MOVE', dx: 0, dy: 1 })
          break
        case ' ':
          if (active) e.preventDefault()
          dispatch({ type: 'HARD_DROP' })
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Build a flat array of cells for the board (locked pieces + ghost + active piece).
  const boardCells = useMemo<GridCell[]>(() => {
    const g: Grid = grid.map((row) => [...row])
    if (currentPiece) {
      const ghostY = getGhostY(grid, currentPiece)
      // Draw ghost only when it differs from the active piece position.
      if (ghostY !== currentPiece.y) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
          const row = currentPiece.shape[r]
          if (!row) continue
          for (let c = 0; c < row.length; c++) {
            if (!row[c]) continue
            const gy = ghostY + r
            const gx = currentPiece.x + c
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
              const gridRow = g[gy]
              if (gridRow && gridRow[gx] === null) gridRow[gx] = GHOST
            }
          }
        }
      }
      // Draw active piece.
      for (let r = 0; r < currentPiece.shape.length; r++) {
        const row = currentPiece.shape[r]
        if (!row) continue
        for (let c = 0; c < row.length; c++) {
          if (!row[c]) continue
          const py = currentPiece.y + r
          const px = currentPiece.x + c
          if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
            const gridRow = g[py]
            if (gridRow) gridRow[px] = currentPiece.color
          }
        }
      }
    }
    const cells: GridCell[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        cells.push({ id: `${r}-${c}`, color: g[r]?.[c] ?? null })
      }
    }
    return cells
  }, [grid, currentPiece])

  // Build flat array for the 4×4 next-piece preview.
  const nextCells = useMemo<GridCell[]>(() => {
    const shape = SHAPES[nextType]
    const color = COLORS[nextType]
    const size = 4
    const preview: Cell[][] = Array.from({ length: size }, () => Array<Cell>(size).fill(null))
    const sr = Math.floor((size - shape.length) / 2)
    const sc = Math.floor((size - (shape[0]?.length ?? 0)) / 2)
    for (let r = 0; r < shape.length; r++) {
      const row = shape[r]
      if (!row) continue
      for (let c = 0; c < row.length; c++) {
        if (!row[c]) continue
        const pr = preview[sr + r]
        if (pr) pr[sc + c] = color
      }
    }
    const cells: GridCell[] = []
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        cells.push({ id: `next-${r}-${c}`, color: preview[r]?.[c] ?? null })
      }
    }
    return cells
  }, [nextType])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <h1 className="mb-6 font-bold font-mono text-4xl text-white tracking-widest">TETRIS</h1>

      <div className="flex gap-6">
        {/* ── Game Board ── */}
        <div className="relative">
          <div className="grid grid-cols-10 border-2 border-gray-600">
            {boardCells.map(({ id, color }) => (
              <div
                key={id}
                className={`h-6 w-6 border border-gray-800 ${
                  color === GHOST ? 'bg-gray-500 opacity-30' : color ? color : 'bg-gray-900'
                }`}
              />
            ))}
          </div>

          {/* Start screen */}
          {!started && !gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75">
              <p className="mb-2 font-mono text-gray-400 text-sm">Use ↑↓←→ or WASD</p>
              <p className="mb-6 font-mono text-gray-400 text-sm">Space = hard drop</p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'START' })}
                className="rounded-lg bg-indigo-600 px-8 py-3 font-bold text-white hover:bg-indigo-500 active:bg-indigo-700"
              >
                Start Game
              </button>
            </div>
          )}

          {/* Game-over screen */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75">
              <p className="mb-2 font-bold font-mono text-2xl text-red-400">GAME OVER</p>
              <p className="mb-6 font-mono text-gray-300">Score: {score}</p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'START' })}
                className="rounded-lg bg-indigo-600 px-8 py-3 font-bold text-white hover:bg-indigo-500 active:bg-indigo-700"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* ── Side Panel ── */}
        <div className="flex w-36 flex-col gap-4">
          <div className="rounded-lg bg-gray-800 p-3">
            <div className="font-mono text-gray-400 text-xs">SCORE</div>
            <div className="font-bold font-mono text-white text-xl">{score}</div>
          </div>

          <div className="rounded-lg bg-gray-800 p-3">
            <div className="font-mono text-gray-400 text-xs">LEVEL</div>
            <div className="font-bold font-mono text-white text-xl">{level}</div>
          </div>

          <div className="rounded-lg bg-gray-800 p-3">
            <div className="font-mono text-gray-400 text-xs">LINES</div>
            <div className="font-bold font-mono text-white text-xl">{lines}</div>
          </div>

          {/* Next piece preview */}
          <div className="rounded-lg bg-gray-800 p-3">
            <div className="mb-2 font-mono text-gray-400 text-xs">NEXT</div>
            <div className="grid grid-cols-4">
              {nextCells.map(({ id, color }) => (
                <div key={id} className={`h-5 w-5 ${color ? color : 'bg-gray-900'}`} />
              ))}
            </div>
          </div>

          {/* Controls guide */}
          <div className="rounded-lg bg-gray-800 p-3">
            <div className="mb-2 font-mono text-gray-400 text-xs">CONTROLS</div>
            <div className="space-y-1 font-mono text-gray-400 text-xs">
              <div>← / A &nbsp; Left</div>
              <div>→ / D &nbsp; Right</div>
              <div>↑ / W &nbsp; Rotate</div>
              <div>↓ / S &nbsp; Soft drop</div>
              <div>Space &nbsp; Hard drop</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
