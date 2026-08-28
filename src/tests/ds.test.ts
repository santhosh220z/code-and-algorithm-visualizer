import { describe, it, expect } from 'vitest';
import type { AlgorithmDef, Step } from '../core/types';
import { getAlgorithm } from '../core/registry';
import '../algos/ds';

function collect(def: AlgorithmDef, input?: Record<string, unknown>): Step[] {
  return Array.from(def.run({ ...def.defaultInput, ...input }));
}

function lastStep(steps: Step[]): Step {
  return steps[steps.length - 1];
}

describe('data structures', () => {
  const defs = ['ds-stack', 'ds-queue', 'ds-bst', 'ds-hash'].map((id) => getAlgorithm(id));
  it('registers four ds algorithms', () => {
    expect(defs.every(Boolean)).toBe(true);
  });

  for (const def of defs) {
    if (!def) continue;
    it(`${def.id}: every step references non-blank pseudocode lines and carries narration`, () => {
      for (const step of collect(def)) {
        if (step.line !== undefined) {
          expect(step.line).toBeGreaterThanOrEqual(0);
          expect(step.line).toBeLessThan(def.pseudocode.length);
          expect(def.pseudocode[step.line].text.trim()).not.toBe('');
        }
        expect(step.description.length).toBeGreaterThan(0);
      }
    });

    it(`${def.id}: uses a supported viz payload type`, () => {
      const allowed = ['list', 'tree', 'table', 'array', 'none'];
      for (const step of collect(def)) {
        expect(allowed).toContain(step.viz.type);
      }
    });
  }

  it('stack: push/pop maintain LIFO order and end with correct contents', () => {
    const def = getAlgorithm('ds-stack')!;
    const steps = collect(def);
    const last = lastStep(steps);
    expect(last.vars).toBeTruthy();
    expect(String(last.vars?.size)).toBe('3'); // pushes 5,3,8,2,9 / pops 8,2
    expect(String(last.vars?.top)).toBe('9');
  });

  it('queue: FIFO order — first enqueued leaves first', () => {
    const def = getAlgorithm('ds-queue')!;
    const steps = collect(def);
    const last = lastStep(steps);
    expect(String(last.vars?.size)).toBe('3');
    expect(String(last.vars?.front)).toBe('8'); // 5 and 3 dequeued first → [8,2,9]
  });

  it('bst: finds the target when present', () => {
    const def = getAlgorithm('ds-bst')!;
    const steps = collect(def, { target: 40 });
    const found = steps.find((s) => s.vars?.found === true);
    expect(found).toBeDefined();
  });

  it('bst: reports not found when target absent', () => {
    const def = getAlgorithm('ds-bst')!;
    const steps = collect(def, { target: 999 });
    const notFound = steps.find((s) => s.vars?.found === false);
    expect(notFound).toBeDefined();
  });

  it('hash: all entries end up stored', () => {
    const def = getAlgorithm('ds-hash')!;
    const steps = collect(def);
    const last = lastStep(steps);
    const cells = last.viz.type === 'table' ? last.viz.table.flat() : [];
    const stored = cells.filter((c) => c.computed).length;
    expect(stored).toBeGreaterThanOrEqual(3); // 3 unique keys retained after update
  });
});
