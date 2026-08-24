import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { emptyGrid } from '../../core/presets';
import { asGridInput, makeGridStep, key, neighbors4, costOf, revealGridPath, noPathStep } from './helpers';
import { rcHi } from './bfs';

const pseudocode = [
  { text: 'procedure Dijkstra(Grid, S, E)', indent: 0 },
  { text: 'dist[S] = 0; open = {S}', indent: 1 },
  { text: 'while open is not empty', indent: 1, isLoopHeader: true, loopLabel: 'dijkstra' },
  { text: 'u = open cell with min dist[u]', indent: 2 },
  { text: 'if u == E', indent: 2 },
  { text: 'return path from parent', indent: 3 },
  { text: 'open -= {u}', indent: 2 },
  { text: 'for each walkable neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'alt = dist[u] + cost(v)', indent: 3 },
  { text: 'if alt < dist[v]', indent: 3 },
  { text: 'dist[v] = alt; parent[v] = u; open âˆª= {v}', indent: 4 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* gridDijkstra(input: AlgorithmInput): Generator<Step> {
  const g = asGridInput(input);
  const startKey = key(g.start[0], g.start[1]);
  const endKey = key(g.end[0], g.end[1]);

  const dist = new Map<string, number>([[startKey, 0]]);
  const parent = new Map<string, string>();
  const closed = new Set<string>();
  const open = new Set([startKey]);
  let steps = 0;

  yield makeGridStep([{ row: g.start[0], col: g.start[1], kind: 'frontier', g: 0 }], 1,
    `Initialize: dist[S] = 0`, { goal: endKey });

  while (open.size > 0) {
    steps++;
    let u: string | null = null;
    let best = Infinity;
    for (const k of open) {
      const d = dist.get(k) ?? Infinity;
      if (d < best) {
        best = d;
        u = k;
      }
    }
    if (u === null) break;

    const [ur, uc] = u.split(',').map(Number);

    if (u === endKey) {
      yield makeGridStep(
        [...closedHi(closed), ...frontierHi(open, dist, u), { row: ur, col: uc, kind: 'current', g: best }],
        5,
        `${u} has min dist (${best}) and is the goal â€” done!`,
        { u, dist: best },
        [{ label: 'dijkstra', iteration: steps }]
      );
      yield* revealGridPath(parent, startKey, endKey, 5, `total cost ${best}`);
      return;
    }

    yield makeGridStep(
      [...closedHi(closed), ...frontierHi(open, dist, u), { row: ur, col: uc, kind: 'current', g: best }],
      4,
      `Pick open cell ${u} with min dist = ${best}`,
      { u, dist: best },
      [{ label: 'dijkstra', iteration: steps }]
    );

    open.delete(u);
    closed.add(u);

    for (const [nr, nc] of neighbors4(g, ur, uc)) {
      const v = key(nr, nc);
      if (closed.has(v)) continue;
      const alt = best + costOf(g, nr, nc);
      const oldDist = dist.get(v);

      if (alt < (oldDist ?? Infinity)) {
        dist.set(v, alt);
        parent.set(v, u);
        open.add(v);
        yield makeGridStep(
          [
            ...closedHi(closed),
            ...frontierHi(open, dist, ''),
            { row: nr, col: nc, kind: 'frontier', g: alt },
            { row: ur, col: uc, kind: 'current' },
          ],
          10,
          `${v}: ${best} + cost ${costOf(g, nr, nc)} = ${alt} ${oldDist === undefined ? '(first reach)' : `beats ${oldDist}`} â†’ update`,
          { u, v, alt, cost: costOf(g, nr, nc), previous: oldDist ?? 'âˆž' },
          [{ label: 'dijkstra', iteration: steps }, { label: 'nbr', iteration: steps }]
        );
      }
    }
  }

  yield noPathStep(endKey, 11);
}

function closedHi(closed: Set<string>) {
  return [...closed].map((k) => rcHi(k, 'visited'));
}

function frontierHi(open: Set<string>, dist: Map<string, number>, exclude: string) {
  return [...open]
    .filter((k) => k !== exclude)
    .map((k) => {
      const [r, c] = k.split(',').map(Number);
      return { row: r, col: c, kind: 'frontier' as const, g: dist.get(k) };
    });
}

const gridDijkstraDef: AlgorithmDef = {
  id: 'grid-dijkstra',
  name: 'Dijkstra Pathfinding',
  category: 'grid',
  description: 'Expands cells in order of total movement cost, honoring weighted terrain. Guarantees the cheapest path through weights and walls.',
  pseudocode,
  complexity: { time: 'O((RÃ—C)Â²) naive scan', space: 'O(RÃ—C)' },
  defaultInput: { grid: emptyGrid() },
  run: gridDijkstra,
};

registerAlgorithm(gridDijkstraDef);
