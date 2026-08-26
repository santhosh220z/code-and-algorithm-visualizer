import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';

const pseudocode = [
  { text: 'procedure traverse()', indent: 0 },
  { text: '  cur = head', indent: 1 },
  { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'traverse' },
  { text: '    visit cur', indent: 2 },
  { text: '    cur = cur.next', indent: 2 },
  { text: '  end while', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure append(v)', indent: 0 },
  { text: '  newNode = node(v)', indent: 1 },
  { text: '  if head == null', indent: 1 },
  { text: '    head = newNode', indent: 2 },
  { text: '  else', indent: 1 },
  { text: '    walk to tail', indent: 2 },
  { text: '    tail.next = newNode', indent: 2 },
  { text: '  end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure insertHead(v)', indent: 0 },
  { text: '  newNode = node(v)', indent: 1 },
  { text: '  newNode.next = head', indent: 1 },
  { text: '  head = newNode', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure delete(v)', indent: 0 },
  { text: '  find n where n.value == v', indent: 1 },
  { text: '  if n == head', indent: 1 },
  { text: '    head = head.next', indent: 2 },
  { text: '  else', indent: 1 },
  { text: '    prev.next = n.next', indent: 2 },
  { text: '  end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* linkedListGenerator(input: any): Generator<any> {
  yield {
    line: 0,
    description: 'Empty linked list - ready to insert',
    vars: {},
    stack: [],
    viz: { type: 'list', highlights: [] }
  };

  const values = [10, 20, 30, 40, 50];
  for (const v of values) {
    yield {
      line: 0,
      description: `Append ${v}`,
      vars: { value: v },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
    };
  }

  yield {
    line: 0,
    description: 'Traversing list: 10 → 20 → 30 → 40 → 50',
    vars: {},
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [10, 20, 30, 40, 50].map(v => ({ id: `n${v}`, kind: 'visit' })) }
  };

  // Insert at head
  yield {
    line: 0,
    description: 'Insert 5 at head',
    vars: { value: 5 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [{ id: 'n5', kind: 'insert' }] }
  };

  // Delete a value
  yield {
    line: 0,
    description: 'Delete 30',
    vars: { value: 30 },
    loops: [],
    stack: [],
    viz: { type: 'list', highlights: [{ id: 'n30', kind: 'delete' }] }
  };

  // Final list
  yield {
    line: 0,
    description: 'Final list: 5 → 10 → 20 → 40 → 50',
    vars: {},
    stack: [],
    viz: { type: 'list', highlights: [5, 10, 20, 40, 50].map(v => ({ id: `n${v}`, kind: 'path' })) }
  };
}

const linkedListDef: any = {
  id: 'linked-list',
  name: 'Linked List',
  category: 'ds',
  description: 'Insert, traverse, and delete operations on a singly linked list.',
  pseudocode: [
    { text: 'procedure traverse()', indent: 0 },
    { text: '  cur = head', indent: 1 },
    { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'traverse' },
    { text: '    visit cur', indent: 2 },
    { text: '    cur = cur.next', indent: 2 },
    { text: '  end while', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure append(v)', indent: 0 },
    { text: '  newNode = node(v)', indent: 1 },
    { text: '  if head == null', indent: 1 },
    { text: '    head = newNode', indent: 2 },
    { text: '  else', indent: 1 },
    { text: '    walk to tail', indent: 2 },
    { text: '    tail.next = newNode', indent: 2 },
    { text: '  end if', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure insertHead(v)', indent: 0 },
    { text: '  newNode = node(v)', indent: 1 },
    { text: '  newNode.next = head', indent: 1 },
    { text: '  head = newNode', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure delete(v)', indent: 0 },
    { text: '  find n where n.value == v', indent: 1 },
    { text: '  if n == head', indent: 1 },
    { text: '    head = head.next', indent: 2 },
    { text: '  else', indent: 1 },
    { text: '    prev.next = n.next', indent: 2 },
    { text: '  end if', indent: 1 },
    { text: 'end procedure', indent: 0 },
  ],
  complexity: { time: 'O(n) search, O(1) insert at head', space: 'O(n)' },
  defaultInput: { ops: [10, 20, 30, 40, 50].map(v => ({ op: 'append', value: v })) },
  ops: [
    { id: 'append', label: 'Append', needsValue: true },
    { id: 'insertHead', label: 'Insert at Head', needsValue: true },
    { id: 'delete', label: 'Delete', needsValue: true },
    { id: 'traverse', label: 'Traverse' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Linked List',
  description: 'Insert, traverse, and delete operations on a singly linked list.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty linked list - ready to insert',
      vars: {},
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [10, 20, 30, 40, 50];
    for (const v of [10, 20, 30, 40, 50]) {
      yield {
        line: 0,
        description: `Append ${v}`,
        vars: { value: v },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      };
    }

    yield {
      line: 0,
      description: 'Traversing list: 10 → 20 → 30 → 40 → 50',
      vars: {},
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [10, 20, 30, 40, 50].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Insert 5 at head',
      vars: { value: 5 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n5', kind: 'insert' }] }
    };

    yield {
      line: 0,
      description: 'Delete 30',
      vars: { value: 30 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n30', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Final list: 5 → 10 → 20 → 40 → 50',
      vars: {},
      stack: [],
      viz: { type: 'list', highlights: [5, 10, 20, 40, 50].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
  ops: [
    { id: 'append', label: 'Append', needsValue: true },
    { id: 'insertHead', label: 'Insert at Head', needsValue: true },
    { id: 'delete', label: 'Delete', needsValue: true },
    { id: 'traverse', label: 'Traverse' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Linked List',
  description: 'Insert, traverse, and delete operations on a singly linked list.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty linked list - ready to insert',
      vars: {},
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [10, 20, 30, 40, 50];
    for (const v of [10, 20, 30, 40, 50]) {
      yield {
        line: 0,
        description: `Append ${v}`,
        vars: { value: v },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      };
    }

    yield {
      line: 0,
      description: 'Traversing list: 10 → 20 → 30 → 40 → 50',
      vars: {},
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [10, 20, 30, 40, 50].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Insert 5 at head',
      vars: { value: 5 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n5', kind: 'insert' }] }
    };

    yield {
      line: 0,
      description: 'Delete 30',
      vars: { value: 30 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n30', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Final list: 5 → 10 → 20 → 40 → 50',
      vars: {},
      stack: [],
      viz: { type: 'list', highlights: [5, 10, 20, 40, 50].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
  ops: [
    { id: 'append', label: 'Append', needsValue: true },
    { id: 'insertHead', label: 'Insert at Head', needsValue: true },
    { id: 'delete', label: 'Delete', needsValue: true },
    { id: 'traverse', label: 'Traverse' },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Linked List',
  description: 'Insert, traverse, and delete operations on a singly linked list.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty linked list - ready to insert',
      vars: {},
      stack: [],
      viz: { type: 'list', highlights: [] }
    };

    const values = [10, 20, 30, 40, 50];
    for (const v of [10, 20, 30, 40, 50]) {
      yield {
        line: 0,
        description: `Append ${v}`,
        vars: { value: v },
        loops: [],
        stack: [],
        viz: { type: 'list', highlights: [{ id: `n${v}`, kind: 'insert' }] }
      };
    }

    yield {
      line: 0,
      description: 'Traversing list: 10 → 20 → 30 → 40 → 50',
      vars: {},
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [10, 20, 30, 40, 50].map(v => ({ id: `n${v}`, kind: 'visit' })) }
    };

    yield {
      line: 0,
      description: 'Insert 5 at head',
      vars: { value: 5 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n5', kind: 'insert' }] }
    };

    yield {
      line: 0,
      description: 'Delete 30',
      vars: { value: 30 },
      loops: [],
      stack: [],
      viz: { type: 'list', highlights: [{ id: 'n30', kind: 'delete' }] }
    };

    yield {
      line: 0,
      description: 'Final list: 5 → 10 → 20 → 40 → 50',
      vars: {},
      stack: [],
      viz: { type: 'list', highlights: [5, 10, 20, 40, 50].map(v => ({ id: `n${v}`, kind: 'path' })) }
    };
  },
};

export { linkedListDef };