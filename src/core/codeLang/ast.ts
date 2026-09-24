/* AST node types for the miniPython teaching language. */

export type Expr =
  | { kind: 'num'; value: number; line: number }
  | { kind: 'str'; value: string; line: number }
  | { kind: 'bool'; value: boolean; line: number }
  | { kind: 'none'; line: number }
  | { kind: 'var'; name: string; line: number }
  | { kind: 'list'; items: Expr[]; line: number }
  | { kind: 'unary'; op: string; operand: Expr; line: number }
  | { kind: 'binary'; op: string; left: Expr; right: Expr; line: number }
  | { kind: 'call'; callee: Expr; args: Expr[]; line: number }
  | { kind: 'index'; target: Expr; index: Expr; line: number }
  | { kind: 'assignIndex'; target: Expr; index: Expr; value: Expr; line: number }
  | { kind: 'methodCall'; target: Expr; method: string; args: Expr[]; line: number };

export type Stmt =
  | { kind: 'assign'; target: Expr; value: Expr; line: number }
  | { kind: 'print'; args: Expr[]; line: number }
  | { kind: 'if'; branches: { cond: Expr; body: Stmt[]; line: number }[]; orelse: Stmt[]; line: number }
  | { kind: 'while'; cond: Expr; body: Stmt[]; line: number }
  | { kind: 'for'; varName: string; iterable: Expr; body: Stmt[]; line: number }
  | { kind: 'def'; name: string; params: string[]; body: Stmt[]; line: number }
  | { kind: 'return'; value: Expr | null; line: number }
  | { kind: 'expr'; value: Expr; line: number };

export interface MiniProgram {
  stmts: Stmt[];
  /** Functions declared in source, for loop-rail labeling. */
  loopLines: Set<number>;
  funcLines: Set<number>;
}
