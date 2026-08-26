import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';

const pseudocode = [
  { text: 'procedure push(v)', indent: 0 },
  { text: '  newNode = node(v)', indent: 1 },
  { text: '  newNode.next = top', indent: 1 },
  { text: '  top = newNode', indent: 1 },
  { text: '  size++', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure pop()', indent: 0 },
  { text: '  if top == null', indent: 1 },
  { text: '    return null', indent: 2 },
  { text: '  val = top.value', indent: 1 },
  { text: '  top = top.next', indent: 1 },
  { text: '  size--', indent: 1 },
  { text: '  return val', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure peek()', indent: 0 },
  { text: '  return top ? top.value : null', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* stackGenerator(input: any): Generator<any> {
  yield {
    line: 0,
    description: 'Empty stack - ready to push',
    vars: { size: 0 },
    stack: [],
    viz: { type: 'list', highlights: [] }
  };

  const values = [5, 10, 15, 20];
  for (const v of values) {
    yield {
      line: 0,
      description: `Push ${v}`,
      vars: { value: v, size: 4 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
    };
  }

  yield {
    line: 0,
    description: 'Stack: 20 (top) → 15 → 10 → 5 (bottom)',
    vars: { size: 4 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [20, 15, 10, 5].map(v => ({ id: `n${v}`, kind: 'visit' })) }
  );

  // Pop
  yield {
    line: 0,
    description: 'Pop → returns 20',
    vars: { value: 20, size: 3 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [{ id: 'n20', kind: 'delete' }] }
  );

  // Peek
  yield {
    line: 0,
    description: 'Peek → returns 15 (top)',
    vars: { value: 15 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [{ id: 'n15', kind: 'visit' }] }
  );

  // Final state
  yield {
    line: 0,
    description: 'Final stack: 15 (top) → 10 → 5',
    vars: { size: 3 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [15, 10, 5].map(v => ({ id: `n${v}`, kind: 'path' })) }
  );
}

const stackDef: any = {
  id: 'stack',
  name: 'Stack',
  category: 'ds',
  description: 'LIFO stack with push, pop, and peek operations.',
  pseudocode: [
    { text: 'procedure push(v)', indent: 0 },
    { text: '  newNode = node(v)', indent: 1 },
    { text: '  newNode.next = top', indent: 1 },
    { text: '  top = newNode', indent: 1 },
    { text: '  size++', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure pop()', indent: 0 },
    { text: '  if top == null', indent: 1 },
    { text: '    return null', indent: 2 },
    { text: '  val = top.value', indent: 1 },
    { text: '  top = top.next', indent: 1 },
    { text: '  size--', indent: 1 },
    { text: '  return val', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure peek()', indent: 0 },
    { text: '  return top ? top.value : null', indent: 1 },
    { text: 'end procedure', indent: 0 },
  ],
  complexity: { time: 'O(1) push/pop/peek', space: 'O(n)' },
  defaultInput: { ops: [5, 10, 15, 20].map(v => ({ op: 'push', value: v })) },
  ops: [
    { id: 'push', label: 'Push', needsValue: true },
    { id: 'pop', label: 'Pop' },
    { id: 'peek', label: 'Peek' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Stack',
  description: 'LIFO stack with push, pop, and peek operations.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty stack - ready to push',
      vars: { size: 0 },
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [5, 10, 15, 20];
    for (const v of [5, 10, 15, 20]) {
      yield {
        line: 0,
        description: `Push ${v}`,
        vars: { value: v, size: 4 },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      );
    }

    yield {
      line: 0,
      description: 'Stack: 20 (top) → 15 → 10 → 5 (bottom)',
      vars: { size: 4 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [20, 15, 10, 5].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Pop → returns 20',
      vars: { value: 20, size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n20', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Peek → returns 15 (top)',
      vars: { value: 15 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n15', kind: 'visit' }] }
    );

    yield {
      line: 0,
      description: 'Final stack: 15 (top) → 10 → 5',
      vars: { size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [15, 10, 5].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
  ops: [
    { id: 'push', label: 'Push', needsValue: true },
    { id: 'pop', label: 'Pop' },
    { id: 'peek', label: 'Peek' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Stack',
  description: 'LIFO stack with push, pop, and peek operations.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty stack - ready to push',
      vars: { size: 0 },
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [5, 10, 15, 20];
    for (const v of [5, 10, 15, 20]) {
      yield {
        line: 0,
        description: `Push ${v}`,
        vars: { value: v, size: 4 },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      );
    }

    yield {
      line: 0,
      description: 'Stack: 20 (top) → 15 → 10 → 5 (bottom)',
      vars: { size: 4 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [20, 15, 10, 5].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Pop → returns 20',
      vars: { value: 20, size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n20', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Peek → returns 15 (top)',
      vars: { value: 15 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n15', kind: 'visit' }] }
    };

    yield {
      line: 0,
      description: 'Final stack: 15 (top) → 10 → 5',
      vars: { size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [15, 10, 5].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
  ops: [
    { id: 'push', label: 'Push', needsValue: true },
    { id: 'pop', label: 'Pop' },
    { id: 'peek', label: 'Peek' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Stack',
  description: 'LIFO stack with push, pop, and peek operations.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty stack - ready to push',
      vars: { size: 0 },
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [5, 10, 15, 20];
    for (const v of [5, 10, 15, 20]) {
      yield {
        line: 0,
        description: `Push ${v}`,
        vars: { value: v, size: 4 },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      );
    }

    yield {
      line: 0,
      description: 'Stack: 20 (top) → 15 → 10 → 5 (bottom)',
      vars: { size: 4 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [20, 15, 10, 5].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Pop → returns 20',
      vars: { value: 20, size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n20', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Peek → returns 15 (top)',
      vars: { value: 15 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n15', kind: 'visit' }] }
    };

    yield {
      line: 0,
      description: 'Final stack: 15 (top) → 10 → 5',
      vars: { size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [15, 10, 5].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
};

export { stackDef };