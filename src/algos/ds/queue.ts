import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';

const pseudocode = [
  { text: 'procedure enqueue(v)', indent: 0 },
  { text: '  newNode = node(v)', indent: 1 },
  { text: '  if tail == null', indent: 1 },
  { text: '    head = tail = newNode', indent: 2 },
  { text: '  else', indent: 1 },
  { text: '    tail.next = newNode', indent: 2 },
  { text: '    tail = newNode', indent: 2 },
  { text: '  size++', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure dequeue()', indent: 0 },
  { text: '  if head == null', indent: 1 },
  { text: '    return null', indent: 2 },
  { text: '  val = head.value', indent: 1 },
  { text: '  head = head.next', indent: 1 },
  { text: '  if head == null: tail = null', indent: 1 },
  { text: '  size--', indent: 1 },
  { text: '  return val', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure peek()', indent: 0 },
  { text: '  return head ? head.value : null', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* queueGenerator(input: any): Generator<any> {
  yield {
    line: 0,
    description: 'Empty queue - ready to enqueue',
    vars: { size: 0 },
    stack: [],
    viz: { type: 'list', highlights: [] }
  };

  const values = [10, 20, 30, 40];
  for (const v of values) {
    yield {
      line: 0,
      description: `Enqueue ${v}`,
      vars: { value: v, size: 4 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
    };
  }

  yield {
    line: 0,
    description: 'Queue: 10 (front) → 20 → 30 → 40 (rear)',
    vars: { size: 4 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [10, 20, 30, 40].map(v => ({ id: `n${v}`, kind: 'visit' })) }
  };

  // Dequeue
  yield {
    line: 0,
    description: 'Dequeue → returns 10 (front)',
    vars: { value: 10, size: 3 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [{ id: 'n10', kind: 'delete' }] }
  };

  // Peek
  yield {
    line: 0,
    description: 'Peek → returns 20 (front)',
    vars: { value: 20 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [{ id: 'n20', kind: 'visit' }] }
  );

  // Final state
  yield {
    line: 0,
    description: 'Final queue: 20 (front) → 30 → 40 (rear)',
    vars: { size: 3 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [20, 30, 40].map(v => ({ id: `n${v}`, kind: 'path' })) }
  };
}

const queueDef: any = {
  id: 'queue',
  name: 'Queue',
  category: 'ds',
  description: 'FIFO queue with enqueue, dequeue, and peek operations.',
  pseudocode: [
    { text: 'procedure enqueue(v)', indent: 0 },
    { text: '  newNode = node(v)', indent: 1 },
    { text: '  if tail == null', indent: 1 },
    { text: '    head = tail = newNode', indent: 2 },
    { text: '  else', indent: 1 },
    { text: '    tail.next = newNode', indent: 2 },
    { text: '    tail = newNode', indent: 2 },
    { text: '  size++', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure dequeue()', indent: 0 },
    { text: '  if head == null', indent: 1 },
    { text: '    return null', indent: 2 },
    { text: '  val = head.value', indent: 1 },
    { text: '  head = head.next', indent: 1 },
    { text: '  if head == null: tail = null', indent: 1 },
    { text: '  size--', indent: 1 },
    { text: '  return val', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure peek()', indent: 0 },
    { text: '  return head ? head.value : null', indent: 1 },
    { text: 'end procedure', indent: 0 },
  ],
  complexity: { time: 'O(1) enqueue/dequeue/peek', space: 'O(n)' },
  defaultInput: { ops: [10, 20, 30, 40].map(v => ({ op: 'enqueue', value: v })) },
  ops: [
    { id: 'enqueue', label: 'Enqueue', needsValue: true },
    { id: 'dequeue', label: 'Dequeue' },
    { id: 'peek', label: 'Peek' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Queue',
  description: 'FIFO queue with enqueue, dequeue, and peek operations.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty queue - ready to enqueue',
      vars: { size: 0 },
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [10, 20, 30, 40];
    for (const v of [10, 20, 30, 40]) {
      yield {
        line: 0,
        description: `Enqueue ${v}`,
        vars: { value: v, size: 4 },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      };
    }

    yield {
      line: 0,
      description: 'Queue: 10 (front) → 20 → 30 → 40 (rear)',
      vars: { size: 4 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [10, 20, 30, 40].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Dequeue → returns 10 (front)',
      vars: { value: 10, size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n10', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Peek → returns 20 (front)',
      vars: { value: 20 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n20', kind: 'visit' }] }
    };

    yield {
      line: 0,
      description: 'Final queue: 20 (front) → 30 → 40 (rear)',
      vars: { size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [20, 30, 40].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
  ops: [
    { id: 'enqueue', label: 'Enqueue', needsValue: true },
    { id: 'dequeue', label: 'Dequeue' },
    { id: 'peek', label: 'Peek' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Queue',
  description: 'FIFO queue with enqueue, dequeue, and peek operations.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty queue - ready to enqueue',
      vars: { size: 0 },
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [10, 20, 30, 40];
    for (const v of [10, 20, 30, 40]) {
      yield {
        line: 0,
        description: `Enqueue ${v}`,
        vars: { value: v, size: 4 },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      };
    }

    yield {
      line: 0,
      description: 'Queue: 10 (front) → 20 → 30 → 40 (rear)',
      vars: { size: 4 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [10, 20, 30, 40].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Dequeue → returns 10 (front)',
      vars: { value: 10, size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n10', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Peek → returns 20 (front)',
      vars: { value: 20 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n20', kind: 'visit' }] }
    };

    yield {
      line: 0,
      description: 'Final queue: 20 (front) → 30 → 40 (rear)',
      vars: { size: 3 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [20, 30, 40].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
};

export { queueDef };