import type { GraphEdgeBase, GraphInputData, GraphNodeBase, GridInputData } from './types';

/* ------------------------------- Sample graph ------------------------------ */

export const SAMPLE_GRAPH: GraphInputData = {
  nodes: [
    { id: 'A', x: 12, y: 22 },
    { id: 'B', x: 34, y: 10 },
    { id: 'C', x: 58, y: 14 },
    { id: 'D', x: 84, y: 28 },
    { id: 'E', x: 24, y: 50 },
    { id: 'F', x: 50, y: 46 },
    { id: 'G', x: 76, y: 56 },
    { id: 'H', x: 38, y: 80 },
    { id: 'I', x: 66, y: 84 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'C', to: 'D', weight: 5 },
    { from: 'A', to: 'E', weight: 6 },
    { from: 'B', to: 'F', weight: 5 },
    { from: 'C', to: 'F', weight: 4 },
    { from: 'D', to: 'G', weight: 7 },
    { from: 'E', to: 'F', weight: 2 },
    { from: 'F', to: 'G', weight: 3 },
    { from: 'E', to: 'H', weight: 5 },
    { from: 'G', to: 'I', weight: 4 },
    { from: 'H', to: 'I', weight: 3 },
    { from: 'F', to: 'H', weight: 6 },
  ],
  directed: false,
  weighted: true,
  startId: 'A',
  endId: 'I',
};

/** Spreadsheet-style letter id: 0→A, 1→B … 25→Z, 26→AA … */
export function nodeIdAt(index: number): string {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

/** Inverse of nodeIdAt: A→0, Z→25, AA→26 … Non-letter ids yield -1. */
export function nodeIdIndex(id: string): number {
  if (!/^[A-Za-z]+$/.test(id)) return -1;
  let idx = 0;
  for (const ch of id.toUpperCase()) {
    idx = idx * 26 + (ch.charCodeAt(0) - 64);
  }
  return idx - 1;
}

/**
 * Collision-free id for a new interactive node, continuing the alphabetical
 * standard: one past the highest existing letter id (A..Z, AA..).
 */
export function nextNodeId(existingIds: string[]): string {
  const taken = new Set(existingIds.map((id) => id.toUpperCase()));
  let maxIdx = -1;
  for (const id of taken) {
    maxIdx = Math.max(maxIdx, nodeIdIndex(id));
  }
  let idx = maxIdx + 1;
  let candidate = nodeIdAt(idx);
  while (taken.has(candidate)) {
    candidate = nodeIdAt(++idx);
  }
  return candidate;
}

/** Random connected undirected graph: scattered points + spanning tree + extra links.
 *  Node ids follow the alphabetical standard (A, B, C …), fresh per generation. */
export function randomGraph(nodeCount = 9, extraEdgeRatio = 0.35): GraphInputData {
  const nodes: GraphNodeBase[] = [];
  const minDist = 18;
  let guard = 0;
  while (nodes.length < nodeCount && guard++ < 800) {
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    if (nodes.every((n) => Math.hypot(n.x - x, n.y - y) >= minDist)) {
      nodes.push({ id: nodeIdAt(nodes.length), x, y });
    }
  }
  if (nodes.length < 2) return structuredClone(SAMPLE_GRAPH);

  // Spanning tree via random Prim
  const inTree = new Set([nodes[0].id]);
  const rest = nodes.slice(1).map((n) => n.id);
  const edges: GraphEdgeBase[] = [];
  while (rest.length > 0) {
    // Pick a random tree node and connect to its nearest outsider.
    const treeIds = [...inTree];
    const fromId = treeIds[Math.floor(Math.random() * treeIds.length)];
    const from = nodes.find((n) => n.id === fromId)!;
    rest.sort(
      (a, b) =>
        dist(from, nodes.find((n) => n.id === a)!) -
        dist(from, nodes.find((n) => n.id === b)!)
    );
    const toId = rest.shift()!;
    edges.push({ from: fromId, to: toId, weight: randWeight() });
    inTree.add(toId);
  }

  // A few extra non-crossing-ish shortcuts
  const targetExtra = Math.floor(edges.length * extraEdgeRatio);
  let added = 0;
  guard = 0;
  while (added < targetExtra && guard++ < 200) {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    if (a.id === b.id) continue;
    if (edges.some((e) => (e.from === a.id && e.to === b.id) || (e.from === b.id && e.to === a.id))) continue;
    edges.push({ from: a.id, to: b.id, weight: randWeight() });
    added++;
  }

  return {
    nodes,
    edges,
    directed: false,
    weighted: true,
    startId: nodes[0].id,
    endId: nodes[nodes.length - 1].id,
  };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const WEIGHTS = [1, 2, 4, 6, 8];
function randWeight(): number {
  return WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)];
}

/* --------------------------------- Grids ---------------------------------- */

export function emptyGrid(rows = 12, cols = 20): GridInputData {
  return {
    rows,
    cols,
    walls: [],
    weights: {},
    start: [Math.floor(rows / 2), 2],
    end: [Math.floor(rows / 2), cols - 3],
  };
}

/** Deterministic PRNG so a seeded board is identical on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A monotone staircase from start to end. Reserving it before scattering walls
 * guarantees the goal stays reachable no matter how the dice fall.
 */
function carveRoute(
  rand: () => number,
  start: [number, number],
  end: [number, number]
): Set<string> {
  const reserved = new Set<string>([`${start[0]},${start[1]}`]);
  let [r, c] = start;
  let guard = 0;
  while ((r !== end[0] || c !== end[1]) && guard++ < 500) {
    const rowLeft = r !== end[0];
    const colLeft = c !== end[1];
    if (rowLeft && (!colLeft || rand() < 0.5)) r += Math.sign(end[0] - r);
    else c += Math.sign(end[1] - c);
    reserved.add(`${r},${c}`);
  }
  return reserved;
}

const TERRAIN_COSTS = [2, 3, 4, 6];

function buildWalls(
  rand: () => number,
  rows: number,
  cols: number,
  density: number,
  start: [number, number],
  end: [number, number]
): string[] {
  const reserved = carveRoute(rand, start, end);
  // Keep the cells touching each endpoint clear so neither is boxed in.
  reserved.add(`${start[0]},${start[1] + 1}`);
  reserved.add(`${start[0] + 1},${start[1]}`);
  reserved.add(`${end[0]},${end[1] - 1}`);
  reserved.add(`${end[0] - 1},${end[1]}`);

  const walls: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = `${r},${c}`;
      if (reserved.has(k)) continue;
      if (rand() < density) walls.push(k);
    }
  }
  return walls;
}

export function randomWalls(rows = 12, cols = 20, density = 0.28): GridInputData {
  const base = emptyGrid(rows, cols);
  return { ...base, walls: buildWalls(Math.random, rows, cols, density, base.start, base.end) };
}

/** Same generator, but reproducible for a given seed. */
export function seededRandomWalls(
  rows = 12,
  cols = 20,
  density = 0.28,
  seed = 20260925
): GridInputData {
  const base = emptyGrid(rows, cols);
  return {
    ...base,
    walls: buildWalls(mulberry32(seed), rows, cols, density, base.start, base.end),
  };
}

const SEED_BOARD = seededRandomWalls(12, 20, 0.26, 20260925);

// A light scattering of terrain cost, so Dijkstra/A* have something to optimise
// against and BFS's "ignores terrain weights" note actually refers to something.
for (const [r, c] of [
  [2, 5], [2, 9], [4, 14], [6, 6], [7, 11], [9, 4], [9, 16], [3, 17], [8, 8],
]) {
  if (r < SEED_BOARD.rows && c < SEED_BOARD.cols) {
    const k = `${r},${c}`;
    if (!SEED_BOARD.walls.includes(k)) {
      SEED_BOARD.weights[k] = TERRAIN_COSTS[(r * 7 + c * 3) % TERRAIN_COSTS.length];
    }
  }
}

/**
 * Opening board shared by every pathfinding lesson, so BFS, DFS, Dijkstra and
 * A* can be compared on identical terrain. A fresh copy each call keeps the
 * shared source immutable.
 */
export function defaultPathfindingGrid(): GridInputData {
  return {
    ...SEED_BOARD,
    walls: [...SEED_BOARD.walls],
    weights: { ...SEED_BOARD.weights },
  };
}

/** Resize a grid to custom dimensions, preserving everything that still fits.
 *  Walls/weights outside the new bounds are dropped; endpoints are clamped inside
 *  and never left on a wall or coinciding with each other. */
export function resizeGrid(g: GridInputData, rows: number, cols: number): GridInputData {
  const R = Math.max(5, Math.min(30, Math.round(rows) || g.rows));
  const C = Math.max(8, Math.min(50, Math.round(cols) || g.cols));

  const fits = (k: string) => {
    const [r, c] = k.split(',').map(Number);
    return r >= 0 && c >= 0 && r < R && c < C;
  };

  const walls = g.walls.filter(fits);
  const weights: Record<string, number> = {};
  for (const [k, v] of Object.entries(g.weights)) {
    if (fits(k)) weights[k] = v;
  }

  let start: [number, number] = [Math.min(g.start[0], R - 1), Math.min(g.start[1], C - 1)];
  let end: [number, number] = [Math.min(g.end[0], R - 1), Math.min(g.end[1], C - 1)];

  // Endpoints must not sit on a wall (drop the wall instead)
  const wallSet = new Set(walls);
  wallSet.delete(start.join(','));
  wallSet.delete(end.join(','));

  // Endpoints must not coincide — nudge end one cell toward available space
  if (start[0] === end[0] && start[1] === end[1]) {
    const nc = Math.min(C - 1, end[1] + 1);
    end = [end[0], nc];
    wallSet.delete(end.join(','));
  }

  return { rows: R, cols: C, walls: [...wallSet], weights, start, end };
}