import { useEffect, useMemo, useRef, useState } from "react";

const CELL = 36;
const PLAYER_SPEED = 140;
const PLAYER_RADIUS = 10;
const ENEMY_RADIUS = 12;
const COIN_RADIUS = 12;
const MAZE_LAYOUT = [
  "#########################",
  "#S#........C#......X.C..#",
  "#.#.#######.#####.#####.#",
  "#X....#C..#X......#...#C#",
  "#.###.#.#.#####.###.###.#",
  "#...#.#....C...C#.#.....#",
  "###.#.#.###.###.#.#.###.#",
  "#C#...#...#...X...#.....#",
  "#.#####.#.###.###.#####.#",
  "#.#.....#.....#.........#",
  "#.#.#.#.#####.###.#.#.#.#",
  "#...#..................G#",
  "#########################",
];

const MAZE_COLUMNS = MAZE_LAYOUT[0].length;
const MAZE_ROWS = MAZE_LAYOUT.length;
const CANVAS_WIDTH = MAZE_COLUMNS * CELL;
const CANVAS_HEIGHT = MAZE_ROWS * CELL;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildMazeState() {
  let start = { row: 1, col: 1 };
  let goal = { row: 1, col: 1 };
  const grid = MAZE_LAYOUT.map((row, rowIndex) =>
    row.split("").map((cell, colIndex) => {
      if (cell === "S") {
        start = { row: rowIndex, col: colIndex };
        return ".";
      }
      if (cell === "G") {
        goal = { row: rowIndex, col: colIndex };
        return "G";
      }
      return cell;
    })
  );

  const coins = [];
  MAZE_LAYOUT.forEach((row, rowIndex) => {
    row.split("").forEach((cell, colIndex) => {
      if (cell === "C") {
        coins.push({
          x: colIndex * CELL + CELL * 0.5,
          y: rowIndex * CELL + CELL * 0.5,
          collected: false,
        });
      }
    });
  });

  const enemies = [
    {
      id: "specter",
      path: [
        { row: 3, col: 1 },
        { row: 3, col: 5 },
        { row: 5, col: 5 },
        { row: 5, col: 1 },
      ],
      speed: 70,
      targetIndex: 1,
      direction: 1,
    },
    {
      id: "warden",
      path: [
        { row: 7, col: 13 },
        { row: 7, col: 17 },
        { row: 11, col: 17 },
        { row: 11, col: 13 },
      ],
      speed: 65,
      targetIndex: 1,
      direction: 1,
    },
  ];

  enemies.forEach((enemy) => {
    enemy.x = enemy.path[0].col * CELL + CELL * 0.5;
    enemy.y = enemy.path[0].row * CELL + CELL * 0.5;
  });

  return { grid, start, goal, coins, enemies };
}

function getCellCenter(cell) {
  return {
    x: cell.col * CELL + CELL * 0.5,
    y: cell.row * CELL + CELL * 0.5,
  };
}

function getGridCell(grid, x, y) {
  const col = clamp(Math.floor(x / CELL), 0, MAZE_COLUMNS - 1);
  const row = clamp(Math.floor(y / CELL), 0, MAZE_ROWS - 1);
  return { row, col, value: grid[row][col] };
}

function isBlocked(grid, x, y) {
  const samples = [
    { dx: 0, dy: 0 },
    { dx: PLAYER_RADIUS * 0.7, dy: 0 },
    { dx: -PLAYER_RADIUS * 0.7, dy: 0 },
    { dx: 0, dy: PLAYER_RADIUS * 0.7 },
    { dx: 0, dy: -PLAYER_RADIUS * 0.7 },
  ];

  return samples.some((sample) => {
    const next = getGridCell(grid, x + sample.dx, y + sample.dy);
    return next.value === "#";
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default function Level2Game({ onComplete, onQuit, onFail }) {
  const mazeState = useMemo(() => buildMazeState(), []);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const gameStateRef = useRef(null);

  if (gameStateRef.current === null) {
    gameStateRef.current = {
      grid: mazeState.grid,
      start: mazeState.start,
      goal: mazeState.goal,
      coins: mazeState.coins,
      enemies: mazeState.enemies,
      player: {
        x: mazeState.start.col * CELL + CELL * 0.5,
        y: mazeState.start.row * CELL + CELL * 0.5,
        radius: PLAYER_RADIUS,
        speed: PLAYER_SPEED,
      },
      pressed: { up: false, down: false, left: false, right: false },
      coinCount: 0,
      lifelines: 3,
      lastDamage: 0,
      completed: false,
      gameOver: false,
    };
  }

  const [coinCount, setCoinCount] = useState(0);
  const [lifelines, setLifelines] = useState(3);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { pressed } = gameStateRef.current;
      if (event.key === "ArrowUp") pressed.up = true;
      if (event.key === "ArrowDown") pressed.down = true;
      if (event.key === "ArrowLeft") pressed.left = true;
      if (event.key === "ArrowRight") pressed.right = true;
    };

    const handleKeyUp = (event) => {
      const { pressed } = gameStateRef.current;
      if (event.key === "ArrowUp") pressed.up = false;
      if (event.key === "ArrowDown") pressed.down = false;
      if (event.key === "ArrowLeft") pressed.left = false;
      if (event.key === "ArrowRight") pressed.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return undefined;

    const context = new AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = 0.05;
    masterGain.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = 90;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = 1.5;

    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain).connect(oscillator.frequency);

    oscillator.connect(filter).connect(masterGain);
    oscillator.start();
    lfo.start();

    const startAmbient = () => {
      if (audioRef.current?.started) return;
      context.resume().then(() => {
        audioRef.current = { started: true };
      });
    };

    window.addEventListener("keydown", startAmbient, { once: true });
    window.addEventListener("mousedown", startAmbient, { once: true });

    return () => {
      oscillator.stop();
      lfo.stop();
      masterGain.disconnect();
      filter.disconnect();
      lfoGain.disconnect();
      context.close();
      window.removeEventListener("keydown", startAmbient);
      window.removeEventListener("mousedown", startAmbient);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let lastFrame = performance.now();
    let mounted = true;

    const updateEnemies = (dt) => {
      const { enemies } = gameStateRef.current;
      enemies.forEach((enemy) => {
        const targetCell = enemy.path[enemy.targetIndex];
        const target = {
          x: targetCell.col * CELL + CELL * 0.5,
          y: targetCell.row * CELL + CELL * 0.5,
        };
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const distanceToTarget = Math.hypot(dx, dy);

        if (distanceToTarget < 1) {
          if (enemy.direction === 1) {
            if (enemy.targetIndex === enemy.path.length - 1) {
              enemy.direction = -1;
              enemy.targetIndex -= 1;
            } else {
              enemy.targetIndex += 1;
            }
          } else {
            if (enemy.targetIndex === 0) {
              enemy.direction = 1;
              enemy.targetIndex += 1;
            } else {
              enemy.targetIndex -= 1;
            }
          }
          return;
        }

        const travel = Math.min(enemy.speed * dt, distanceToTarget);
        enemy.x += (dx / distanceToTarget) * travel;
        enemy.y += (dy / distanceToTarget) * travel;
      });
    };

    const updateGame = (dt) => {
      const state = gameStateRef.current;
      if (state.gameOver || state.completed) return;

      const moveX = (state.pressed.right ? 1 : 0) - (state.pressed.left ? 1 : 0);
      const moveY = (state.pressed.down ? 1 : 0) - (state.pressed.up ? 1 : 0);
      const length = Math.hypot(moveX, moveY);
      const player = state.player;
      let dx = 0;
      let dy = 0;

      if (length > 0) {
        dx = (moveX / length) * player.speed * dt;
        dy = (moveY / length) * player.speed * dt;
      }

      const nextX = { x: player.x + dx, y: player.y };
      const nextY = { x: player.x, y: player.y + dy };

      if (!isBlocked(state.grid, nextX.x, nextX.y)) {
        player.x = nextX.x;
      }
      if (!isBlocked(state.grid, nextY.x, nextY.y)) {
        player.y = nextY.y;
      }

      let collectedThisFrame = false;
      state.coins.forEach((coin) => {
        if (!coin.collected && distance(player, coin) < PLAYER_RADIUS + COIN_RADIUS * 0.8) {
          coin.collected = true;
          collectedThisFrame = true;
        }
      });

      if (collectedThisFrame) {
        state.coinCount += 1;
        setCoinCount(state.coinCount);
      }

      const now = performance.now();
      state.enemies.forEach((enemy) => {
        if (distance(player, enemy) < PLAYER_RADIUS + ENEMY_RADIUS * 0.9) {
          if (now - state.lastDamage > 700) {
            state.lastDamage = now;
            const nextLifelines = Math.max(0, state.lifelines - 1);
            state.lifelines = nextLifelines;
            setLifelines(nextLifelines);

            if (nextLifelines <= 0) {
              state.gameOver = true;
              onFail?.();
            } else {
              player.x = state.start.col * CELL + CELL * 0.5;
              player.y = state.start.row * CELL + CELL * 0.5;
            }
          }
        }
      });

      updateEnemies(dt);

      const goalPoint = getCellCenter(state.goal);
      if (distance(player, goalPoint) < PLAYER_RADIUS + 16 && !state.completed) {
        state.completed = true;
        onComplete?.(state.coinCount);
      }
    };

    const drawScene = () => {
      const state = gameStateRef.current;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.fillStyle = "#05060d";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const baseGradient = ctx.createRadialGradient(
        CANVAS_WIDTH * 0.4,
        CANVAS_HEIGHT * 0.2,
        0,
        CANVAS_WIDTH * 0.4,
        CANVAS_HEIGHT * 0.2,
        CANVAS_WIDTH * 0.7
      );
      baseGradient.addColorStop(0, "rgba(80, 16, 16, 0.18)");
      baseGradient.addColorStop(1, "rgba(0, 0, 0, 0.95)");
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(12, 16, 24, 0.84)";
      ctx.shadowBlur = 0;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(255, 54, 54, 0.96)";
      ctx.shadowColor = "rgba(255, 54, 54, 0.55)";
      ctx.shadowBlur = 22;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";

      state.grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== "#") {
            const x = colIndex * CELL + 8;
            const y = rowIndex * CELL + 8;
            drawRoundedRect(ctx, x, y, CELL - 16, CELL - 16, 16);
            ctx.stroke();
          }
        });
      });
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(48, 78, 132, 0.9)";
      ctx.shadowColor = "rgba(255, 54, 54, 0.18)";
      ctx.shadowBlur = 18;
      state.grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== "#") {
            const x = colIndex * CELL + 10;
            const y = rowIndex * CELL + 10;
            drawRoundedRect(ctx, x, y, CELL - 20, CELL - 20, 14);
            ctx.fill();
          }
        });
      });
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(255, 80, 80, 0.88)";
      ctx.shadowColor = "rgba(255, 80, 80, 0.45)";
      ctx.shadowBlur = 20;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      state.grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== "#") {
            const left = state.grid[rowIndex][colIndex - 1] === "#";
            const right = state.grid[rowIndex][colIndex + 1] === "#";
            const up = state.grid[rowIndex - 1]?.[colIndex] === "#";
            const down = state.grid[rowIndex + 1]?.[colIndex] === "#";
            const cx = colIndex * CELL + CELL * 0.5;
            const cy = rowIndex * CELL + CELL * 0.5;
            if (up) {
              ctx.beginPath();
              ctx.moveTo(cx - CELL * 0.32, cy - CELL * 0.5 + 6);
              ctx.lineTo(cx + CELL * 0.32, cy - CELL * 0.5 + 6);
              ctx.stroke();
            }
            if (down) {
              ctx.beginPath();
              ctx.moveTo(cx - CELL * 0.32, cy + CELL * 0.5 - 6);
              ctx.lineTo(cx + CELL * 0.32, cy + CELL * 0.5 - 6);
              ctx.stroke();
            }
            if (left) {
              ctx.beginPath();
              ctx.moveTo(cx - CELL * 0.5 + 6, cy - CELL * 0.32);
              ctx.lineTo(cx - CELL * 0.5 + 6, cy + CELL * 0.32);
              ctx.stroke();
            }
            if (right) {
              ctx.beginPath();
              ctx.moveTo(cx + CELL * 0.5 - 6, cy - CELL * 0.32);
              ctx.lineTo(cx + CELL * 0.5 - 6, cy + CELL * 0.32);
              ctx.stroke();
            }
          }
        });
      });
      ctx.restore();

      state.coins.forEach((coin) => {
        if (coin.collected) return;
        const glow = ctx.createRadialGradient(coin.x, coin.y, 0, coin.x, coin.y, COIN_RADIUS * 2);
        glow.addColorStop(0, "rgba(255, 236, 127, 0.95)");
        glow.addColorStop(0.5, "rgba(255, 236, 127, 0.2)");
        glow.addColorStop(1, "rgba(255, 236, 127, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, COIN_RADIUS * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.shadowColor = "rgba(255, 236, 127, 0.85)";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#ffe169";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, COIN_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const goalPoint = getCellCenter(state.goal);
      ctx.save();
      ctx.shadowColor = "rgba(255, 210, 130, 0.8)";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "#f7c95f";
      ctx.fillRect(goalPoint.x - 16, goalPoint.y - 12, 32, 24);
      ctx.fillStyle = "#d08a19";
      ctx.fillRect(goalPoint.x - 14, goalPoint.y - 6, 28, 10);
      ctx.restore();

      state.enemies.forEach((enemy) => {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.shadowColor = "rgba(210, 120, 255, 0.6)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, ENEMY_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "rgba(28, 18, 48, 0.98)";
        ctx.beginPath();
        ctx.moveTo(enemy.x - 8, enemy.y + 2);
        ctx.lineTo(enemy.x - 8, enemy.y - 4);
        ctx.quadraticCurveTo(enemy.x - 8, enemy.y - 10, enemy.x, enemy.y - 10);
        ctx.quadraticCurveTo(enemy.x + 8, enemy.y - 10, enemy.x + 8, enemy.y - 4);
        ctx.lineTo(enemy.x + 8, enemy.y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(enemy.x - 4, enemy.y - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(enemy.x + 4, enemy.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const player = state.player;
      ctx.save();
      ctx.shadowColor = "rgba(255, 220, 150, 0.8)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#fff3c2";
      ctx.beginPath();
      ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(255, 198, 98, 0.18)";
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x + 22, player.y + 8);
      ctx.lineTo(player.x + 12, player.y + 24);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const renderFrame = (time) => {
      if (!mounted) return;
      const dt = Math.min((time - lastFrame) / 1000, 0.032);
      lastFrame = time;
      updateGame(dt);
      drawScene();
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
    return () => {
      mounted = false;
    };
  }, [mazeState, onComplete, onFail]);

  const heartDisplay = lifelines > 0 ? Array.from({ length: lifelines }, () => "❤").join(" ") : "💀";

  return (
    <div className="l2-panel maze-screen">
      <div className="maze-wrapper">
        <div className="maze-canvas-container">
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="maze-canvas" />
          <div className="maze-vignette" />
          <div className="maze-overlay">
            <span>LIFELINES: {heartDisplay}</span>
            <span>COINS: {coinCount}</span>
          </div>
        </div>
        <div className="maze-actions">
          <button
            type="button"
            className="l2-secondary-btn maze-quit"
            onClick={() => onQuit?.(gameStateRef.current?.coinCount ?? 0)}
          >
            Quit
          </button>
        </div>
        <p className="maze-instructions">
          Use arrow keys to dodge roaming phantoms and survive with 3 heart lifelines.
        </p>
      </div>
    </div>
  );
}
