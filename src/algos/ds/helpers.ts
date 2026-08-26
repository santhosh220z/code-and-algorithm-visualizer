import type { Step, TreeNode, TreeHighlight, ListNode, ListHighlight, TableCell, TableHighlight } from '../../core/types';
import type { GraphNodeBase, GraphEdgeBase, GraphInputData } from '../../core/types';

export interface LoopInfo {
  label: string;
  iteration: number;
}

export interface StackFrame {
  fn: string;
  args: Record<string, unknown>;
}

export function makeTreeStep(
  highlights: TreeHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: { label: string; iteration: number }[],
  stack?: StackFrame[]
): Step {
  return {
    line,
    description,
    vars,
    loops,
    stack,
    viz: { type: 'tree', highlights },
  };
}

export function makeListStep(
  highlights: ListHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: { label: string; iteration: number }[],
  stack?: StackFrame[]
): Step {
  return {
    line,
    description,
    vars,
    loops,
    stack,
    viz: { type: 'list', highlights },
  };
}

export function makeTableStep(
  highlights: TableHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: { label: string; iteration: number }[],
  stack?: StackFrame[]
): Step {
  return {
    line,
    description,
    vars,
    loops,
    stack,
    viz: { type: 'table', highlights },
  };
}

/** BST node with explicit left/right pointers for rendering */
export interface BstNode {
  id: string;
  value: number;
  left?: string;
  right?: string;
  x: number;
  y: number;
}

/** Layout a BST in 2D space using inorder x-coordinates, depth as y. */
export function layoutBst(root: BstNode | null, nodeMap: Map<string, BstNode>): BstNode[] {
  const nodes: BstNode[] = [];
  let xCounter = 0;
  const VERTICAL_GAP = 20;
  const NODE_RADIUS = 2.5;

  function inorder(node: BstNode | null, depth: number) {
    if (!node) return;
    inorder(nodeMap.get(node.left!) ?? null, depth + 1);
    nodes.push({ ...node, x: 50 + xCounter * 12, y: 10 + depth * 15 });
    xCounter++;
    inorder(nodeMap.get(node.right!) ?? null, depth + 1);
  }
  inorder(root, 0);
  return nodes;
}

/** Convert BST structure from parent pointers to explicit left/right id references. */
export function buildBstFromOps(values: number[], insertOps: { value: number; id: string }[]): { root: string | null; nodes: BstNode[] } {
  const nodeMap = new Map<string, { value: number; left: string | null; right: string | null; parent: string | null }>();
  let rootId: string | null = null;

  for (const op of insertOps) {
    if (!rootId) {
      rootId = op.id;
      continue;
    }
    let curId = rootId;
    while (true) {
      const cur = insertOps.find((o) => o.id === curId)!;
      const nextId = op.value < cur.value ? cur.left : cur.right;
      if (!nextId) {
        if (op.value < cur.value) {
          cur.left = op.id;
        } else {
          cur.right = op.id;
        }
        break;
      }
      curId = nextId;
    }
  }

  const nodes: any[] = [];
  for (const op of insertOps) {
    const node = insertOps.find((o) => o.id === op.id)!;
    nodes.push({
      id: op.id,
      value: op.value,
      left: node.left ?? undefined,
      right: node.right ?? undefined,
      x: 0,
      y: 0,
    });
  }
  return { root: rootId, nodes: nodes as any[] };
}

/** Linked list node */
export interface LinkedNode {
  id: string;
  value: number;
  next?: string;
  x: number;
  y: number;
}

export function layoutList(head: string | null, nodeMap: Map<string, { value: number; next?: string }>): any[] {
  const nodes: any[] = [];
  let cur = head;
  let idx = 0;
  while (cur) {
    const node = cur;
    nodes.push({ id: cur, value: nodeMap.get(cur)!.value, next: nodeMap.get(cur)!.next ?? undefined, x: idx * 12, y: 10 });
    cur = nodeMap.get(cur)!.next;
    idx++;
    if (idx > 50) break; // safety
  }
  return nodes;
}

/** Tree layout for recursion (fib call tree) */
export interface TreeLayoutNode {
  id: string;
  value: number | string;
  left?: string;
  right?: string;
  x: number;
  y: number;
}

export function layoutTree(rootId: string, children: Map<string, [string?, string?]>, labelMap: Map<string, number | string>): any[] {
  const nodes: any[] = [];
  let xCounter = 0;

  function inorder(nodeId: string, depth: number) {
    const [left, right] = children.get(nodeId) ?? [undefined, undefined];
    if (left) inorder(left, depth + 1);
    const label = labelMap.get(nodeId);
    nodes.push({ id: nodeId, value: label, left: left, right: right, x: 50 + xCounter * 12, y: 10 + depth * 15 });
    xCounter++;
    if (right) inorder(right, depth + 1);
  }
  // find root (no parent)
  // Actually we know root is passed
  inorder(rootId, 0);
  return nodes;
}

export function makeTreeStep(
  highlights: any[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: { label: string; iteration: number }[],
  stack?: { fn: string; args: Record<string, unknown> }[]
): any {
  return {
    line,
    description,
    vars,
    loops,
    stack,
    viz: { type: 'tree', highlights },
  };
}