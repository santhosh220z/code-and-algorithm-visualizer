import type { AlgorithmDef, AlgorithmInput, Step, TreeNode, TreeHighlight } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeTreeStep, treeNode } from './helpers';

interface BSTNode {
  id: string;
  value: number;
  left?: string;
  right?: string;
}

type PositionedBSTNode = BSTNode & { x: number; y: number };

const pseudocode = [
  { text: 'procedure bstSearch(root, target)', indent: 0 },
  { text: 'current = root', indent: 1 },
  { text: 'while current != null', indent: 1, isLoopHeader: true, loopLabel: 'search' },
  { text: 'if target == current.value', indent: 2 },
  { text: 'return current  // found', indent: 3 },
  { text: 'else if target < current.value', indent: 2 },
  { text: 'current = current.left', indent: 3 },
  { text: 'else', indent: 2 },
  { text: 'current = current.right', indent: 3 },
  { text: 'end if', indent: 2 },
  { text: 'end while', indent: 1 },
  { text: 'return null  // not in tree', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

const TREE_VALUES = [50, 30, 70, 20, 40, 60, 80];

function buildBst(values: number[]): { nodes: Array<BSTNode & { x: number; y: number }>; byId: Map<string, BSTNode & { x: number; y: number }>; root: string } {
  const bstNodes = new Map<string, BSTNode & { x: number; y: number }>();

  const insert = (value: number): string => {
    const id = `v${value}`;
    const cur = bstNodes.get(id);
    if (cur) return cur.id;
    const node: BSTNode & { x: number; y: number } = { id, value, x: 0, y: 0 };
    bstNodes.set(id, node);
    return id;
  };

  const rootId = insert(values[0]);
  for (let i = 1; i < values.length; i++) {
    const val = values[i];
    let cur = rootId;
    while (true) {
      const curNode = bstNodes.get(cur)!;
      if (val < curNode.value) {
        if (curNode.left !== undefined) {
          cur = curNode.left;
        } else {
          const id = insert(val);
          curNode.left = id;
          break;
        }
      } else {
        if (curNode.right !== undefined) {
          cur = curNode.right;
        } else {
          const id = insert(val);
          curNode.right = id;
          break;
        }
      }
    }
  }

  // Assign positions via an inorder layout
  const assign = (id: string, depth: number, min: number, max: number): void => {
    const node = bstNodes.get(id)!;
    node.x = (min + max) / 2;
    node.y = depth * 70;
    if (node.left !== undefined) assign(node.left, depth + 1, min, node.x);
    if (node.right !== undefined) assign(node.right, depth + 1, node.x, max);
  };
  assign(rootId, 0, 0, 400);

  const out: Array<BSTNode & { x: number; y: number }> = [];
  const visitedOrder = (id: string): void => {
    const node = bstNodes.get(id)!;
    out.push(node);
    if (node.left !== undefined) visitedOrder(node.left);
    if (node.right !== undefined) visitedOrder(node.right);
  };
  visitedOrder(rootId);

  return { nodes: out, byId: bstNodes, root: rootId };
}

export function* bstSearch(input: AlgorithmInput): Generator<Step> {
  const target = Number(input.target ?? 40);
  const { nodes: bstNodes, byId, root } = buildBst(TREE_VALUES);

  const toTreeNodes = (): TreeNode[] =>
    bstNodes.map((n) =>
      treeNode(n.id, n.value, n.x, n.y, n.left, n.right, undefined)
    );

  const highlights = (currentId?: string, trail: string[] = []): TreeHighlight[] => {
    const out: TreeHighlight[] = trail.map((id, i) => ({
      nodeId: id,
      kind: i === trail.length - 1 ? 'current' : 'trail',
    }));
    if (currentId && !out.some((h) => h.nodeId === currentId)) {
      out.push({ nodeId: currentId, kind: 'current' });
    }
    return out;
  };

  yield makeTreeStep(toTreeNodes(), [], 1, `Search for ${target} in the binary search tree`, { target });

  let current: string | null = root;
  const trail: string[] = [];
  let iterations = 0;

  while (current && iterations++ < 100) {
    const node: PositionedBSTNode = byId.get(current)!;
    trail.push(current);
    yield makeTreeStep(
      toTreeNodes(),
      highlights(current, trail),
      2,
      `Visit node ${node.value}`,
      { current: node.value, visited: trail.length }
    );

    if (target === node.value) {
      yield makeTreeStep(
        toTreeNodes(),
        highlights(current, trail),
        4,
        `Found ${target}: current.value == target`,
        { current: node.value, found: true }
      );
      break;
    } else if (target < node.value) {
      yield makeTreeStep(
        toTreeNodes(),
        highlights(current, trail),
        6,
        `Target ${target} < ${node.value}: go left`,
        { current: node.value, go: 'left' }
      );
      if (node.left !== undefined) {
        current = node.left;
      } else {
        current = null;
      }
    } else {
      yield makeTreeStep(
        toTreeNodes(),
        highlights(current, trail),
        8,
        `Target ${target} > ${node.value}: go right`,
        { current: node.value, go: 'right' }
      );
      if (node.right !== undefined) {
        current = node.right;
      } else {
        current = null;
      }
    }
  }

  if (current === null) {
    const last = trail[trail.length - 1];
    yield makeTreeStep(
      toTreeNodes(),
      highlights(last, trail),
      10,
      `Reached a null child — ${target} is not present in the tree`,
      { found: false }
    );
  }
}

const bstSearchDef: AlgorithmDef = {
  id: 'ds-bst',
  name: 'Binary Search Tree',
  category: 'ds',
  description: 'Walks a binary search tree, using the ordering invariant to locate a target value in O(log n).',
  pseudocode,
  complexity: { time: 'O(log n) avg', space: 'O(h)' },
  defaultInput: { target: 40 },
  run: bstSearch,
  ops: [{ id: 'target', label: 'Target', needsValue: true }],
};

registerAlgorithm(bstSearchDef);
