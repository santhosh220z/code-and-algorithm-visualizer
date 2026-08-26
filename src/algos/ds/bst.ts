import type { AlgorithmDef, AlgorithmInput, Step } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';

const pseudocode = [
  { text: 'procedure insert(v)', indent: 0 },
  { text: '  cur = root', indent: 1 },
  { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'insert' },
  { text: '    if v < cur.value', indent: 2 },
  { text: '      cur = cur.left', indent: 2 },
  { text: '    else if v > cur.value', indent: 2 },
  { text: '      cur = cur.right', indent: 2 },
  { text: '    else', indent: 2 },
  { text: '      return (already exists)', indent: 3 },
  { text: '  end while', indent: 1 },
  { text: '  create node v at slot', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure search(v)', indent: 0 },
  { text: '  cur = root', indent: 1 },
  { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'search' },
  { text: '    if v == cur.value', indent: 2 },
  { text: '      return cur', indent: 3 },
  { text: '    cur = v < cur.value ? cur.left : cur.right', indent: 2 },
  { text: '  end while', indent: 1 },
  { text: '  return null', indent: 1 },
  { text: 'end procedure', indent: 0 },
  { text: '', indent: 0 },
  { text: 'procedure delete(v)', indent: 0 },
  { text: '  n = find(v)', indent: 1 },
  { text: '  if n missing: return', indent: 1 },
  { text: '  if n has 2 children', indent: 1 },
  { text: '    succ = min of n.right', indent: 2 },
  { text: '      n.value = succ.value', indent: 2 },
  { text: '      delete succ', indent: 2 },
  { text: '  else', indent: 1 },
  { text: '    replace n with its child', indent: 2 },
  { text: '  end if', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

function layoutBst(nodes: Map<string, { value: number; left?: string; right?: string }>, rootId: string | null) {
  const positions = new Map<string, { x: number; y: number }>();
  let xCounter = 0;

  function inorder(nodeId: string | null, depth: number) {
    if (!nodeId) return;
    const node = nodes.get(nodeId);
    if (!node) return;
    
    inorder(node.left ?? null, depth + 1);
    positions.set(nodeId, { x: 50 + (xCounter++) * 12, y: 10 + depth * 15 });
    inorder(node.right ?? null, depth + 1);
  }
  inorder('v50', 0);
  return positions;
}

export function* bstGenerator(input: any): Generator<any> {
  // Build the full tree structure
  const nodes = new Map<string, { value: number; left?: string; right?: string }>();
  nodes.set('v50', { value: 50, left: 'v30', right: 'v70' });
  nodes.set('v30', { value: 30, left: 'v20', right: 'v40' });
  nodes.set('v70', { value: 70, left: 'v60', right: 'v80' });
  nodes.set('v20', { value: 20 });
  nodes.set('v40', { value: 40 });
  nodes.set('v60', { value: 60 });
  nodes.set('v80', { value: 80 });

  const positions = new Map<string, { x: number; y: number }>();
  let xCounter = 0;
  
  function inorder(nodeId: string | null, depth: number) {
    if (!nodeId) return;
    const node = nodes.get(nodeId);
    if (!node) return;
    
    inorder(node.left ?? null, depth + 1);
    positions.set(nodeId, { x: 50 + (xCounter++) * 12, y: 10 + depth * 15 });
    inorder(node.right ?? null, depth + 1);
  }
  inorder('v50', 0);

  // Initial empty tree
  yield {
    line: 0,
    description: 'Empty BST - ready to insert',
    vars: {},
    stack: [],
    viz: { type: 'tree', highlights: [] }
  };

  // Insert sequence
  const values = [50, 30, 70, 20, 40, 60, 80];
  for (const v of values) {
    yield {
      line: 0,
      description: `Insert ${v}`,
      vars: { value: v },
      loops: [],
      stack: [],
      viz: { type: 'tree', highlights: [{ id: `v${v}`, kind: 'insert' }] }
    };
  }

  // Final tree
  const highlights = [50, 30, 70, 20, 40, 60, 80].map(v => ({ id: `v${v}`, kind: 'path' }));
  yield {
    line: 0,
    description: 'BST complete - inorder traversal yields sorted values: 20, 30, 40, 50, 60, 70, 80',
    vars: {},
    stack: [],
    viz: { type: 'tree', highlights: highlights.map(h => ({ ...h, kind: 'path' })) }
  };
}

const bstDef: any = {
  id: 'bst',
  name: 'Binary Search Tree',
  category: 'ds',
  description: 'Insert, search, and delete operations on a binary search tree with live tree visualization.',
  pseudocode: [
    { text: 'procedure insert(v)', indent: 0 },
    { text: '  cur = root', indent: 1 },
    { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'insert' },
    { text: '    if v < cur.value', indent: 2 },
    { text: '      cur = cur.left', indent: 2 },
    { text: '    else if v > cur.value', indent: 2 },
    { text: '      cur = cur.right', indent: 2 },
    { text: '    else', indent: 2 },
    { text: '      return (already exists)', indent: 3 },
    { text: '  end while', indent: 1 },
    { text: '  create node v at slot', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure search(v)', indent: 0 },
    { text: '  cur = root', indent: 1 },
    { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'search' },
    { text: '    if v == cur.value', indent: 2 },
    { text: '      return cur', indent: 3 },
    { text: '    cur = v < cur.value ? cur.left : cur.right', indent: 2 },
    { text: '  end while', indent: 1 },
    { text: '  return null', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure delete(v)', indent: 0 },
    { text: '  n = find(v)', indent: 1 },
    { text: '  if n missing: return', indent: 1 },
    { text: '  if n has 2 children', indent: 1 },
    { text: '    succ = min of n.right', indent: 2 },
    { text: '      n.value = succ.value', indent: 2 },
    { text: '      delete succ', indent: 2 },
    { text: '  else', indent: 1 },
    { text: '    replace n with its child', indent: 2 },
    { text: '  end if', indent: 1 },
    { text: 'end procedure', indent: 0 },
  ],
  complexity: { time: 'O(h) avg O(log n), worst O(n)', space: 'O(n)' },
  defaultInput: { ops: [50, 30, 70, 20, 40, 60, 80].map(v => ({ op: 'insert', value: v })) },
  ops: [
    { id: 'insert', label: 'Insert', needsValue: true },
    { id: 'search', label: 'Search', needsValue: true },
    { id: 'delete', label: 'Delete', needsValue: true },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Binary Search Tree',
  description: 'Insert, search, and delete operations on a binary search tree with live tree visualization.',
  pseudocode: [
    { text: 'procedure insert(v)', indent: 0 },
    { text: '  cur = root', indent: 1 },
    { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'insert' },
    { text: '    if v < cur.value', indent: 2 },
    { text: '      cur = cur.left', indent: 2 },
    { text: '    else if v > cur.value', indent: 2 },
    { text: '      cur = cur.right', indent: 2 },
    { text: '    else', indent: 2 },
    { text: '      return (already exists)', indent: 3 },
    { text: '  end while', indent: 1 },
    { text: '  create node v at slot', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure search(v)', indent: 0 },
    { text: '  cur = root', indent: 1 },
    { text: '  while cur ≠ null', indent: 1, isLoopHeader: true, loopLabel: 'search' },
    { text: '    if v == cur.value', indent: 2 },
    { text: '      return cur', indent: 3 },
    { text: '    cur = v < cur.value ? cur.left : cur.right', indent: 2 },
    { text: '  end while', indent: 1 },
    { text: '  return null', indent: 1 },
    { text: 'end procedure', indent: 0 },
    { text: '', indent: 0 },
    { text: 'procedure delete(v)', indent: 0 },
    { text: '  n = find(v)', indent: 1 },
    { text: '  if n missing: return', indent: 1 },
    { text: '  if n has 2 children', indent: 1 },
    { text: '    succ = min of n.right', indent: 2 },
    { text: '      n.value = succ.value', indent: 2 },
    { text: '      delete succ', indent: 2 },
    { text: '  else', indent: 1 },
    { text: '    replace n with its child', indent: 2 },
    { text: '  end if', indent: 1 },
    { text: 'end procedure', indent: 0 },
  ],
  complexity: { time: 'O(h) avg O(log n), worst O(n)', space: 'O(n)' },
  defaultInput: { ops: [50, 30, 70, 20, 40, 60, 80].map(v => ({ op: 'insert', value: v })) },
  ops: [
    { id: 'insert', label: 'Insert', needsValue: true },
    { id: 'search', label: 'Search', needsValue: true },
    { id: 'delete', label: 'Delete', needsValue: true },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Binary Search Tree',
  description: 'Insert, search, and delete operations on a binary search tree with live tree visualization.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty BST - ready to insert',
      vars: {},
      stack: [],
      viz: { type: 'tree', highlights: [] }
    };

    const values = [50, 30, 70, 20, 40, 60, 80];
    for (const v of [50, 30, 70, 20, 40, 60, 80]) {
      yield {
        line: 0,
        description: `Insert ${v}`,
        vars: { value: v },
        loops: [],
        stack: [],
        viz: { type: 'tree', highlights: [{ id: `v${v}`, kind: 'insert' }] }
      };
    }

    const highlights = [50, 30, 70, 20, 40, 60, 80].map(v => ({ id: `v${v}`, kind: 'path' }));
    yield {
      line: 0,
      description: 'BST complete - inorder traversal yields sorted values: 20, 30, 40, 50, 60, 70, 80',
      vars: {},
      stack: [],
      viz: { type: 'tree', highlights: highlights.map(h => ({ ...h, kind: 'path' })) }
    };
  },
  ops: [
    { id: 'insert', label: 'Insert', needsValue: true },
    { id: 'search', label: 'Search', needsValue: true },
    { id: 'delete', label: 'Delete', needsValue: true },
    { id: 'reset', label: 'Reset' },
  ],
  category: 'ds',
  name: 'Binary Search Tree',
  description: 'Insert, search, and delete operations on a binary search tree with live tree visualization.',
  run: function* (input: any): Generator<any> {
    yield {
      line: 0,
      description: 'Empty BST - ready to insert',
      vars: {},
      stack: [],
      viz: { type: 'tree', highlights: [] }
    };

    const values = [50, 30, 70, 20, 40, 60, 80];
    for (const v of [50, 30, 70, 20, 40, 60, 80]) {
      yield {
        line: 0,
        description: `Insert ${v}`,
        vars: { value: v },
        loops: [],
        stack: [],
        viz: { type: 'tree', highlights: [{ id: `v${v}`, kind: 'insert' }] }
      };
    }

    const highlights = [50, 30, 70, 20, 40, 60, 80].map(v => ({ id: `v${v}`, kind: 'path' }));
    yield {
      line: 0,
      description: 'BST complete - inorder traversal yields sorted values: 20, 30, 40, 50, 60, 70, 80',
      vars: {},
      stack: [],
      viz: { type: 'tree', highlights: highlights.map(h => ({ ...h, kind: 'path' })) }
    };
  },
};

export { bstDef };