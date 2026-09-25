import type {
  Step,
  ArrayHighlight,
  CallFrame,
  Pointer,
  PointerRole,
  SearchWindow,
  TableCell,
  TableHighlight,
} from './types';

export interface LoopInfo {
  label: string;
  iteration: number;
}

export interface StackFrame {
  fn: string;
  args: Record<string, unknown>;
}

export type ArrayViz = Extract<Step['viz'], { type: 'array' }>;
export type ArrayHighlights = ArrayViz['highlights'];
export type ArrayPointers = ArrayViz['pointers'];

export function makeArrayStep(
  array: number[],
  highlights: ArrayHighlight[],
  pointers: Pointer[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[],
  stack?: StackFrame[]
): Step {
  return {
    line,
    description,
    vars,
    loops,
    stack,
    viz: { type: 'array', array: [...array], highlights, pointers },
  };
}

export function makeCallStackStep(
  frames: CallFrame[],
  currentId: string | null,
  result: number | undefined,
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  stack?: StackFrame[]
): Step {
  return {
    line,
    description,
    vars,
    loops: [],
    stack,
    // snapshot each step so earlier frames never mutate under the player
    viz: { type: 'callstack', frames: frames.map((frame) => ({ ...frame })), currentId, result },
  };
}

export function makeSearchStep(
  array: number[],
  highlights: ArrayHighlight[],
  window: SearchWindow | null,
  found: number | null,
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[]
): Step {
  return {
    line,
    description,
    vars,
    loops,
    viz: { type: 'search', array: [...array], highlights, window, found },
  };
}

export function highlightCompare(...indices: number[]): ArrayHighlight[] {
  return indices.map((index) => ({ index, kind: 'compare' as const }));
}

export function highlightSwap(...indices: number[]): ArrayHighlight[] {
  return indices.map((index) => ({ index, kind: 'swap' as const }));
}

export function highlightSorted(...indices: number[]): ArrayHighlight[] {
  return indices.map((index) => ({ index, kind: 'sorted' as const }));
}

export function highlightPivot(index: number): ArrayHighlight[] {
  return [{ index, kind: 'pivot' }];
}

export function highlightCurrent(index: number): ArrayHighlight[] {
  return [{ index, kind: 'current' }];
}

export function makePointer(index: number, label: string, role: PointerRole = 'primary'): Pointer {
  return { index, label, role };
}

export function frame(fn: string, args: Record<string, unknown>): StackFrame {
  return { fn, args };
}

export function makeTableStep(
  table: TableCell[][],
  highlights: TableHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[],
  stack?: StackFrame[]
): Step {
  return { line, description, vars, loops, stack, viz: { type: 'table', table, highlights } };
}

export function tableCell(row: number, col: number, value: number | string, computed = false): TableCell {
  return { row, col, value, computed };
}

export function tableCompute(row: number, col: number): TableHighlight {
  return { row, col, kind: 'compute' };
}

export function tableRead(row: number, col: number): TableHighlight {
  return { row, col, kind: 'read' };
}

export function tableResult(row: number, col: number): TableHighlight {
  return { row, col, kind: 'result' };
}