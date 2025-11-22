import React, { useEffect, useState, useRef } from 'react'

const GRID_SIZE = 20

function randomFood(snake) {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`))
  while (true) {
    const x = Math.floor(Math.random() * GRID_SIZE)
    const y = Math.floor(Math.random() * GRID_SIZE)
    const key = `${x},${y}`
    if (!occupied.has(key)) return { x, y }
  }
}

export default function App() {
  const [snake, setSnake] = useState([
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 7, y: 9 }
  ])
  const [dir, setDir] = useState({ x: 1, y: 0 })
  const [food, setFood] = useState(() => randomFood(snake))
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(120) // ms per tick
  const scoreRef = useRef(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      const key = e.key
      if (key === 'ArrowUp' || key === 'w') setDir(d => (d.y === 1 ? d : { x: 0, y: -1 }))
      if (key === 'ArrowDown' || key === 's') setDir(d => (d.y === -1 ? d : { x: 0, y: 1 }))
      if (key === 'ArrowLeft' || key === 'a') setDir(d => (d.x === 1 ? d : { x: -1, y: 0 }))
      if (key === 'ArrowRight' || key === 'd') setDir(d => (d.x === -1 ? d : { x: 1, y: 0 }))
      if (key === ' ' ) setRunning(r => !r)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSnake(prev => {
        const head = prev[0]
        const rawX = head.x + dir.x
        const rawY = head.y + dir.y

        // wall collision: end game (no wrap-around)
        if (rawX < 0 || rawX >= GRID_SIZE || rawY < 0 || rawY >= GRID_SIZE) {
          setRunning(false)
          setGameOver(true)
          return prev
        }

        const newHead = { x: rawX, y: rawY }

        // collision with self
        const hit = prev.some(p => p.x === newHead.x && p.y === newHead.y)
        if (hit) {
          setRunning(false)
          setGameOver(true)
          return prev
        }

        let newSnake = [newHead, ...prev]
        // eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(randomFood(newSnake))
          scoreRef.current += 1
        } else {
          newSnake.pop()
        }
        return newSnake
      })
    }, speed)
    return () => clearInterval(id)
  }, [running, dir, speed, food])

  function restart() {
    setSnake([{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }])
    setDir({ x: 1, y: 0 })
    setFood(randomFood([{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }]))
    setRunning(false)
    setGameOver(false)
    scoreRef.current = 0
  }

  function cellType(x, y) {
    if (food.x === x && food.y === y) return 'food'
    if (snake.some((p, i) => p.x === x && p.y === y)) return 'snake'
    return ''
  }

  return (
    <div className="app">
      <h1>Snake</h1>
      <div className="controls">
        <button onClick={() => {
          if (gameOver) {
            // if game over, restart to reset starting position then start running
            restart()
            setRunning(true)
          } else {
            setRunning(r => !r)
          }
        }}>{running ? 'Pause' : 'Start'}</button>
        <button onClick={restart}>Restart</button>
        <label>Speed:</label>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
          <option value={200}>Slow</option>
          <option value={120}>Normal</option>
          <option value={70}>Fast</option>
        </select>
        <div className="score">Score: {scoreRef.current}</div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`, width: GRID_SIZE * 20 }}
      >
        {Array.from({ length: GRID_SIZE }).map((_, y) =>
          Array.from({ length: GRID_SIZE }).map((_, x) => {
            const type = cellType(x, y)
            return <div key={`${x}-${y}`} className={`cell ${type}`} />
          })
        )}
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over">
            <h2>Game Over</h2>
            <p>Score: {scoreRef.current}</p>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => { restart(); setRunning(true); }}>Play Again</button>
              <button onClick={() => { restart(); }}>Reset</button>
            </div>
          </div>
        </div>
      )}

      <p className="hint">Use arrow keys or WASD to move. Space to Start/Pause.</p>
    </div>
  )
}
