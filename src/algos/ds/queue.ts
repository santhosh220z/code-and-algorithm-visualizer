import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeListStep, listNode } from './helpers';

const pseudocode = [
  { text: 'procedure queueDemo(ops)', indent: 0 },
  { text: 'queue = empty', indent: 1 },
  { text: 'for each op in ops', indent: 1, isLoopHeader: true, loopLabel: 'ops' },
  { text: 'if op == "enqueue"', indent: 2 },
  { text: 'queue.enqueue(op.value)', indent: 3 },
  { text: 'else', indent: 2 },
  { text: 'queue.dequeue()', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'return queue', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* queueDemo(input: AlgorithmInput): Generator<Step> {
  const queue: number[] = [];
  const ops: { op: 'enqueue' | 'dequeue'; value?: number }[] =
    (input.ops as { op: 'enqueue' | 'dequeue'; value?: number }[]) ?? [
      { op: 'enqueue', value: 5 },
      { op: 'enqueue', value: 3 },
      { op: 'enqueue', value: 8 },
      { op: 'dequeue' },
      { op: 'enqueue', value: 2 },
      { op: 'dequeue' },
      { op: 'enqueue', value: 9 },
    ];

  yield makeListStep([], [], 1, 'Initialize empty queue (FIFO)', { size: 0 });

  let enqueueCounter = 0;
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op.op === 'enqueue') {
      const value = op.value ?? (enqueueCounter += 1);
      queue.push(value);
      const nodes = queue.map((val, idx) =>
        listNode(String(idx), val, (idx - (queue.length - 1) / 2) * 80, 0, idx < queue.length - 1 ? String(idx + 1) : undefined)
      );
      yield makeListStep(
        nodes,
        [{ nodeId: String(queue.length - 1), kind: 'insert' }],
        4,
        `Enqueue ${value} at the tail of the queue`,
        { size: queue.length, tail: value, operation: 'enqueue' },
        [{ label: 'ops', iteration: i + 1 }]
      );
    } else {
      const dequeued = queue.shift();
      const nodes = queue.map((val, idx) =>
        listNode(String(idx), val, (idx - (queue.length - 1) / 2) * 80, 0, idx < queue.length - 1 ? String(idx + 1) : undefined)
      );
      yield makeListStep(
        nodes,
        [],
        6,
        `Dequeue ${dequeued} from the front (FIFO)`,
        { size: queue.length, dequeued, operation: 'dequeue' },
        [{ label: 'ops', iteration: i + 1 }]
      );
    }
  }

  const finalNodes = queue.map((val, idx) =>
    listNode(String(idx), val, (idx - (queue.length - 1) / 2) * 80, 0, idx < queue.length - 1 ? String(idx + 1) : undefined)
  );
  yield makeListStep(finalNodes, [], 9, `All operations complete — queue holds ${queue.length} element(s)`, {
    size: queue.length,
    front: queue.length ? queue[0] : undefined,
  });
}

const queueDemoDef: AlgorithmDef = {
  id: 'ds-queue',
  name: 'Queue (FIFO)',
  category: 'ds',
  description: 'Demonstrates the FIFO behavior of a queue with enqueue and dequeue operations.',
  pseudocode,
  complexity: { time: 'O(1) enqueue/dequeue', space: 'O(n)' },
  defaultInput: {},
  run: queueDemo,
  ops: [
    { id: 'enqueue', label: 'Enqueue', needsValue: true },
    { id: 'dequeue', label: 'Dequeue' },
  ],
};

registerAlgorithm(queueDemoDef);
