// === Utility Functions & A* Pathfinding ===

/**
 * A* Pathfinding Algorithm
 * Returns array of {x, y} from start to end, or empty array if no path
 */
function findPath(grid, startX, startY, endX, endY, rows, cols) {
  if (startX === endX && startY === endY) return [];
  if (!isWalkable(grid, endX, endY, cols, rows)) return [];

  const openSet = [];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const key = (x, y) => `${x},${y}`;
  const startKey = key(startX, startY);
  
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(startX, startY, endX, endY));
  openSet.push({ x: startX, y: startY, f: fScore.get(startKey) });

  while (openSet.length > 0) {
    // Get node with lowest fScore
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const currentKey = key(current.x, current.y);

    if (current.x === endX && current.y === endY) {
      // Reconstruct path
      const path = [];
      let k = currentKey;
      while (cameFrom.has(k)) {
        const [px, py] = k.split(',').map(Number);
        path.unshift({ x: px, y: py });
        k = cameFrom.get(k);
      }
      return path;
    }

    closedSet.add(currentKey);

    // Check 4 neighbors
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
    ];

    for (const n of neighbors) {
      const nKey = key(n.x, n.y);
      if (closedSet.has(nKey)) continue;
      if (!isWalkable(grid, n.x, n.y, cols, rows)) continue;

      const tentG = (gScore.get(currentKey) || 0) + 1;
      const prevG = gScore.get(nKey);

      if (prevG === undefined || tentG < prevG) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentG);
        const f = tentG + heuristic(n.x, n.y, endX, endY);
        fScore.set(nKey, f);

        if (!openSet.find(o => o.x === n.x && o.y === n.y)) {
          openSet.push({ x: n.x, y: n.y, f });
        }
      }
    }
  }

  return []; // No path found
}

function heuristic(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function isWalkable(grid, x, y, cols, rows) {
  if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
  const tile = grid[y][x];
  return tile !== CONFIG.TILE.WALL;
}

/**
 * Manhattan distance between two grid positions
 */
function gridDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Linear interpolation
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp value between min and max
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
