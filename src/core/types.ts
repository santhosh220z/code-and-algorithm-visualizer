export type AlgorithmCategory = 'sorting' | 'search' | 'graph' | 'grid' | 'ds' | 'dp' | 'recursion';

export interface AlgorithmInput {
  array?: number[];
  size?: number;
  target?: number;
  [key: string]: unknown;
}

export interface Step {
  line?: number;
  description: string;
  vars?: Record<string, unknown>;
  loops?: { label: string; iteration: number }[];
  stack?: { fn: string; args: Record<string, unknown> }[];
  viz: VizPayload;
}

export type VizPayload =
  | { type: 'array'; array: number[]; highlights: ArrayHighlight[]; pointers: Pointer[] }
  | { type: 'graph'; nodes: GraphNode[]; edges: GraphEdge[]; highlights: GraphHighlight[] }
  | { type: 'grid'; grid: GridCell[][]; highlights: GridHighlight[]; path?: [number, number][] }
  | { type: 'tree'; nodes: TreeNode[]; highlights: TreeHighlight[] }
  | { type: 'list'; nodes: ListNode[]; highlights: ListHighlight[] }
  | { type: 'table'; table: TableCell[][]; highlights: TableHighlight[] }
  | { type: 'none' };

export interface ArrayHighlight {
  index: number;
  kind: 'compare' | 'swap' | 'sorted' | 'pivot' | 'current' | 'trail';
}

export interface Pointer {
  index: number;
  label: string;
  color?: string;
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
}

export interface GraphHighlight {
  nodeId?: string;
  edgeId?: string;
  kind: 'visit' | 'frontier' | 'relaxed' | 'path' | 'current';
}

export interface GridCell {
  row: number;
  col: number;
  type: 'empty' | 'wall' | 'start' | 'end' | 'weighted';
  weight?: number;
}

export interface GridHighlight {
  row: number;
  col: number;
  kind: 'visit' | 'frontier' | 'path' | 'current' | 'start' | 'end';
}

export interface TreeNode {
  id: string;
  value: number | string;
  x: number;
  y: number;
  left?: string;
  right?: string;
  parent?: string;
}

export interface TreeHighlight {
  nodeId: string;
  kind: 'visit' | 'insert' | 'delete' | 'search' | 'current' | 'trail';
}

export interface ListNode {
  id: string;
  value: number | string;
  next?: string;
  x: number;
  y: number;
}

export interface ListHighlight {
  nodeId: string;
  kind: 'visit' | 'insert' | 'delete' | 'current' | 'trail';
}

export interface TableCell {
  row: number;
  col: number;
  value: number | string;
  computed?: boolean;
}

export interface TableHighlight {
  row: number;
  col: number;
  kind: 'compute' | 'read' | 'result' | 'current';
}

export interface AlgorithmDef {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  pseudocode: PseudocodeLine[];
  complexity: { time: string; space: string };
  defaultInput: AlgorithmInput;
  run: (input: AlgorithmInput) => Generator<Step>;
}

export interface PseudocodeLine {
  text: string;
  indent: number;
  isLoopHeader?: boolean;
  loopLabel?: string;
}

export interface LoopScope {
  label: string;
  startLine: number;
  endLine: number;
  depth: number;
}

export interface ParsedPseudocode {
  lines: PseudocodeLine[];
  loops: LoopScope[];
}