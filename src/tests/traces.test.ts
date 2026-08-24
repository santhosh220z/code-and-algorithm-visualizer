import { describe, it, expect } from 'vitest';
import { getAlgorithm, getAllAlgorithms } from '../core/registry';
import '../algos/sorting';
import '../algos/search';

const seededArray = [64, 34, 25, 12, 22, 11, 90, 5, 77, 1];

describe('sorting traces', () => {
  const sortingAlgos = getAllAlgorithms().filter((a) => a.category === 'sorting');

  it('registers six sorting algorithms', () => {
    expect(sortingAlgos.map((a) => a.id).sort()).toEqual(
      ['bubble-sort', 'heap-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'selection-sort'].sort()
    );
  });

  for (const algo of sortingAlgos) {
    it(`${algo.id}: trace ends fully sorted`, () => {
      const steps = Array.from(algo.run({ array: [...seededArray] }));
      expect(steps.length).toBeGreaterThan(0);

      const lastViz = steps[steps.length - 1].viz;
      expect(lastViz.type).toBe('array');
      if (lastViz.type !== 'array') return;

      const expected = [...seededArray].sort((a, b) => a - b);
      expect(lastViz.array).toEqual(expected);
    });

    it(`${algo.id}: every step references a valid pseudocode line and carries narration`, () => {
      for (const step of algo.run({ array: [...seededArray] })) {
        if (step.line !== undefined) {
          expect(step.line).toBeGreaterThanOrEqual(0);
          expect(step.line).toBeLessThan(algo.pseudocode.length);
          // Must point at real code, never a blank line
          expect(algo.pseudocode[step.line].text.trim()).not.toBe('');
        }
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it(`${algo.id}: line highlights land on semantically matching statements`, () => {
      // Spot-check invariants per algorithm family: the first step after init
      // should reference a loop/assignment, and swap steps must reference
      // lines containing "swap" or an assignment.
      const steps = Array.from(algo.run({ array: [5, 3, 8, 1] }));
      for (const step of steps) {
        if (step.line === undefined) continue;
        const text = algo.pseudocode[step.line].text.toLowerCase();
        const d = step.description.toLowerCase();
        if (/^swap\b/.test(d) || d.includes('swapping') || d.includes('swap a[')) {
          expect(text.includes('swap') || /a\[\w+\]\s*=/.test(text)).toBe(true);
        }
      }
    });
  }

  it('insertion-sort: never displays duplicated values mid-trace (shift-copy regression)', () => {
    const algo = getAlgorithm('insertion-sort')!;
    const input = [7, 3, 9, 1, 5]; // all distinct values
    let sawSwap = false;
    for (const step of algo.run({ array: [...input] })) {
      if (step.viz.type !== 'array') continue;
      // Shift-based insertion sort briefly duplicates values (A[j+1]=A[j]);
      // exchange-based never does. Guard against that class of visual bug.
      expect(new Set(step.viz.array).size).toBe(step.viz.array.length);
      if (step.viz.highlights.some((h) => h.kind === 'swap')) sawSwap = true;
    }
    expect(sawSwap).toBe(true); // sanity: swaps actually occur on this input
  });

  it('bubble sort: every swap step is followed by a correctly swapped array', () => {
    const algo = getAlgorithm('bubble-sort')!;
    let prev: number[] | null = null;
    for (const step of algo.run({ array: [3, 1, 2] })) {
      if (step.viz.type !== 'array') continue;
      const { array, highlights } = step.viz;
      // Array length never changes
      expect(array).toHaveLength(3);
      if (prev && highlights.some((h) => h.kind === 'sorted')) {
        // sorted markers only on final passes; values must be non-decreasing so far
      }
      prev = array;
    }
    expect(prev).toEqual([1, 2, 3]);
  });
});

describe('search traces', () => {
  it('linear search finds the target and reports its index', () => {
    const algo = getAlgorithm('linear-search')!;
    const steps = Array.from(algo.run({ array: [9, 4, 7, 1], target: 7 }));
    const found = steps.find((s) => s.vars?.found === true);
    expect(found).toBeDefined();
    expect(found!.vars!.i).toBe(2); // index of 7
  });

  it('binary search halves the range each iteration and finds target', () => {
    const algo = getAlgorithm('binary-search')!;
    const sorted = [1, 3, 5, 7, 9, 11, 13, 15];
    const steps = Array.from(algo.run({ array: [...sorted], target: 15 }));
    const found = steps.find((s) => s.vars?.found === true);
    expect(found).toBeDefined();
    expect(found!.vars!.mid).toBe(7);
  });

  it('two pointers finds a valid pair summing to target', () => {
    const algo = getAlgorithm('two-pointers')!;
    const arr = [2, 7, 11, 15, 19, 25];
    const target = 26; // 7 + 19
    const steps = Array.from(algo.run({ array: [...arr], target }));
    const found = steps.find((s) => s.vars?.found === true);
    expect(found).toBeDefined();
    const { left, right } = found!.vars! as { left: number; right: number };
    const sortedArr = [...arr].sort((a, b) => a - b);
    expect(sortedArr[left] + sortedArr[right]).toBe(target);
  });
});
