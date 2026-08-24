import type { AlgorithmDef, AlgorithmInput, Step, GraphNodeHighlight } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { SAMPLE_GRAPH } from '../../core/presets';
import { asGraphInput, makeGraphStep, buildAdjacency, revealPath, noPathStep, euclid } from './helpers';

const pseudocode = [
  { text: 'procedure AStar(G, start, goal)', indent: 0 },
  { text: 'g[start] = 0; f[start] = h(start)', indent: 1 },
  { text: 'open = {start}, closed = {}', indent: 1 },
  { text: 'while open is not empty', indent: 1, isLoopHeader: true, loopLabel: 'astar' },
  { text: 'u = open node with min f[u]', indent: 2 },
  { text: 'if u == goal', indent: 2 },
  { text: 'return path reconstructed from parent', indent: 3 },
  { text: 'move u from open to closed', indent: 2 },
  { text: 'for each neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'if v in closed: continue', indent: 3 },
  { text: 'tentative = g[u] + weight(u, v)', indent: 3 },
  { text: 'if tentative < g[v]', indent: 3 },
  { text: 'g[v] = tentative; f[v] = g[v] + h(v); parent[v] = u', indent: 4 },
  { text: 'add v to open if absent', indent: 4 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* astar(input: AlgorithmInput): Generator<Step> {
  const g = asGraphInput(input);
  const adj = buildAdjacency(g);
  const { startId, endId, nodes, edges } = g;

  // Admissible heuristic: straight-line distance scaled by the cheapest edge,
  // so it never overestimates the true remaining cost.
  const minW = edges.length ? Math.min(...edges.map((e) => e.weight)) : 1;
  const posOf = new Map(nodes.map((n) => [n.id, n]));
  const h = (id: string) => euclid(posOf.get(id)!, posOf.get(endId)!) * (minW * 0.5);

  const gs = new Map<string, number>();
  const fs = new Map<string, number>();
  const parent = new Map<string, string>();
  for (const n of nodes) gs.set(n.id, Infinity);
  gs.set(startId, 0);
  fs.set(startId, h(startId));

  const open = new Set([startId]);
  const closed = new Set<string>();

  const fmt = (v: number) => (v === Infinity ? '∞' : String(Math.round(v * 10) / 10));
  const frontierHi = (exclude: string): GraphNodeHighlight[] =>
    [...open]
      .filter((id) => id !== exclude && !closed.has(id))
      .map((id) => ({ id, kind: 'frontier' as const, dist: Math.round(fs.get(id)! * 10) / 10 }));
  const closedHi = () => [...closed].map((id) => ({ id, kind: 'visited' as const }));

  yield makeGraphStep(
    [{ id: startId, kind: 'frontier', dist: Math.round(fs.get(startId)! * 10) / 10 }],
    [],
    2,
    `Initialize: g[${startId}] = 0, f = g + h. Heuristic h = Euclidean × ${minW * 0.5} (never overestimates)`,
    { startId, goalId: endId, hScale: minW * 0.5 }
  );

  let iter = 0;
  while (open.size > 0) {
    iter++;
    let u: string | null = null;
    let bestF = Infinity;
    for (const id of open) {
      if (fs.get(id)! < bestF) {
        bestF = fs.get(id)!;
        u = id;
      }
    }
    if (u === null) break;

    if (u === endId) {
      yield makeGraphStep(
        [...closedHi(), ...frontierHi(u), { id: u, kind: 'current', dist: Math.round(bestF * 10) / 10 }],
        [],
        6,
        `${u} has lowest f (${fmt(bestF)}) and is the goal — done! g = ${fmt(gs.get(u)!)}`,
        { u, g: fmt(gs.get(u)!), f: fmt(bestF) },
        [{ label: 'astar', iteration: iter }]
      );
      yield* revealPath(parent, startId, endId, 6, `total cost ${fmt(gs.get(u)!)}`);
      return;
    }

    yield makeGraphStep(
      [...closedHi(), ...frontierHi(u), { id: u, kind: 'current', dist: Math.round(bestF * 10) / 10 }],
      [],
      5,
      `Pick open node ${u} with minimum f = g ${fmt(gs.get(u)!)} + h ${fmt(h(u))} = ${fmt(bestF)}`,
      { u, g: fmt(gs.get(u)!), h: fmt(h(u)), f: fmt(bestF) },
      [{ label: 'astar', iteration: iter }]
    );

    open.delete(u);
    closed.add(u);

    for (const { id: v, weight } of adj.get(u)!) {
      if (closed.has(v)) {
        continue;
      }
      const tentative = gs.get(u)! + weight;

      if (tentative < gs.get(v)!) {
        gs.set(v, tentative);
        fs.set(v, tentative + h(v));
        parent.set(v, u);
        open.add(v);
        yield makeGraphStep(
          [...closedHi(), ...frontierHi(''), { id: v, kind: 'frontier', dist: Math.round(fs.get(v)! * 10) / 10 }, { id: u, kind: 'current' }],
          [{ from: u, to: v, kind: 'comparing' }],
          12,
          `${v}: g = ${fmt(tentative)}, h = ${fmt(h(v))} → f = ${fmt(fs.get(v)!)}; parent[${v}] = ${u}`,
          { u, v, g: fmt(tentative), h: fmt(h(v)), f: fmt(fs.get(v)!) },
          [{ label: 'astar', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      } else {
        yield makeGraphStep(
          [...closedHi(), ...frontierHi(''), { id: u, kind: 'current' }],
          [{ from: u, to: v, kind: 'comparing' }],
          11,
          `${v}: tentative g ${fmt(tentative)} ≥ existing ${fmt(gs.get(v)!)} — no improvement`,
          { u, v, tentative: fmt(tentative), existingG: fmt(gs.get(v)!) },
          [{ label: 'astar', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      }
    }
  }

  yield noPathStep(endId, 14);
}

const astarDef: AlgorithmDef = {
  id: 'graph-astar',
  name: 'A* Search',
  category: 'graph',
  description: 'Dijkstra plus an admissible heuristic that steers the search toward the goal, expanding fewer nodes for the same optimal path.',
  pseudocode,
  complexity: { time: 'O(V² ) with linear scan', space: 'O(V)' },
  defaultInput: { graph: SAMPLE_GRAPH },
  run: astar,
};

registerAlgorithm(astarDef);