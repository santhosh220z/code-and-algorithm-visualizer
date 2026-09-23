import type { Step, TreeNode, TreeHighlight, ListNode, ListHighlight } from '../../core/types';
import type { LoopInfo, StackFrame } from '../../core/stepHelpers';

export type { LoopInfo, StackFrame } from '../../core/stepHelpers';
export { makeTableStep, tableCell, tableCompute, tableRead, tableResult } from '../../core/stepHelpers';

export function makeTreeStep(
  nodes: TreeNode[],
  highlights: TreeHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[],
  stack?: StackFrame[]
): Step {
  return { line, description, vars, loops, stack, viz: { type: 'tree', nodes, highlights } };
}

export function makeListStep(
  nodes: ListNode[],
  highlights: ListHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[],
  stack?: StackFrame[]
): Step {
  return { line, description, vars, loops, stack, viz: { type: 'list', nodes, highlights } };
}

export function treeNode(
  id: string,
  value: number | string,
  x: number,
  y: number,
  left?: string,
  right?: string,
  parent?: string
): TreeNode {
  return { id, value, x, y, left, right, parent };
}

export function listNode(id: string, value: number | string, x: number, y: number, next?: string): ListNode {
  return { id, value, x, y, next };
}

export function makeListNodes(values: (number | string)[], y = 0): ListNode[] {
  const n = values.length;
  const spacing = 80;
  const startX = -((n - 1) * spacing) / 2;
  return values.map((value, i) =>
    listNode(String(i), value, startX + i * spacing, y, i < n - 1 ? String(i + 1) : undefined)
  );
}