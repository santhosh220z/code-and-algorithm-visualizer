import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { SAMPLE_GRAPH } from '../../core/presets';
import type { GraphNodeHighlight } from '../../core/types';
import { asGraphInput, makeGraphStep, buildAdjacency, revealPath, noPathStep } from './helpers';

const pseudocode = [
  { text: 'procedure Dijkstra(G, start, goal)', indent: 0 },
  { text: 'dist[start] = 0; dist[v] = ∞ for others', indent: 1 },
  { text: 'settled = {}, parent = {}', indent: 1 },
  { text: 'while unsettled nodes remain', indent: 1, isLoopHeader: true, loopLabel: 'dijkstra' },
  { text: 'u = unsettled node with min dist[u]', indent: 2 },
  { text: 'if dist[u] == ∞: break', indent: 2 },
  { text: 'settle u', indent: 2 },
  { text: 'if u == goal', indent: 2 },
  { text: 'return path reconstructed from parent', indent: 3 },
  { text: 'for each neighbor v of u', indent: 2, isLoopHeader: true, loopLabel: 'nbr' },
  { text: 'alt = dist[u] + weight(u, v)', indent: 3 },
  { text: 'if alt < dist[v]', indent: 3 },
  { text: 'dist[v] = alt; parent[v] = u', indent: 4 },
  { text: 'end for', indent: 2 },
  { text: 'return "no path"', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* dijkstra(input: AlgorithmInput): Generator<Step> {
  const g = asGraphInput(input);
  const adj = buildAdjacency(g);
  const { startId, endId, nodes } = g;

  const dist = new Map<string, number>();
  const parent = new Map<string, string>();
  const settled = new Set<string>();
  for (const n of nodes) dist.set(n.id, Infinity);
  dist.set(startId, 0);

  const fmt = (v: number) => (v === Infinity ? '∞' : String(v));

  /** Frontier = reachable but not yet settled (with live distance badge). */
  const frontierHi = (exclude: string): GraphNodeHighlight[] =>
    nodes
      .filter((n) => !settled.has(n.id) && n.id !== exclude && dist.get(n.id)! < Infinity)
      .map((n) => ({ id: n.id, kind: 'frontier' as const, dist: dist.get(n.id)! }));

  yield makeGraphStep([{ id: startId, kind: 'frontier', dist: 0 }], [], 1,
    `Initialize: dist[${startId}] = 0, all others ∞`, { startId, goalId: endId });

  let iter = 0;
  while (settled.size < nodes.length) {
    iter++;
    let u: string | null = null;
    let best = Infinity;
    for (const n of nodes) {
      if (!settled.has(n.id) && dist.get(n.id)! < best) {
        best = dist.get(n.id)!;
        u = n.id;
      }
    }
    if (u === null || best === Infinity) break;

    if (u === endId) {
      yield makeGraphStep(
        [...settledHi(), { id: u, kind: 'current', dist: best }],
        [],
        8,
        `${u} has min tentative dist (${fmt(best)}) and is the goal — done!`,
        { u, dist: fmt(best), settledCount: settled.size },
        [{ label: 'dijkstra', iteration: iter }]
      );
      yield* revealPath(parent, startId, endId, 8, `total cost ${best}`);
      return;
    }

    yield makeGraphStep(
      [...settledHi(), ...frontierHi(u), { id: u, kind: 'current', dist: best }],
      [],
      5,
      `Pick unsettled ${u} with minimum dist = ${fmt(best)}`,
      { u, dist: fmt(best) },
      [{ label: 'dijkstra', iteration: iter }]
    );

    settled.add(u);

    for (const { id: v, weight } of adj.get(u)!) {
      if (settled.has(v)) continue;
      const alt = best + weight;
      const edgeHi = [{ from: u, to: v, kind: 'comparing' as const }];

      if (alt < dist.get(v)!) {
        const oldDist = dist.get(v)!;
        dist.set(v, alt);
        parent.set(v, u);
        yield makeGraphStep(
          [...settledHi(), ...frontierHi(''), { id: u, kind: 'current' }, { id: v, kind: 'frontier', dist: alt }],
          edgeHi,
          12,
          `Relax via ${u}: ${fmt(best)} + ${weight} = ${alt} beats dist[${v}] (${oldDist === Infinity ? '∞' : oldDist}) → update`,
          { u, v, alt, weight, previous: oldDist === Infinity ? '∞' : oldDist },
          [{ label: 'dijkstra', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      } else {
        yield makeGraphStep(
          [...settledHi(), ...frontierHi(''), { id: u, kind: 'current' }],
          edgeHi,
          11,
          `Relax via ${u}: ${fmt(best)} + ${weight} = ${alt} ≥ dist[${v}] = ${fmt(dist.get(v)!)} — keep existing`,
          { u, v, alt, currentDist: fmt(dist.get(v)!) },
          [{ label: 'dijkstra', iteration: iter }, { label: 'nbr', iteration: iter }]
        );
      }
    }
  }

  yield noPathStep(endId, 14);

  function settledHi(): GraphNodeHighlight[] {
    return [...settled].map((id) => ({ id, kind: 'visited' as const }));
  }
}

const dijkstraDef: AlgorithmDef = {
  id: 'graph-dijkstra',
  name: 'Dijkstra',
  category: 'graph',
  description: 'Greedily settles the closest unsettled node each round, relaxing edges outward. Guarantees cheapest paths with non-negative weights.',
  pseudocode,
  complexity: { time: 'O(V²) with linear scan', space: 'O(V)' },
  defaultInput: { graph: SAMPLE_GRAPH },
  run: dijkstra,
};

registerAlgorithm(dijkstraDef);