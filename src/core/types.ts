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

/* ---------------------------------- Array --------------------------------- */

export interface ArrayHighlight {
  index: number;
  kind: 'compare' | 'swap' | 'sorted' | 'pivot' | 'current' | 'trail';
}

export interface Pointer {
  index: number;
  label: string;
  color?: string;
}

/* ---------------------------------- Graph --------------------------------- */

/** Base graph data — lives in player input, edited by tools, never copied into steps. */
export interface GraphNodeBase {
  id: string;
  /** Normalized coordinates in a 0–100 space. */
  x: number;
  y: number;
}

export interface GraphEdgeBase {
  from: string;
  to: string;
  weight: number;
}

export interface GraphInputData {
  nodes: GraphNodeBase[];
  edges: GraphEdgeBase[];
  directed: boolean;
  weighted: boolean;
  startId: string;
  endId: string;
}

export type NodeHighlightKind = 'current' | 'frontier' | 'visited' | 'path';

export interface GraphNodeHighlight {
  id: string;
  kind: NodeHighlightKind;
  /** Live distance / g-score label rendered under the node. */
  dist?: number | null;
}

export type EdgeHighlightKind = 'comparing' | 'relaxed' | 'path';

export interface GraphEdgeHighlight {
  from: string;
  to: string;
  kind: EdgeHighlightKind;
}

/* ----------------------------------- Grid ---------------------------------- */

export interface GridInputData {
  rows: number;
  cols: number;
  /** "r,c" keys of wall cells. */
  walls: string[];
  /** "r,c" -> traversal cost for non-wall cells (default 1). */
  weights: Record<string, number>;
  start: [number, number];
  end: [number, number];
}

export interface DPInputData {
  dpTableInfo?: DPTableInfo;
  [key: string]: unknown;
}

export type GridHighlightKind = 'current' | 'frontier' | 'visited' | 'path';

export interface GridHighlight {
  row: number;
  col: number;
  kind: GridHighlightKind;
  /** g-score label for Dijkstra/A*. */
  g?: number;
}

/* ------------------------------ Step payloads ----------------------------- */

export type VizPayload =
  | { type: 'array'; array: number[]; highlights: ArrayHighlight[]; pointers: Pointer[] }
  | { type: 'graph'; highlights: GraphNodeHighlight[]; edgeHighlights: GraphEdgeHighlight[] }
  | { type: 'grid'; highlights: GridHighlight[] }
  | { type: 'tree'; nodes: TreeNode[]; highlights: TreeHighlight[] }
  | { type: 'list'; nodes: ListNode[]; highlights: ListHighlight[] }
  | { type: 'table'; table: TableCell[][]; highlights: TableHighlight[] }
  | { type: 'hanoi'; pegs: HanoiPegs; highlights: HanoiHighlight[]; moving: HanoiMovingDisk | null }
  | { type: 'none' };

/* --------------------- Reserved for later milestones ---------------------- */

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

/** Disks per peg, ordered from bottom (index 0) to top. */
export type HanoiPegs = Record<'A' | 'B' | 'C', number[]>;

export interface HanoiHighlight {
  peg: 'A' | 'B' | 'C';
  disk: number;
  kind: 'moving' | 'settled';
}

/** An in-flight disk lifted above the pegs while it travels. Coordinates are SVG units. */
export interface HanoiMovingDisk {
  disk: number;
  x: number;
  y: number;
}

/* -------------------------------- Registry -------------------------------- */

export interface AlgorithmOp {
  id: string;
  label: string;
  needsValue?: boolean;
}

export interface DPTableInfo {
  rowLabels?: string[];
  colLabels?: string[];
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
  ops?: AlgorithmOp[];
  dpTableInfo?: DPTableInfo;
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