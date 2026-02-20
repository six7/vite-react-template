import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTetris } from '#/hooks/use-tetris'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  TETROMINO_COLORS,
  type Tetromino,
  type TetrominoType,
} from '#/lib/tetris-constants'

function getGhostRow(
  board: ReturnType<typeof useTetris>['board'],
  current: Tetromino | null
): number {
  if (!current) return -1
  let row = current.row
  while (true) {
    const candidate: Tetromino = { ...current, row: row + 1 }
    let valid = true
    for (let r = 0; r < candidate.shape.length; r++) {
      for (let c = 0; c < (candidate.shape[r]?.length ?? 0); c++) {
        if (candidate.shape[r]?.[c] === 0) continue
        const nr = candidate.row + r
        const nc = candidate.col + c
        if (nr >= BOARD_HEIGHT || nc < 0 || nc >= BOARD_WIDTH || board[nr]?.[nc] !== null) {
          valid = false
          break
        }
      }
      if (!valid) break
    }
    if (!valid) break
    row++
  }
  return row
}

export default function TetrisPage() {
  const {
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
  } = useTetris()

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          moveLeft()
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          moveRight()
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          moveDown()
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          rotate()
          break
        case ' ':
          e.preventDefault()
          if (status === 'idle' || status === 'over') start()
          else hardDrop()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          pause()
          break
        case 'Enter':
          if (status === 'idle' || status === 'over') start()
          break
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [status, start, pause, moveLeft, moveRight, moveDown, rotate, hardDrop])

  const ghostRow = getGhostRow(board, current)

  type DisplayCell = { key: string; type: TetrominoType | null; isGhost: boolean }
  const boardCells: DisplayCell[] = []
  for (let ri = 0; ri < BOARD_HEIGHT; ri++) {
    for (let ci = 0; ci < BOARD_WIDTH; ci++) {
      const cell = board[ri]?.[ci] ?? null
      if (cell !== null) {
        boardCells.push({ key: `${ri}-${ci}`, type: cell, isGhost: false })
        continue
      }
      let displayType: TetrominoType | null = null
      let isGhost = false
      if (current) {
        const pr = ri - current.row
        const pc = ci - current.col
        if (
          pr >= 0 &&
          pr < current.shape.length &&
          pc >= 0 &&
          pc < (current.shape[pr]?.length ?? 0) &&
          current.shape[pr]?.[pc] === 1
        ) {
          displayType = current.type
        } else {
          const gr = ri - ghostRow
          const gc = ci - current.col
          if (
            gr >= 0 &&
            gr < current.shape.length &&
            gc >= 0 &&
            gc < (current.shape[gr]?.length ?? 0) &&
            current.shape[gr]?.[gc] === 1
          ) {
            displayType = current.type
            isGhost = true
          }
        }
      }
      boardCells.push({ key: `${ri}-${ci}`, type: displayType, isGhost })
    }
  }

  const nextCells: Array<{ key: string; filled: boolean }> = []
  if (next) {
    for (let ri = 0; ri < next.shape.length; ri++) {
      const row = next.shape[ri]
      if (!row) continue
      for (let ci = 0; ci < row.length; ci++) {
        nextCells.push({ key: `${ri}-${ci}`, filled: row[ci] === 1 })
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <h1 className="font-bold font-mono text-3xl text-gray-900 tracking-widest dark:text-gray-100">
        TETRIS
      </h1>

      <div className="flex items-start gap-6">
        {/* Board */}
        <div
          className="border-2 border-gray-400 dark:border-gray-600"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1.5rem)` }}
        >
          {boardCells.map(({ key, type, isGhost }) => (
            <div
              key={key}
              className={[
                'h-6 w-6 border border-gray-200 dark:border-gray-800',
                type && !isGhost ? TETROMINO_COLORS[type] : '',
                isGhost && type ? `${TETROMINO_COLORS[type]} opacity-25` : '',
                !type ? 'bg-white dark:bg-gray-900' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="flex w-28 flex-col gap-4 font-mono">
          {/* Next piece */}
          <div>
            <p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
              Next
            </p>
            <div className="flex h-16 w-16 items-center justify-center border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
              {next && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${next.shape[0]?.length}, 1rem)`,
                  }}
                >
                  {nextCells.map(({ key, filled }) => (
                    <div
                      key={key}
                      className={`h-4 w-4 ${filled ? TETROMINO_COLORS[next.type] : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
                Score
              </p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{score}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
                Level
              </p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{level}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest dark:text-gray-400">
                Lines
              </p>
              <p className="font-bold text-gray-900 dark:text-gray-100">{lines}</p>
            </div>
          </div>

          {/* Controls hint */}
          <div className="mt-2 space-y-1 text-gray-400 text-xs dark:text-gray-600">
            <p>←/A Move</p>
            <p>→/D Move</p>
            <p>↑/W Rotate</p>
            <p>↓/S Soft drop</p>
            <p>Space Drop</p>
            <p>P Pause</p>
          </div>
        </div>
      </div>

      {/* Overlay messages */}
      {status === 'idle' && (
        <p className="font-mono text-gray-500 text-sm dark:text-gray-400">
          Press <kbd className="rounded bg-gray-200 px-1 dark:bg-gray-800">Enter</kbd> or{' '}
          <kbd className="rounded bg-gray-200 px-1 dark:bg-gray-800">Space</kbd> to start
        </p>
      )}
      {status === 'paused' && (
        <p className="font-mono text-sm text-yellow-600 dark:text-yellow-400">
          Paused — press <kbd className="rounded bg-gray-200 px-1 dark:bg-gray-800">P</kbd> to
          resume
        </p>
      )}
      {status === 'over' && (
        <p className="font-mono text-red-600 text-sm dark:text-red-400">
          Game Over — press <kbd className="rounded bg-gray-200 px-1 dark:bg-gray-800">Enter</kbd>{' '}
          to restart
        </p>
      )}

      <Link
        to="/"
        className="font-mono text-gray-400 text-xs underline-offset-2 hover:underline dark:text-gray-600"
      >
        ← back home
      </Link>
    </div>
  )
}
