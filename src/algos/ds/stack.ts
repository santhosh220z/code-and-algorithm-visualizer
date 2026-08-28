import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeListStep, makeListNodes, listNode } from './helpers';

const pseudocode = [
  { text: 'procedure stackDemo(ops)', indent: 0 },
  { text: 'stack = empty', indent: 1 },
  { text: 'for each op in ops', indent: 1, isLoopHeader: true, loopLabel: 'ops' },
  { text: 'if op == "push"', indent: 2 },
  { text: 'stack.push(op.value)', indent: 3 },
  { text: 'else', indent: 2 },
  { text: 'stack.pop()', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'return stack', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

export function* stackDemo(input: AlgorithmInput): Generator<Step> {
  const stack: number[] = [];
  const ops: { op: 'push' | 'pop'; value?: number }[] =
    (input.ops as { op: 'push' | 'pop'; value?: number }[]) ?? [
      { op: 'push', value: 5 },
      { op: 'push', value: 3 },
      { op: 'push', value: 8 },
      { op: 'pop' },
      { op: 'push', value: 2 },
      { op: 'pop' },
      { op: 'push', value: 9 },
    ];

  yield makeListStep(makeListNodes([]), [], 1, 'Initialize empty stack', { size: 0 });

  let pushCounter = 0;
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op.op === 'push') {
      const value = op.value ?? (pushCounter += 1);
      stack.push(value);
      const nodeLabels = stack;
      const nodes = nodeLabels.map((val, idx) =>
        listNode(String(idx), val, (idx - (stack.length - 1) / 2) * 80, 0, idx < stack.length - 1 ? String(idx + 1) : undefined)
      );
      const topIdx = stack.length - 1;
      yield makeListStep(
        nodes,
        [{ nodeId: String(topIdx), kind: 'insert' }],
        4,
        `Push ${value} onto the stack (new top)`,
        { size: stack.length, top: value, operation: 'push' },
        [{ label: 'ops', iteration: i + 1 }]
      );
    } else {
      const popped = stack.pop();
      const nodeLabels = stack;
      const nodes = nodeLabels.map((val, idx) =>
        listNode(String(idx), val, (idx - (stack.length - 1) / 2) * 80, 0, idx < stack.length - 1 ? String(idx + 1) : undefined)
      );
      yield makeListStep(
        nodes,
        [],
        6,
        `Pop ${popped} off the stack (LIFO) — top removed`,
        { size: stack.length, popped, operation: 'pop' },
        [{ label: 'ops', iteration: i + 1 }]
      );
    }
  }

  const finalNodes = stack.map((val, idx) =>
    listNode(String(idx), val, (idx - (stack.length - 1) / 2) * 80, 0, idx < stack.length - 1 ? String(idx + 1) : undefined)
  );
  yield makeListStep(finalNodes, [], 9, `All operations complete — stack has ${stack.length} element(s)`, {
    size: stack.length,
    top: stack.length ? stack[stack.length - 1] : undefined,
  });
}

const stackDemoDef: AlgorithmDef = {
  id: 'ds-stack',
  name: 'Stack (LIFO)',
  category: 'ds',
  description: 'Demonstrates the LIFO behavior of a stack with push and pop operations.',
  pseudocode,
  complexity: { time: 'O(1) push/pop', space: 'O(n)' },
  defaultInput: {},
  run: stackDemo,
  ops: [
    { id: 'push', label: 'Push', needsValue: true },
    { id: 'pop', label: 'Pop' },
  ],
};

registerAlgorithm(stackDemoDef);
