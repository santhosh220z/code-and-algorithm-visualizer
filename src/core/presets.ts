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

let nodeCounter = 0;
export function nextNodeId(): string {
  return `n${++nodeCounter}`;
}

/** Random connected undirected graph: scattered points + spanning tree + extra links. */
export function randomGraph(nodeCount = 9, extraEdgeRatio = 0.35): GraphInputData {
  const nodes: GraphNodeBase[] = [];
  const minDist = 18;
  let guard = 0;
  while (nodes.length < nodeCount && guard++ < 800) {
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    if (nodes.every((n) => Math.hypot(n.x - x, n.y - y) >= minDist)) {
      nodes.push({ id: nextNodeId(), x, y });
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

export function randomWalls(rows = 12, cols = 20, density = 0.28): GridInputData {
  const base = emptyGrid(rows, cols);
  const walls: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isEndpoint =
        (r === base.start[0] && c === base.start[1]) || (r === base.end[0] && c === base.end[1]);
      if (!isEndpoint && Math.random() < density) walls.push(`${r},${c}`);
    }
  }
  // Guarantee endpoints aren't walled in by their immediate ring
  for (const [r, c] of [
    [base.start[0], base.start[1] + 1],
    [base.start[0] + 1, base.start[1]],
    [base.end[0], base.end[1] - 1],
    [base.end[0] - 1, base.end[1]],
  ]) {
    const idx = walls.indexOf(`${r},${c}`);
    if (idx !== -1) walls.splice(idx, 1);
  }
  return { ...base, walls };
}