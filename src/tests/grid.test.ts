import { describe, it, expect } from 'vitest';
import type { AlgorithmDef, Step, GridInputData } from '../core/types';
import { getAlgorithm } from '../core/registry';
import { resizeGrid } from '../core/presets';
import { usePlayerStore } from '../core/player';
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

  it('open-grid paths are monotone toward the goal (straight, no staircase drift)', () => {
    const g: GridInputData = emptyBase(); // S(2,0) -> E(2,6), no obstacles
    for (const id of ['grid-bfs', 'grid-dijkstra', 'grid-astar']) {
      const def = getAlgorithm(id)!;
      const steps = runGrid(def, g);
      const last = lastStep(steps);
      if (last.viz.type !== 'grid') throw new Error(`${id}: no grid viz`);
      const ordered = last.viz.highlights.filter((h) => h.kind === 'path');
      expect(ordered.length).toBe(7); // optimal: 6 moves + start cell

      // Every consecutive step must close exactly one unit of Manhattan distance
      let dist = Math.abs(g.end[0] - g.start[0]) + Math.abs(g.end[1] - g.start[1]);
      for (let i = 1; i < ordered.length; i++) {
        const dr = Math.abs(g.end[0] - ordered[i].row) + Math.abs(g.end[1] - ordered[i].col);
        expect(dr).toBe(dist - 1);
        dist = dr;
      }
      expect(dist).toBe(0); // ends exactly at the goal
    }
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

describe('custom grid sizing (resizeGrid)', () => {
  it('shrinks: drops out-of-bounds walls/weights and clamps endpoints inside', () => {
    const g: GridInputData = {
      rows: 10,
      cols: 20,
      walls: ['1,1', '9,19', '4,10', '12,25'],
      weights: { '2,10': 6, '15,30': 4 },
      start: [8, 1],
      end: [9, 18],
    };
    const r = resizeGrid(g, 6, 16);
    expect(r.rows).toBe(6);
    expect(r.cols).toBe(16);
    for (const w of r.walls) {
      const [row, col] = w.split(',').map(Number);
      expect(row).toBeLessThan(6);
      expect(col).toBeLessThan(16);
    }
    expect(r.walls.sort()).toEqual(['1,1', '4,10']);
    expect(Object.keys(r.weights)).toEqual(['2,10']);
    for (const [r0, c0] of [r.start, r.end]) {
      expect(r0).toBeLessThan(6);
      expect(c0).toBeLessThan(16);
    }
  });

  it('never leaves an endpoint on a wall or lets them coincide', () => {
    const g: GridInputData = {
      rows: 5,
      cols: 8,
      walls: ['0,7'],
      weights: {},
      start: [0, 7], // clamps onto the wall cell
      end: [4, 7],
    };
    const r = resizeGrid(g, 5, 8);
    const startKey = `${r.start[0]},${r.start[1]}`;
    const endKey = `${r.end[0]},${r.end[1]}`;
    expect(r.walls).not.toContain(startKey);
    expect(r.walls).not.toContain(endKey);
    expect(startKey).not.toBe(endKey);
  });

  it('growing keeps everything; absurd values clamp to bounds', () => {
    const g: GridInputData = {
      rows: 5, cols: 8, walls: ['2,2', '3,3'], weights: { '1,1': 4 },
      start: [2, 0], end: [2, 7],
    };
    const grown = resizeGrid(g, 10, 20);
    expect(grown.walls.sort()).toEqual(['2,2', '3,3']);
    expect(grown.weights['1,1']).toBe(4);

    const clamped = resizeGrid(g, 1000, -3);
    expect(clamped.rows).toBe(30);
    expect(clamped.cols).toBe(8); // min bound
  });

  it('patchInput snaps to the new end when the previous run was completed', () => {
    const store = usePlayerStore.getState();
    const def = getAlgorithm('grid-bfs')!;
    store.setAlgorithm(def);
    let s = usePlayerStore.getState();
    s.jumpToEnd();
    s = usePlayerStore.getState();
    const oldLen = s.steps.length;
    expect(s.cursor).toBe(oldLen - 1);

    // Edit after completion with a LARGER grid (longer trace)
    const grid = s.input.grid as GridInputData;
    s.patchInput({ grid: resizeGrid(grid, grid.rows + 5, grid.cols + 5) } as never);
    s = usePlayerStore.getState();
    expect(s.steps.length).toBeGreaterThan(oldLen);
    expect(s.cursor).toBe(s.steps.length - 1); // still at the finished path

    // Mid-trace edits keep the absolute position
    s.setCursor(3);
    usePlayerStore.getState().patchInput({ grid: s.input.grid } as never);
    expect(usePlayerStore.getState().cursor).toBe(3);
  });

  it('regenerate (New data) preserves custom grid dimensions', () => {
    const store = usePlayerStore.getState();
    const def = getAlgorithm('grid-astar')!;
    store.setAlgorithm(def);

    // Resize to a custom size, then regenerate obstacles
    let s = usePlayerStore.getState();
    const original = s.input.grid as GridInputData;
    s.patchInput({ grid: resizeGrid(original, 18, 34) } as never);

    usePlayerStore.getState().regenerate();
    s = usePlayerStore.getState();

    const after = s.input.grid as GridInputData;
    expect(after.rows).toBe(18); // NOT the 12 default
    expect(after.cols).toBe(34); // NOT the 20 default
    expect(Array.isArray(after.walls)).toBe(true);
    // Trace was rebuilt for the new layout
    expect(s.steps.length).toBeGreaterThan(0);
    expect(s.cursor).toBe(0);
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