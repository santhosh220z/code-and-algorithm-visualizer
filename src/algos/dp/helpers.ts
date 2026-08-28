import type { Step, TableCell, TableHighlight } from '../../core/types';

export interface LoopInfo {
  label: string;
  iteration: number;
}

export function makeTableStep(
  table: TableCell[][],
  highlights: TableHighlight[],
  line: number,
  description: string,
  vars?: Record<string, unknown>,
  loops?: LoopInfo[],
  stack?: { fn: string; args: Record<string, unknown> }[]
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
