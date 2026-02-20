import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
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
          if (status === 'idle' || status === 'over') {
            e.preventDefault()
            start()
          } else if (status === 'playing') {
            e.preventDefault()
            hardDrop()
          }
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

  const ghostRow = useMemo(() => getGhostRow(board, current), [board, current])

  type DisplayCell = { key: string; type: TetrominoType | null; isGhost: boolean }
  const boardCells = useMemo(() => {
    const cells: DisplayCell[] = []
    for (let ri = 0; ri < BOARD_HEIGHT; ri++) {
      for (let ci = 0; ci < BOARD_WIDTH; ci++) {
        const cell = board[ri]?.[ci] ?? null
        if (cell !== null) {
          cells.push({ key: `${ri}-${ci}`, type: cell, isGhost: false })
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
        cells.push({ key: `${ri}-${ci}`, type: displayType, isGhost })
      }
    }
    return cells
  }, [board, current, ghostRow])

  const nextCells = useMemo(() => {
    const cells: Array<{ key: string; filled: boolean }> = []
    if (next) {
      for (let ri = 0; ri < next.shape.length; ri++) {
        const row = next.shape[ri]
        if (!row) continue
        for (let ci = 0; ci < row.length; ci++) {
          cells.push({ key: `${ri}-${ci}`, filled: row[ci] === 1 })
        }
      }
    }
    return cells
  }, [next])

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-4 py-10 font-mono"
      aria-label="Tetris game"
    >
      <h1 className="font-bold text-2xl text-cyan-400 tracking-[0.3em] drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
        ▓ TETRIS ▓
      </h1>

      <div className="flex items-start gap-6">
        {/* Board */}
        <section
          aria-label="Tetris game board"
          className="border-2 border-green-700"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1.5rem)` }}
        >
          {boardCells.map(({ key, type, isGhost }) => (
            <div
              key={key}
              className={twMerge(
                'h-6 w-6 border border-green-950',
                !type && 'bg-black',
                type && !isGhost && TETROMINO_COLORS[type],
                isGhost && type && `${TETROMINO_COLORS[type]} opacity-25`
              )}
            />
          ))}
        </section>

        {/* Sidebar */}
        <div className="flex w-32 flex-col gap-5">
          {/* Next piece */}
          <div>
            <p className="mb-1 text-green-600 text-xs uppercase tracking-widest">NEXT</p>
            <div
              className="flex h-16 w-16 items-center justify-center border border-green-800 bg-black"
              aria-label={next ? `Next piece: ${next.type}` : 'No next piece'}
            >
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
                      className={`h-4 w-4 ${filled ? TETROMINO_COLORS[next.type] : 'bg-black'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 text-sm" aria-live="polite" aria-atomic="false">
            <div>
              <p className="text-green-700 text-xs uppercase tracking-widest">SCORE</p>
              <p className="font-bold text-green-300" data-testid="score">
                {score}
              </p>
            </div>
            <div>
              <p className="text-green-700 text-xs uppercase tracking-widest">LEVEL</p>
              <p className="font-bold text-green-300" data-testid="level">
                {level}
              </p>
            </div>
            <div>
              <p className="text-green-700 text-xs uppercase tracking-widest">LINES</p>
              <p className="font-bold text-green-300" data-testid="lines">
                {lines}
              </p>
            </div>
          </div>

          {/* Controls hint */}
          <div className="space-y-1 text-green-900 text-xs" aria-label="Keyboard controls">
            <p>←/A MOVE</p>
            <p>→/D MOVE</p>
            <p>↑/W ROTATE</p>
            <p>↓/S SOFT DROP</p>
            <p>SPC HARD DROP</p>
            <p>P PAUSE</p>
          </div>
        </div>
      </div>

      {/* Overlay messages */}
      {status === 'idle' && (
        <output className="animate-pulse text-green-500 text-sm">
          PRESS{' '}
          <kbd className="border border-green-700 bg-green-950 px-1 text-green-300 not-italic">
            ENTER
          </kbd>{' '}
          OR{' '}
          <kbd className="border border-green-700 bg-green-950 px-1 text-green-300 not-italic">
            SPACE
          </kbd>{' '}
          TO START
        </output>
      )}
      {status === 'paused' && (
        <output className="text-sm text-yellow-400" aria-live="polite">
          {'*** '}PAUSED — PRESS{' '}
          <kbd className="border border-yellow-700 bg-yellow-950 px-1 text-yellow-300 not-italic">
            P
          </kbd>{' '}
          TO RESUME{' ***'}
        </output>
      )}
      {status === 'over' && (
        <p className="text-red-500 text-sm" role="alert" aria-live="assertive">
          {'*** '}GAME OVER — PRESS{' '}
          <kbd className="border border-red-700 bg-red-950 px-1 text-red-300 not-italic">ENTER</kbd>{' '}
          TO RESTART{' ***'}
        </p>
      )}

      <Link
        to="/"
        className="text-green-900 text-xs underline-offset-2 hover:text-green-600 hover:underline"
      >
        &lt; BACK HOME
      </Link>
    </div>
  )
}
