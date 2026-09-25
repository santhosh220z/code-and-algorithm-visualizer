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

  it('factorial: visualizes the call stack rather than a bar chart', () => {
    const def = getAlgorithm('rec-factorial')!;
    for (const step of collect(def, { n: 5 })) {
      expect(step.viz.type).toBe('callstack');
    }
  });

  it('factorial: the stack grows to n frames while descending, then unwinds to empty', () => {
    const def = getAlgorithm('rec-factorial')!;
    const steps = collect(def, { n: 5 });
    const depths = steps.map((s) => (s.viz.type === 'callstack' ? s.viz.frames.length : 0));

    expect(Math.max(...depths)).toBe(5);
    // descends monotonically, then unwinds monotonically back down
    const peak = depths.indexOf(Math.max(...depths));
    const down = depths.slice(0, peak + 1);
    const up = depths.slice(peak);
    for (let i = 1; i < down.length; i += 1) expect(down[i]).toBeGreaterThanOrEqual(down[i - 1]);
    for (let i = 1; i < up.length; i += 1) expect(up[i]).toBeLessThanOrEqual(up[i - 1]);
    expect(depths[depths.length - 1]).toBe(0);
  });

  it('factorial: each returning frame is stamped with k! as the stack unwinds', () => {
    const def = getAlgorithm('rec-factorial')!;
    const steps = collect(def, { n: 4 });
    // A frame can be shown stamped on more than one step (the base case stamps
    // factorial(1), then the unwind re-shows it feeding the chain), so assert on
    // the final recorded value per frame rather than on a flat list.
    const byLabel = new Map<string, number>();
    for (const step of steps) {
      if (step.viz.type !== 'callstack') continue;
      for (const frame of step.viz.frames) {
        if (frame.returned !== undefined) byLabel.set(frame.label, frame.returned);
      }
    }
    expect([...byLabel.entries()]).toEqual([
      ['factorial(1)', 1],
      ['factorial(2)', 2],
      ['factorial(3)', 6],
      ['factorial(4)', 24],
    ]);
  });

  it('factorial: the final step reports an empty stack and the result', () => {
    const def = getAlgorithm('rec-factorial')!;
    const last = lastStep(collect(def, { n: 6 }));
    if (last.viz.type !== 'callstack') throw new Error('expected callstack viz');
    expect(last.viz.frames).toEqual([]);
    expect(last.viz.currentId).toBeNull();
    expect(last.viz.result).toBe(720);
  });

  it('factorial: every step owns its own frame snapshot', () => {
    const def = getAlgorithm('rec-factorial')!;
    const steps = collect(def, { n: 4 });
    const frames = steps.map((s) => (s.viz.type === 'callstack' ? s.viz.frames : []));
    expect(frames[0]).not.toBe(frames[frames.length - 1]);
    // an early step must not have been mutated by the later unwind
    expect(frames[0].every((f) => f.returned === undefined)).toBe(true);
    expect(frames[0].length).toBe(1);
  });

  it('factorial: survives a zero-length call without emitting a bogus frame', () => {
    const def = getAlgorithm('rec-factorial')!;
    const steps = collect(def, { n: 0 });
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      if (step.viz.type !== 'callstack') continue;
      for (const frame of step.viz.frames) {
        expect(frame.label).not.toContain('factorial(-1)');
      }
    }
  });

  it('factorial: never claims a non-existent call while descending', () => {
    const def = getAlgorithm('rec-factorial')!;
    for (const n of [0, 1, 2, 5, 8]) {
      for (const step of collect(def, { n })) {
        // descending must never ask for a call below the base case
        expect(step.description).not.toMatch(/factorial\(\s*-\d+\s*\)/);
        if (step.viz.type === 'callstack') {
          for (const frame of step.viz.frames) {
            expect(frame.label).toMatch(/^factorial\([0-9]+\)$/);
          }
        }
      }
    }
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
