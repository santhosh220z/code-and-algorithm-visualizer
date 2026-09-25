import { describe, it, expect } from 'vitest';
import type { AlgorithmDef, Step, TreeNode } from '../core/types';
import { getAlgorithm } from '../core/registry';
import { getTreeEdges, layoutTreeNodes, orderListNodes } from '../components/viz/layouts';
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

  it('stack/queue: render as labelled containers, never as an unlabelled list', () => {
    const stackSteps = collect(getAlgorithm('ds-stack')!);
    const queueSteps = collect(getAlgorithm('ds-queue')!);

    for (const step of stackSteps) {
      expect(step.viz.type).toBe('list');
      if (step.viz.type === 'list') expect(step.viz.variant).toBe('stack');
    }
    for (const step of queueSteps) {
      expect(step.viz.type).toBe('list');
      if (step.viz.type === 'list') expect(step.viz.variant).toBe('queue');
    }
  });

  it('stack/queue: the empty first step still carries its container variant', () => {
    for (const id of ['ds-stack', 'ds-queue'] as const) {
      const first = collect(getAlgorithm(id)!)[0];
      expect(first.description).toMatch(/empty/i);
      expect(first.viz.type).toBe('list');
      if (first.viz.type === 'list') {
        // zero nodes is a valid empty container, not a missing visualization
        expect(first.viz.nodes).toHaveLength(0);
        expect(first.viz.variant).not.toBe('linked');
      }
    }
  });

  it('stack: container nodes carry no linked-list pointers', () => {
    for (const step of collect(getAlgorithm('ds-stack')!)) {
      if (step.viz.type !== 'list') continue;
      for (const node of step.viz.nodes) expect(node.next).toBeUndefined();
    }
  });

  it('stack: the top is always the last value in the container', () => {
    const steps = collect(getAlgorithm('ds-stack')!);
    const pushes = steps.filter((s) => s.vars?.operation === 'push');
    expect(pushes.length).toBeGreaterThan(0);
    for (const step of pushes) {
      if (step.viz.type !== 'list') continue;
      const top = step.viz.nodes[step.viz.nodes.length - 1];
      expect(String(top.value)).toBe(String(step.vars?.top));
      // the pushed value is highlighted as the new top
      const highlighted = step.viz.highlights.map((h) => h.nodeId);
      expect(highlighted).toContain(top.id);
    }
  });

  it('queue: the front is always the first value in the container', () => {
    const steps = collect(getAlgorithm('ds-queue')!);
    for (const step of steps) {
      if (step.viz.type !== 'list' || step.viz.nodes.length === 0) continue;
      const front = step.viz.nodes[0];
      if (step.vars?.front !== undefined) expect(String(front.value)).toBe(String(step.vars.front));
    }
    const enqueues = steps.filter((s) => s.vars?.operation === 'enqueue');
    expect(enqueues.length).toBeGreaterThan(0);
    for (const step of enqueues) {
      if (step.viz.type !== 'list') continue;
      // enqueue highlights the new rear, which is the last node
      const rear = step.viz.nodes[step.viz.nodes.length - 1];
      expect(step.viz.highlights.map((h) => h.nodeId)).toContain(rear.id);
    }
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

  it('list visualization orders every node from head to tail', () => {
    const nodes = [
      { id: 'b', value: 2, next: 'c', x: 0, y: 0 },
      { id: 'a', value: 1, next: 'b', x: 0, y: 0 },
      { id: 'c', value: 3, x: 0, y: 0 },
    ];

    expect(orderListNodes(nodes).map((node) => node.id)).toEqual(['a', 'b', 'c']);
  });

  it('tree visualization renders both child edges without mutating step data', () => {
    const nodes: TreeNode[] = [
      { id: 'root', value: 50, x: 0, y: 0, left: 'left', right: 'right' },
      { id: 'left', value: 30, x: 0, y: 0 },
      { id: 'right', value: 70, x: 0, y: 0 },
    ];

    expect(getTreeEdges(nodes)).toEqual([
      { from: 'root', to: 'left' },
      { from: 'root', to: 'right' },
    ]);

    const positioned = layoutTreeNodes(nodes);
    expect(positioned.find((node) => node.id === 'root')?.x).not.toBe(0);
    expect(nodes[0].x).toBe(0);
    expect(nodes[0].y).toBe(0);
  });
});
