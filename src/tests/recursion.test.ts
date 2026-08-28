import { describe, it, expect } from 'vitest';
import type { AlgorithmDef, Step } from '../core/types';
import { getAlgorithm } from '../core/registry';
import '../algos/recursion';

function collect(def: AlgorithmDef, input?: Record<string, unknown>): Step[] {
  return Array.from(def.run({ ...def.defaultInput, ...input }));
}

function lastStep(steps: Step[]): Step {
  return steps[steps.length - 1];
}

describe('recursion', () => {
  const defs = ['rec-factorial', 'rec-hanoi', 'rec-permutations'].map((id) => getAlgorithm(id));
  it('registers three recursion algorithms', () => {
    expect(defs.every(Boolean)).toBe(true);
  });

  for (const def of defs) {
    if (!def) continue;
    it(`${def.id}: every step references valid pseudocode and carries narration`, () => {
      for (const step of collect(def)) {
        if (step.line !== undefined) {
          expect(step.line).toBeGreaterThanOrEqual(0);
          expect(step.line).toBeLessThan(def.pseudocode.length);
          expect(def.pseudocode[step.line].text.trim()).not.toBe('');
        }
        expect(step.description.length).toBeGreaterThan(0);
      }
    });
  }

  it('factorial: computes the correct result', () => {
    const def = getAlgorithm('rec-factorial')!;
    const last = lastStep(collect(def, { n: 6 }));
    expect(Number(last.vars?.result)).toBe(720);
  });

  it('factorial: base case n=0 returns 1', () => {
    const def = getAlgorithm('rec-factorial')!;
    const last = lastStep(collect(def, { n: 0 }));
    expect(Number(last.vars?.result)).toBe(1);
  });

  it('hanoi: completes in 2^n - 1 moves', () => {
    const def = getAlgorithm('rec-hanoi')!;
    const last = lastStep(collect(def, { n: 3 }));
    expect(Number(last.vars?.totalMoves)).toBe(7);
    expect(Number(last.vars?.minimum)).toBe(7);
  });

  it('hanoi: uses pole visualization and ends with all disks on peg C', () => {
    const def = getAlgorithm('rec-hanoi')!;
    const steps = collect(def, { n: 3 });
    for (const step of steps) {
      expect(step.viz.type).toBe('hanoi');
    }
    const last = lastStep(steps);
    if (last.viz.type !== 'hanoi') throw new Error('expected hanoi viz');
    expect(last.viz.pegs.C).toEqual([3, 2, 1]);
    expect(last.viz.pegs.A).toEqual([]);
    expect(last.viz.pegs.B).toEqual([]);
  });

  it('hanoi: each step snapshots its own peg state (no stale completed tower)', () => {
    const def = getAlgorithm('rec-hanoi')!;
    const steps = collect(def, { n: 3 });
    // The very first frame shows all disks still on A, not already solved at C
    const first = steps[0];
    if (first.viz.type !== 'hanoi') throw new Error('expected hanoi viz');
    expect(first.viz.pegs.A).toEqual([3, 2, 1]);
    expect(first.viz.pegs.C).toEqual([]);
    expect(first.viz.moving).toBeNull();
    // Each emitted step must own its own copies of the peg arrays
    const last = lastStep(steps);
    if (last.viz.type !== 'hanoi') throw new Error('expected hanoi viz');
    expect(last.viz.pegs !== first.viz.pegs).toBe(true);
    expect(last.viz.pegs.A !== first.viz.pegs.A).toBe(true);
  });

  it('hanoi: a move is a clean pick-and-place without interpolated travel frames', () => {
    const def = getAlgorithm('rec-hanoi')!;
    const steps = collect(def, { n: 3 });
    const picks = steps.filter((s) => s.viz.type === 'hanoi' && s.viz.moving !== null);
    // one pick frame per move (7 moves)
    expect(picks.length).toBe(7);
  });

  it('permutations: generates n! permutations', () => {
    const def = getAlgorithm('rec-permutations')!;
    const last = lastStep(collect(def, { array: [1, 2, 3] }));
    expect(Number(last.vars?.count)).toBe(6);
  });

  it('permutations: generated set has no duplicates', () => {
    const def = getAlgorithm('rec-permutations')!;
    const last = lastStep(collect(def, { array: [1, 2, 3] }));
    const perms = last.vars?.permutations as string[];
    const uniq = new Set(perms);
    expect(uniq.size).toBe(6);
  });
});
