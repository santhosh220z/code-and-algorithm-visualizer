import { describe, it, expect } from 'vitest';
import type { AlgorithmDef, Step } from '../core/types';
import { getAlgorithm } from '../core/registry';
import '../algos/dp';

function collect(def: AlgorithmDef, input?: Record<string, unknown>): Step[] {
  return Array.from(def.run({ ...def.defaultInput, ...input }));
}

function lastStep(steps: Step[]): Step {
  return steps[steps.length - 1];
}

describe('dynamic programming', () => {
  const defs = ['dp-fibonacci', 'dp-knapsack', 'dp-lcs'].map((id) => getAlgorithm(id));
  it('registers three dp algorithms', () => {
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

    it(`${def.id}: uses a table viz payload`, () => {
      for (const step of collect(def)) {
        expect(step.viz.type).toBe('table');
      }
    });
  }

  it('fibonacci: computes the correct value', () => {
    const def = getAlgorithm('dp-fibonacci')!;
    const steps = collect(def, { n: 10 });
    const last = lastStep(steps);
    expect(String(last.vars?.result)).toBe('55'); // fib(10)
  });

  it('fibonacci: respects different n', () => {
    const def = getAlgorithm('dp-fibonacci')!;
    const last = lastStep(collect(def, { n: 7 }));
    expect(String(last.vars?.result)).toBe('13'); // fib(7)
  });

  it('knapsack: finds optimal value', () => {
    const def = getAlgorithm('dp-knapsack')!;
    const last = lastStep(collect(def, { capacity: 8 }));
    // weights [2,3,4,5], values [3,4,5,6], cap 8 → optimal is 10 (items 3&4: 5+6)
    expect(Number(last.vars?.result)).toBe(10);
  });

  it('knapsack: normalizes decimal weights to positive integers without NaN', () => {
    const def = getAlgorithm('dp-knapsack')!;
    const steps = collect(def, { weights: [1.5, 2.7, 0.4, 3.2], values: [2, 3, 4, 5], capacity: 8 });
    for (const step of steps) {
      if (step.viz.type === 'table') {
        for (const row of step.viz.table) {
          for (const cell of row) {
            expect(Number.isNaN(Number(cell.value))).toBe(false);
          }
        }
      }
    }
    const last = lastStep(steps);
    expect(Number.isNaN(Number(last.vars?.result))).toBe(false);
    // floors to weights [1,2,3] with values [2,3,5] (the 0.4 item rounds to 0 and is dropped)
    expect(Number(last.vars?.result)).toBe(10);
  });

  it('knapsack: drops non-finite and non-positive items and falls back when none survive', () => {
    const def = getAlgorithm('dp-knapsack')!;
    const cleaned = lastStep(
      collect(def, { weights: [Number.NaN, -3, 0, Number.POSITIVE_INFINITY, 2, 3], values: [9, 9, 9, 9, 4, 5], capacity: 8 })
    );
    expect(Number.isNaN(Number(cleaned.vars?.result))).toBe(false);
    // surviving weights [2,3] values [4,5] cap 8 → 9
    expect(Number(cleaned.vars?.result)).toBe(9);
    const empty = lastStep(collect(def, { weights: [], values: [], capacity: 8 }));
    expect(Number.isNaN(Number(empty.vars?.result))).toBe(false);
    expect(Number(empty.vars?.result)).toBe(10);
  });

  it('knapsack: clamps an out-of-range capacity', () => {
    const def = getAlgorithm('dp-knapsack')!;
    const last = lastStep(collect(def, { capacity: 999 }));
    expect(Number(last.vars?.capacity)).toBeLessThanOrEqual(20);
  });

  it('lcs: finds length and sequence', () => {
    const def = getAlgorithm('dp-lcs')!;
    const last = lastStep(collect(def, { a: 'ABCBDAB', b: 'BDCAB' }));
    expect(Number(last.vars?.result)).toBe(4);
    expect(String(last.vars?.lcs)).toBe('BCAB');
  });
});
