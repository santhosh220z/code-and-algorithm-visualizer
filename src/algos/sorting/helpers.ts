import type { Step } from '../../core/types';

export type ArrayViz = Extract<Step['viz'], { type: 'array' }>;
export type ArrayHighlights = ArrayViz['highlights'];
export type ArrayPointers = ArrayViz['pointers'];
export interface LoopInfo {
  label: string;
  iteration: number;
}
export interface StackFrame {
  fn: string;
  args: Record<string, unknown>;
}

export function makeArrayStep(
  array: number[],
  highlights: ArrayHighlights,
  pointers: ArrayPointers,
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

export function highlightCompare(...indices: number[]): ArrayHighlights {
  return indices.map((index) => ({ index, kind: 'compare' as const }));
}

export function highlightSwap(...indices: number[]): ArrayHighlights {
  return indices.map((index) => ({ index, kind: 'swap' as const }));
}

export function highlightSorted(...indices: number[]): ArrayHighlights {
  return indices.map((index) => ({ index, kind: 'sorted' as const }));
}

export function highlightPivot(index: number): ArrayHighlights {
  return [{ index, kind: 'pivot' }];
}

export function highlightCurrent(index: number): ArrayHighlights {
  return [{ index, kind: 'current' }];
}

export function makePointer(index: number, label: string, color?: string): ArrayPointers[number] {
  return { index, label, color };
}