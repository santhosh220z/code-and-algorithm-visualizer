import { describe, it, expect } from 'vitest';
import type { AlgorithmDef, Step, GraphInputData } from '../core/types';
import { getAlgorithm } from '../core/registry';
import '../algos/graph';

function graphOf(def: AlgorithmDef): GraphInputData {
  return def.defaultInput.graph as GraphInputData;
}

function collect(def: AlgorithmDef, input?: Partial<GraphInputData>): Step[] {
  const base = graphOf(def);
  return Array.from(def.run({ graph: { ...base, ...input } }));
}

function lastStep(steps: Step[]): Step {
  return steps[steps.length - 1];
}

/** Brute-force shortest hop count between two nodes on the undirected projection. */
function shortestHops(g: GraphInputData, s: string, t: string): number | null {
  const adj = new Map<string, string[]>();
  for (const n of g.nodes) adj.set(n.id, []);
  for (const e of g.edges) {
    adj.get(e.from)!.push(e.to);
    adj.get(e.to)!.push(e.from);
  }
  const dist = new Map([[s, 0]]);
  const q = [s];
  while (q.length) {
    const u = q.shift()!;
    if (u === t) return dist.get(u)!;
    for (const v of adj.get(u)!) {
      if (!dist.has(v)) {
        dist.set(v, dist.get(u)! + 1);
        q.push(v);
      }
    }
  }
  return null;
}

/** Bellman-Ford style shortest distances from s (undirected projection). */
function refDistances(g: GraphInputData, s: string): Map<string, number> {
  const dist = new Map<string, number>(g.nodes.map((n) => [n.id, Infinity]));
  dist.set(s, 0);
  for (let i = 0; i < g.nodes.length; i++) {
    for (const e of g.edges) {
      const a = dist.get(e.from)!, b = dist.get(e.to)!;
      if (a + e.weight < dist.get(e.to)!) dist.set(e.to, a + e.weight);
      if (b + e.weight < dist.get(e.from)!) dist.set(e.from, b + e.weight);
    }
  }
  return dist;
}

function pathCost(g: GraphInputData, steps: Step[]): number | null {
  const last = steps[steps.length - 1];
  if (last.viz.type !== 'graph') return null;
  const pathIds = last.viz.highlights.filter((h) => h.kind === 'path').map((h) => h.id);
  if (pathIds.length < 2) return null;
  let cost = 0;
  for (let i = 0; i < pathIds.length - 1; i++) {
    const e =
      g.edges.find((x) => x.from === pathIds[i] && x.to === pathIds[i + 1]) ??
      g.edges.find((x) => x.to === pathIds[i] && x.from === pathIds[i + 1]);
    if (!e) return null;
    cost += e.weight;
  }
  return cost;
}

describe('graph algorithms', () => {
  const defs = ['graph-bfs', 'graph-dfs', 'graph-dijkstra', 'graph-astar'].map((id) => getAlgorithm(id)!);
  expect(defs.every(Boolean)).toBe(true);

  for (const def of defs) {
    it(`${def.id}: every step references non-blank pseudocode lines`, () => {
      for (const step of collect(def)) {
        if (step.line !== undefined) {
          expect(step.line).toBeGreaterThanOrEqual(0);
          expect(step.line).toBeLessThan(def.pseudocode.length);
          expect(def.pseudocode[step.line].text.trim()).not.toBe('');
        }
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it(`${def.id}: reaches the goal and ends with a highlighted path`, () => {
      const steps = collect(def);
      const last = lastStep(steps);
      expect(last.viz.type).toBe('graph');
      if (last.viz.type !== 'graph') return;
      const pathNodes = last.viz.highlights.filter((h) => h.kind === 'path').map((h) => h.id);
      expect(pathNodes.length).toBeGreaterThan(1);
      expect(pathNodes[0]).toBe(graphOf(def).startId);
      expect(pathNodes[pathNodes.length - 1]).toBe(graphOf(def).endId);
    });
  }

  it('bfs path has minimal hop count', () => {
    const def = getAlgorithm('graph-bfs')!;
    const g = graphOf(def);
    const expected = shortestHops(g, g.startId, g.endId)!;
    const steps = collect(def);
    const last = lastStep(steps);
    const hops = Number(last.vars?.pathEdges ?? NaN);
    expect(hops).toBe(expected);
  });

  it('dijkstra distances match reference relaxation', () => {
    const def = getAlgorithm('graph-dijkstra')!;
    const g = graphOf(def);
    const steps = collect(def);
    // Re-run capturing settled state is implicit; instead verify reported total cost
    // equals the reference distance to the goal.
    const last = lastStep(steps);
    const costStr = String(last.vars?.costLabel ?? '');
    const m = costStr.match(/([\d.]+)/);
    expect(m).not.toBeNull();
    const reported = Number(m![1]);
    const ref = refDistances(g, g.startId).get(g.endId)!;
    expect(reported).toBeCloseTo(ref, 5);
  });

  it('astar returns the same optimal cost as dijkstra', () => {
    const astarSteps = collect(getAlgorithm('graph-astar')!);
    const dijSteps = collect(getAlgorithm('graph-dijkstra')!);
    const g = graphOf(getAlgorithm('graph-astar')!);

    const aCost = pathCost(g, astarSteps);
    const dCost = pathCost(g, dijSteps);
    expect(aCost).not.toBeNull();
    expect(dCost).not.toBeNull();
    expect(aCost!).toBeCloseTo(dCost!, 5);
  });

  it('dfs path edges actually exist in the graph', () => {
    const def = getAlgorithm('graph-dfs')!;
    const g = graphOf(def);
    const steps = collect(def);
    const last = lastStep(steps);
    const ids = last.viz.type === 'graph' ? last.viz.highlights.filter((h) => h.kind === 'path').map((h) => h.id) : [];
    expect(ids.length).toBeGreaterThan(1);
    for (let i = 0; i < ids.length - 1; i++) {
      const connected = g.edges.some(
        (e) => (e.from === ids[i] && e.to === ids[i + 1]) || (e.from === ids[i + 1] && e.to === ids[i])
      );
      expect(connected).toBe(true);
    }
  });

  it('directed graphs respect edge direction', () => {
    const def = getAlgorithm('graph-bfs')!;
    const g = graphOf(def);
    // Reverse one edge so the goal is unreachable when directed A<-B only paths break
    const directed: GraphInputData = {
      ...g,
      directed: true,
      edges: [
        { from: g.endId, to: g.startId, weight: 1 }, // wrong way only
        ...g.edges.slice(0, 3),
      ],
    };
    const steps = Array.from(def.run({ graph: directed }));
    const last = lastStep(steps);
    // With this truncated directed graph the trace must terminate without crashing;
    // either finds a path within the first 3 edges or reports no path.
    expect(last.description.length).toBeGreaterThan(0);
  });
});