import type { AlgorithmDef, AlgorithmInput, Step, GridHighlight } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { emptyGrid } from '../../core/presets';
import { asGridInput, makeGridStep, key, neighbors4, revealGridPath, noPathStep } from './helpers';

const pseudocode = [
  { text: 'procedure BFS(Grid, S, E)', indent: 0 },
  { text: 'queue = [S]; seen = {S}; parent = {}', indent: 1 },
  { text: 'while queue is not empty', indent: 1, isLoopHeader: true, loopLabel: 'bfs' },
  { text: 'u = dequeue(queue)', indent: 2 },
  { text: 'if u == E', indent: 2 },
  { text: 'return path from parent', indent: 3 },
  { text: 'for each walkable neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'if v not in seen', indent: 3 },
  { text: 'seen âˆª= {v}; parent[v] = u; enqueue(queue, v)', indent: 4 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* gridBfs(input: AlgorithmInput): Generator<Step> {
  const g = asGridInput(input);
  const startKey = key(g.start[0], g.start[1]);
  const endKey = key(g.end[0], g.end[1]);

  const queue: string[] = [startKey];
  const seen = new Set([startKey]);
  const parent = new Map<string, string>();

  yield makeGridStep([{ row: g.start[0], col: g.start[1], kind: 'frontier' }], 1,
    `Initialize: queue = [S], seen = {S}. BFS ignores terrain weights — use Dijkstra/A* for cheapest paths`,
    { queueSize: 1 });

  let iter = 0;
  while (queue.length > 0) {
    iter++;
    const u = queue.shift()!;
    const [ur, uc] = u.split(',').map(Number);

    if (u === endKey) {
      yield makeGridStep(
        [...visitedHi(seen, queue, u), { row: ur, col: uc, kind: 'current' }],
        5,
        `Dequeued ${u} â€” reached the goal! Reconstruct path`,
        { u },
        [{ label: 'bfs', iteration: iter }]
      );
      yield* revealGridPath(parent, startKey, endKey, 5, `${pathSteps(parent, startKey, endKey)} steps`);
      return;
    }

    yield makeGridStep(
      [...visitedHi(seen, queue, u), ...queueHi(queue), { row: ur, col: uc, kind: 'current' }],
      4,
      `Dequeue ${u} (FIFO). Walkable neighbors: ${neighbors4(g, ur, uc, g.end).length}`,
      { u, queueSize: queue.length },
      [{ label: 'bfs', iteration: iter }]
    );

    for (const [nr, nc] of neighbors4(g, ur, uc, g.end)) {
      const v = key(nr, nc);
      if (!seen.has(v)) {
        seen.add(v);
        parent.set(v, u);
        queue.push(v);
        yield makeGridStep(
          [
            ...visitedHi(seen, queue, u),
            ...queue.filter((k) => k !== v).map((k) => rcHi(k, 'frontier')),
            { row: nr, col: nc, kind: 'frontier' },
            { row: ur, col: uc, kind: 'current' },
          ],
          9,
          `${v} unseen â†’ mark seen, parent[${v}] = ${u}, enqueue`,
          { u, v, queueSize: queue.length },
          [{ label: 'bfs', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      }
    }
  }

  yield noPathStep(endKey, 9);
}

export function visitedHi(seen: Set<string>, queue: string[], exclude?: string): GridHighlight[] {
  return [...seen]
    .filter((k) => k !== exclude && !queue.includes(k))
    .map((k) => rcHi(k, 'visited'));
}

function queueHi(queue: string[]): GridHighlight[] {
  return queue.map((k) => rcHi(k, 'frontier'));
}

export function rcHi(k: string, kind: GridHighlight['kind']): GridHighlight {
  const [r, c] = k.split(',').map(Number);
  return { row: r, col: c, kind };
}

function pathSteps(parent: Map<string, string>, startKey: string, endKey: string): number {
  let steps = 0;
  let cur = endKey;
  while (cur !== startKey) {
    cur = parent.get(cur)!;
    steps++;
    if (steps > 5000) break;
  }
  return steps;
}

const gridBfsDef: AlgorithmDef = {
  id: 'grid-bfs',
  name: 'BFS Pathfinding',
  category: 'grid',
  description: 'Flood-fills the grid outward from the start using a FIFO queue. Guarantees the fewest-cell path (weights ignored).',
  pseudocode,
  complexity: { time: 'O(RÃ—C)', space: 'O(RÃ—C)' },
  defaultInput: { grid: emptyGrid() },
  run: gridBfs,
};

registerAlgorithm(gridBfsDef);
