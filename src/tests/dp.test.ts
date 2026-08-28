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

  it('lcs: finds length and sequence', () => {
    const def = getAlgorithm('dp-lcs')!;
    const last = lastStep(collect(def, { a: 'ABCBDAB', b: 'BDCAB' }));
    expect(Number(last.vars?.result)).toBe(4);
    expect(String(last.vars?.lcs)).toBe('BCAB');
  });
});
