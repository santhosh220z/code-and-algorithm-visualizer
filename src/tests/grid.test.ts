import { describe, it, expect } from 'vitest';
import type { AlgorithmDef, Step, GridInputData } from '../core/types';
import { getAlgorithm } from '../core/registry';
import '../algos/grid';

function runGrid(def: AlgorithmDef, g: GridInputData): Step[] {
  return Array.from(def.run({ grid: g }));
}

function lastStep(steps: Step[]): Step {
  return steps[steps.length - 1];
}

/** Final-frame path cells (kind === 'path'). */
function pathCells(steps: Step[]): Set<string> {
  const last = lastStep(steps);
  const out = new Set<string>();
  if (last.viz.type === 'grid') {
    for (const h of last.viz.highlights) {
      if (h.kind === 'path') out.add(`${h.row},${h.col}`);
    }
  }
  return out;
}

/** Sum of destination-cell costs along the final path. */
function pathCost(g: GridInputData, cells: Set<string>): number | null {
  const arr = [...cells].map((k) => k.split(',').map(Number));
  if (arr.length < 2) return null;
  // Reconstruct ordering by walking adjacency
  const keyOf = (r: number, c: number) => `${r},${c}`;
  const inSet = (r: number, c: number) => cells.has(keyOf(r, c));
  const startKey = keyOf(g.start[0], g.start[1]);
  const endKey = keyOf(g.end[0], g.end[1]);
  let cur: [number, number] = g.start;
  let cost = 0;
  const visitedLocal = new Set<string>([startKey]);
  let guard = 0;
  while (guard++ < 5000) {
    if (keyOf(cur[0], cur[1]) === endKey) return cost;
    const deltas: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let advanced = false;
    for (const [dr, dc] of deltas) {
      const nr = cur[0] + dr, nc = cur[1] + dc;
      if (inSet(nr, nc) && !visitedLocal.has(keyOf(nr, nc))) {
        visitedLocal.add(keyOf(nr, nc));
        cost += g.weights[keyOf(nr, nc)] ?? 1;
        cur = [nr, nc];
        advanced = true;
        break;
      }
    }
    if (!advanced) return null;
  }
  return null;
}

describe('grid pathfinding', () => {
  const defs = ['grid-bfs', 'grid-dfs', 'grid-dijkstra', 'grid-astar'].map((id) => getAlgorithm(id)!);
  it('registers four grid algorithms', () => {
    expect(defs.every(Boolean)).toBe(true);
  });

  for (const def of defs) {
    it(`${def.id}: every step references non-blank pseudocode lines`, () => {
      const g: GridInputData = { ...emptyBase(), walls: ['1,2', '2,2'] };
      for (const step of runGrid(def, g)) {
        if (step.line !== undefined) {
          expect(step.line).toBeGreaterThanOrEqual(0);
          expect(step.line).toBeLessThan(def.pseudocode.length);
          expect(def.pseudocode[step.line].text.trim()).not.toBe('');
        }
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it(`${def.id}: respects walls — path never crosses them`, () => {
      const g: GridInputData = {
        ...emptyBase(),
        walls: ['0,2', '1,2', '3,2'],
      };
      const steps = runGrid(def, g);
      const path = pathCells(steps);
      for (const w of ['0,2', '1,2', '3,2']) {
        expect(path.has(w)).toBe(false);
      }
    });
  }

  it('bfs finds the minimal cell count through the only gap', () => {
    const def = getAlgorithm('grid-bfs')!;
    const g: GridInputData = {
      ...emptyBase(),
      walls: ['0,3', '1,3', '3,3', '4,3'], // gap only at row 2
    };
    const steps = runGrid(def, g);
    const path = pathCells(steps);
    // Start (2,0) -> End (2,6): straight line through the gap = 7 cells / 6 steps
    expect(path.size).toBe(7);
    const last = lastStep(steps);
    expect(last.vars?.pathSteps).toBe(6);
  });

  it('dijkstra routes around expensive corridor (cost 6 vs 31)', () => {
    const def = getAlgorithm('grid-dijkstra')!;
    const g: GridInputData = {
      ...emptyBase(),
      weights: { '1,1': 10, '1,2': 10, '1,3': 10 },
    };
    const steps = runGrid(def, g);
    const cost = pathCost(g, pathCells(steps));
    expect(cost).toBe(6); // up-and-over the top row, all default-cost cells
  });

  it('astar matches dijkstra optimal cost on weighted terrain', () => {
    const g: GridInputData = {
      ...emptyBase(),
      weights: { '1,1': 10, '1,2': 10, '1,3': 10, '3,1': 4, '3,2': 4 },
    };
    const dCost = pathCost(g, pathCells(runGrid(getAlgorithm('grid-dijkstra')!, g)));
    const aCost = pathCost(g, pathCells(runGrid(getAlgorithm('grid-astar')!, g)));
    expect(dCost).not.toBeNull();
    expect(aCost).not.toBeNull();
    expect(aCost!).toBe(dCost!);
  });

  it('reports no path when the goal is sealed off', () => {
    const def = getAlgorithm('grid-bfs')!;
    const g: GridInputData = {
      ...emptyBase(),
      walls: ['0,3', '1,3', '2,3', '3,3', '4,3'], // complete wall column
    };
    const steps = runGrid(def, g);
    const last = lastStep(steps);
    expect(last.vars?.found).toBe(false);
    expect(pathCells(steps).size).toBe(0);
  });
});

function emptyBase(): GridInputData {
  return {
    rows: 5,
    cols: 7,
    walls: [],
    weights: {},
    start: [2, 0],
    end: [2, 6],
  };
}