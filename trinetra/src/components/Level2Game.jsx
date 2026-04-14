import { useEffect, useState } from "react";

const MAZE_LAYOUT = [
  "#########################",
  "#S..#.C...#...C..X..G.#.",
  "#.#.#.#####.#.#.#.###.###",
  "#.#X#.....#.#.#...#X.#.#.",
  "#.#.###.#.#.#.#.#####.#.#",
  "#...#C#.#.#...#..X..#.#..",
  "###.#.#.#.#####.###.#.#.#",
  "#...#.#.#.....#...#.#C.#",
  "#.###.#.#######.#.#.###.#",
  "#..C..#.....C...#.#...#.#",
  "#.#####.#######.#.#####.#",
  "#C...X..#.....#.....C..#.",
  "#########################",
];

function buildMazeState() {
  let startPosition = { row: 1, col: 1 };
  const grid = MAZE_LAYOUT.map((row, rowIndex) =>
    row.split("").map((cell, colIndex) => {
      if (cell === "S") {
        startPosition = { row: rowIndex, col: colIndex };
        return ".";
      }
      return cell;
    })
  );
  return { grid, startPosition };
}

function isPathCell(grid, row, col) {
  const value = grid[row]?.[col];
  return value != null && value !== "#";
}

function getPathShape(grid, row, col) {
  const up = isPathCell(grid, row - 1, col);
  const down = isPathCell(grid, row + 1, col);
  const left = isPathCell(grid, row, col - 1);
  const right = isPathCell(grid, row, col + 1);

  if (up && down && left && right) return "cross";
  if (up && down && left) return "tee-left";
  if (up && down && right) return "tee-right";
  if (left && right && up) return "tee-up";
  if (left && right && down) return "tee-down";
  if (up && down) return "vertical";
  if (left && right) return "horizontal";
  if (up && right) return "corner-tr";
  if (up && left) return "corner-tl";
  if (down && right) return "corner-br";
  if (down && left) return "corner-bl";
  if (up || down) return "vertical";
  if (left || right) return "horizontal";
  return "dot";
}

export default function Level2Game({ onComplete, onQuit, onFail }) {
  const initialMaze = buildMazeState();
  const [mazeGrid, setMazeGrid] = useState(initialMaze.grid);
  const [playerPosition, setPlayerPosition] = useState(initialMaze.startPosition);
  const [mazeCoins, setMazeCoins] = useState(0);
  const [lifelines, setLifelines] = useState(3);
  const [score, setScore] = useState(750);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const moveMap = {
        ArrowUp: { row: -1, col: 0 },
        ArrowDown: { row: 1, col: 0 },
        ArrowLeft: { row: 0, col: -1 },
        ArrowRight: { row: 0, col: 1 },
      };

      const movement = moveMap[event.key];
      if (!movement) return;
      event.preventDefault();

      const nextRow = playerPosition.row + movement.row;
      const nextCol = playerPosition.col + movement.col;
      const target = mazeGrid[nextRow]?.[nextCol];
      if (!target || target === "#") return;

      const isCoin = target === "C";
      const isSkull = target === "X";
      const isGoal = target === "G";

      setPlayerPosition({ row: nextRow, col: nextCol });

      if (isCoin || isSkull) {
        setMazeGrid((grid) => {
          const newGrid = grid.map((row) => [...row]);
          newGrid[nextRow][nextCol] = ".";
          return newGrid;
        });
      }

      if (isCoin) {
        setMazeCoins((count) => count + 1);
        setScore((current) => current + 50);
      }

      if (isSkull) {
        setLifelines((current) => {
          const next = current - 1;
          if (next <= 0) {
            onFail?.();
          }
          return next;
        });
      }

      if (isGoal) {
        onComplete?.(mazeCoins);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPosition, mazeGrid, onComplete, onFail, mazeCoins]);

  const renderHearts = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <span key={index} className={`maze-heart ${index < lifelines ? "active" : "empty"}`}>
        {index < lifelines ? "❤️" : "🤍"}
      </span>
    ));
  };

  return (
    <div className="l2-panel maze-screen">
      <div className="maze-wrapper">
        <div className="maze-status">
          <div className="maze-heart-row">{renderHearts()}</div>
          <div>SCORE: {score}</div>
          <div>COINS: {mazeCoins}</div>
          <button type="button" className="l2-secondary-btn maze-quit" onClick={() => onQuit?.(mazeCoins)}>
            Quit
          </button>
        </div>
        <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${mazeGrid[0].length}, minmax(32px, 40px))` }}>
          {mazeGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isPlayer = playerPosition.row === rowIndex && playerPosition.col === colIndex;
              const pathShape = cell !== "#" ? getPathShape(mazeGrid, rowIndex, colIndex) : "";
              const cellType = isPlayer
                ? "player"
                : cell === "#"
                ? "wall"
                : cell === "G"
                ? `goal ${pathShape}`
                : cell === "C"
                ? `coin ${pathShape}`
                : cell === "X"
                ? `skull ${pathShape}`
                : `path ${pathShape}`;

              return (
                <div key={`${rowIndex}-${colIndex}`} className={`maze-cell ${cellType}`}>
                  {isPlayer ? (
                    <span className="maze-player">
                      <span className="maze-player-head" />
                      <span className="maze-player-body" />
                    </span>
                  ) : cell === "C" ? (
                    "●"
                  ) : cell === "X" ? (
                    "☠"
                  ) : cell === "G" ? (
                    "💰"
                  ) : (
                    ""
                  )}
                </div>
              );
            })
          )}
        </div>
        <p className="maze-instructions">Use arrow keys to navigate the neon maze to the goal.</p>
      </div>
    </div>
  );
}
