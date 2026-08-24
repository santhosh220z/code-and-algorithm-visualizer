import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { emptyGrid } from '../../core/presets';
import { asGridInput, makeGridStep, key, neighbors4, costOf, revealGridPath, noPathStep } from './helpers';
import { rcHi } from './bfs';

const pseudocode = [
  { text: 'procedure AStar(Grid, S, E)', indent: 0 },
  { text: 'g[S] = 0; f[S] = h(S); open = {S}', indent: 1 },
  { text: 'while open is not empty', indent: 1, isLoopHeader: true, loopLabel: 'astar' },
  { text: 'u = open cell with min f[u]', indent: 2 },
  { text: 'if u == E', indent: 2 },
  { text: 'return path from parent', indent: 3 },
  { text: 'open -= {u}; closed âˆª= {u}', indent: 2 },
  { text: 'for each walkable neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'if v in closed: continue', indent: 3 },
  { text: 'tentative = g[u] + cost(v)', indent: 3 },
  { text: 'if tentative < g[v]', indent: 3 },
  { text: 'g[v] = tentative; f[v] = g[v] + h(v); parent[v] = u; open âˆª= {v}', indent: 4 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* gridAstar(input: AlgorithmInput): Generator<Step> {
  const g = asGridInput(input);
  const startKey = key(g.start[0], g.start[1]);
  const endKey = key(g.end[0], g.end[1]);

  // Manhattan heuristic with minimum terrain cost â€” admissible on this grid.
  const [er, ec] = g.end;
  const minCost = Math.min(1, ...Object.values(g.weights), Number.POSITIVE_INFINITY) || 1;
  const h = (r: number, c: number) => (Math.abs(r - er) + Math.abs(c - ec)) * Math.min(1, minCost);

  const gs = new Map<string, number>([[startKey, 0]]);
  const fs = new Map<string, number>([[startKey, h(g.start[0], g.start[1])]]);
  const parent = new Map<string, string>();
  const closed = new Set<string>();
  const open = new Set([startKey]);

  const fmt = (v: number) => String(Math.round(v * 100) / 100);

  yield makeGridStep(
    [{ row: g.start[0], col: g.start[1], kind: 'frontier', g: 0 }],
    1,
    `Initialize: g[S]=0, f = g + h. h = Manhattan distance Ã— ${fmt(Math.min(1, minCost))} (never overestimates)`,
    { goal: endKey }
  );

  let iter = 0;
  while (open.size > 0) {
    iter++;
    let u: string | null = null;
    let bestF = Infinity;
    for (const k of open) {
      const f = fs.get(k) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        u = k;
      }
    }
    if (u === null) break;

    const [ur, uc] = u.split(',').map(Number);

    if (u === endKey) {
      yield makeGridStep(
        [...closedHi(closed), ...frontierHi(open, fs, u), { row: ur, col: uc, kind: 'current', g: bestF }],
        5,
        `${u} has min f (${fmt(bestF)}) and is the goal â€” done!`,
        { u, f: fmt(bestF) },
        [{ label: 'astar', iteration: iter }]
      );
      yield* revealGridPath(parent, startKey, endKey, 5, `total cost ${fmt(gs.get(u)!)}`);
      return;
    }

    yield makeGridStep(
      [...closedHi(closed), ...frontierHi(open, fs, u), { row: ur, col: uc, kind: 'current', g: bestF }],
      4,
      `Pick open cell ${u}: g=${fmt(gs.get(u)!)} + h=${fmt(h(ur, uc))} â†’ f=${fmt(bestF)} (smallest)`,
      { u, g: fmt(gs.get(u)!), h: fmt(h(ur, uc)), f: fmt(bestF) },
      [{ label: 'astar', iteration: iter }]
    );

    open.delete(u);
    closed.add(u);

    for (const [nr, nc] of neighbors4(g, ur, uc)) {
      const v = key(nr, nc);
      if (closed.has(v)) continue;
      const tentative = gs.get(u)! + costOf(g, nr, nc);

      if (tentative < (gs.get(v) ?? Infinity)) {
        gs.set(v, tentative);
        fs.set(v, tentative + h(nr, nc));
        parent.set(v, u);
        open.add(v);
        yield makeGridStep(
          [
            ...closedHi(closed),
            ...frontierHi(open, fs, ''),
            { row: nr, col: nc, kind: 'frontier', g: fs.get(v) },
            { row: ur, col: uc, kind: 'current' },
          ],
          12,
          `${v}: g=${fmt(tentative)}, h=${fmt(h(nr, nc))} â†’ f=${fmt(fs.get(v)!)}; parent[${v}] = ${u}`,
          { v, g: fmt(tentative), h: fmt(h(nr, nc)), f: fmt(fs.get(v)!) },
          [{ label: 'astar', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      } else {
        yield makeGridStep(
          [...closedHi(closed), ...frontierHi(open, fs, ''), { row: ur, col: uc, kind: 'current' }],
          11,
          `${v}: tentative g ${fmt(tentative)} â‰¥ existing ${fmt(gs.get(v)!)} â€” skip`,
          { v, tentative: fmt(tentative) },
          [{ label: 'astar', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      }
    }
  }

  yield noPathStep(endKey, 12);
}

function closedHi(closed: Set<string>) {
  return [...closed].map((k) => rcHi(k, 'visited'));
}

function frontierHi(open: Set<string>, fs: Map<string, number>, exclude: string) {
  return [...open]
    .filter((k) => k !== exclude)
    .map((k) => {
      const [r, c] = k.split(',').map(Number);
      return { row: r, col: c, kind: 'frontier' as const, g: fs.get(k) };
    });
}

const gridAstarDef: AlgorithmDef = {
  id: 'grid-astar',
  name: 'A* Pathfinding',
  category: 'grid',
  description: 'Best-first search guided by a Manhattan heuristic toward the goal. Same optimal paths as Dijkstra while exploring far fewer cells.',
  pseudocode,
  complexity: { time: 'O((RÃ—C) log(RÃ—C)) heap / naive scan here', space: 'O(RÃ—C)' },
  defaultInput: { grid: emptyGrid() },
  run: gridAstar,
};

registerAlgorithm(gridAstarDef);
