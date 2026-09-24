import type { Expr, MiniProgram, Stmt } from './ast';
import { LangError, tokenize, type Token } from './lexer';

class Parser {
  private pos = 0;
  private readonly toks: Token[];

  constructor(toks: Token[]) {
    this.toks = toks;
  }

  private peek(offset = 0): Token {
    return this.toks[Math.min(this.pos + offset, this.toks.length - 1)];
  }

  private next(): Token {
    const t = this.toks[this.pos];
    if (this.pos < this.toks.length - 1) this.pos++;
    return t;
  }

  private at(kind: Token['kind'], value?: string): boolean {
    const t = this.peek();
    return t.kind === kind && (value === undefined || t.value === value);
  }

  private eat(kind: Token['kind'], value?: string): boolean {
    if (this.at(kind, value)) {
      this.next();
      return true;
    }
    return false;
  }

  private expect(kind: Token['kind'], value?: string): Token {
    if (!this.at(kind, value)) {
      const t = this.peek();
      const got = t.kind === 'newline' ? 'end of line' : `'${t.value || t.kind}'`;
      throw new LangError(`expected ${value ? `'${value}'` : kind}, got ${got}`, t.line);
    }
    return this.next();
  }

  private skipNewlines(): void {
    while (this.at('newline')) this.next();
  }

  private skipLineEnd(): void {
    this.eat('newline');
    this.skipNewlines();
  }

  parseProgram(): MiniProgram {
    const stmts: Stmt[] = [];
    const loopLines = new Set<number>();
    const funcLines = new Set<number>();
    this.collect(stmts, loopLines, funcLines, false);
    this.skipNewlines();
    if (!this.at('eof')) {
      const t = this.peek();
      throw new LangError(`unexpected '${t.value}'`, t.line);
    }
    return { stmts, loopLines, funcLines };
  }

  /** Parse statements until dedent (when inBlock) or eof. */
  private collect(out: Stmt[], loopLines: Set<number>, funcLines: Set<number>, inBlock: boolean): void {
    for (;;) {
      this.skipNewlines();
      if (this.at('eof')) return;
      if (inBlock && this.at('dedent')) return;
      out.push(this.statement(loopLines, funcLines));
    }
  }

  private statement(loopLines: Set<number>, funcLines: Set<number>): Stmt {
    const t = this.peek();

    if (t.kind === 'name') {
      switch (t.value) {
        case 'if':
          return this.ifStmt(loopLines, funcLines);
        case 'while':
          return this.whileStmt(loopLines, funcLines);
        case 'for':
          return this.forStmt(loopLines, funcLines);
        case 'def':
          return this.defStmt(loopLines, funcLines);
        case 'return':
          return this.returnStmt();
      }
    }

    // Otherwise: expression or assignment
    return this.simpleStatement();
  }

  private ifStmt(loopLines: Set<number>, funcLines: Set<number>): Stmt {
    const line = this.expect('name', 'if').line;
    const branches: { cond: Expr; body: Stmt[]; line: number }[] = [];

    let cond = this.expression();
    this.expect('op', ':');
    const body = this.block(loopLines, funcLines);
    branches.push({ cond, body, line });

    let orelse: Stmt[] = [];
    this.skipNewlines();
    if (this.at('name', 'elif')) {
      // Rewrite elif as a nested if in the else branch
      const elifStmt = this.ifStmt(loopLines, funcLines);
      orelse = [elifStmt];
    } else if (this.at('name', 'else')) {
      this.next();
      this.expect('op', ':');
      orelse = this.block(loopLines, funcLines);
    }

    return { kind: 'if', branches, orelse, line };
  }

  private whileStmt(loopLines: Set<number>, funcLines: Set<number>): Stmt {
    const line = this.expect('name', 'while').line;
    loopLines.add(line);
    const cond = this.expression();
    this.expect('op', ':');
    const body = this.block(loopLines, funcLines);
    return { kind: 'while', cond, body, line };
  }

  private forStmt(loopLines: Set<number>, funcLines: Set<number>): Stmt {
    const line = this.expect('name', 'for').line;
    loopLines.add(line);
    const name = this.expect('name').value;
    this.expect('name', 'in');
    const iterable = this.expression();
    this.expect('op', ':');
    const body = this.block(loopLines, funcLines);
    return { kind: 'for', varName: name, iterable, body, line };
  }

  private defStmt(loopLines: Set<number>, funcLines: Set<number>): Stmt {
    const line = this.expect('name', 'def').line;
    funcLines.add(line);
    const name = this.expect('name').value;
    this.expect('op', '(');
    const params: string[] = [];
    while (!this.at('op', ')')) {
      params.push(this.expect('name').value);
      if (!this.eat('op', ',')) break;
    }
    this.expect('op', ')');
    this.expect('op', ':');
    const body = this.block(loopLines, funcLines);
    return { kind: 'def', name, params, body, line };
  }

  private returnStmt(): Stmt {
    const line = this.expect('name', 'return').line;
    let value: Expr | null = null;
    if (!this.at('newline') && !this.at('eof')) {
      value = this.expression();
    }
    this.skipLineEnd();
    return { kind: 'return', value, line };
  }

  private block(loopLines: Set<number>, funcLines: Set<number>): Stmt[] {
    this.skipNewlines();
    if (this.at('indent')) {
      this.next();
      const body: Stmt[] = [];
      this.collect(body, loopLines, funcLines, true);
      this.eat('dedent');
      return body;
    }
    // Single-line body: `if x: print(1)`
    const body: Stmt[] = [];
    this.collect(body, loopLines, funcLines, false);
    return body;
  }

  private simpleStatement(): Stmt {
    const line = this.peek().line;

    // print(...) — a call statement
    if (this.at('name', 'print')) {
      this.next();
      this.expect('op', '(');
      const args: Expr[] = [];
      if (!this.at('op', ')')) {
        args.push(this.expression());
        while (this.eat('op', ',')) {
          if (this.at('op', ')')) break;
          args.push(this.expression());
        }
      }
      this.expect('op', ')');
      this.skipLineEnd();
      return { kind: 'print', args, line };
    }

    const first = this.expression();

    // Assignment or compound assignment
    if (this.at('op', '=') || this.at('op', '+=') || this.at('op', '-=') || this.at('op', '*=') || this.at('op', '/=')) {
      const op = this.next().value;
      const value = this.expression();
      this.skipLineEnd();
      if (op === '=') {
        return { kind: 'assign', target: first, value, line };
      }
      // Compound: target = target <op> value  →  desugar
      const binOp = op.slice(0, op.length - 1);
      const combined: Expr = { kind: 'binary', op: binOp, left: first, right: value, line };
      return { kind: 'assign', target: first, value: combined, line };
    }

    this.skipLineEnd();
    return { kind: 'expr', value: first, line };
  }

  /* ----------------------------- Expressions ------------------------------ */

  private expression(): Expr {
    return this.orExpr();
  }

  private orExpr(): Expr {
    let left = this.andExpr();
    while (this.at('name', 'or')) {
      const line = this.next().line;
      const right = this.andExpr();
      left = { kind: 'binary', op: 'or', left, right, line };
    }
    return left;
  }

  private andExpr(): Expr {
    let left = this.notExpr();
    while (this.at('name', 'and')) {
      const line = this.next().line;
      const right = this.notExpr();
      left = { kind: 'binary', op: 'and', left, right, line };
    }
    return left;
  }

  private notExpr(): Expr {
    if (this.at('name', 'not')) {
      const line = this.next().line;
      const operand = this.notExpr();
      return { kind: 'unary', op: 'not', operand, line };
    }
    return this.comparison();
  }

  private comparison(): Expr {
    let left = this.additive();
    for (;;) {
      const t = this.peek();
      if (t.kind === 'op' && ['==', '!=', '<', '<=', '>', '>='].includes(t.value)) {
        const line = this.next().line;
        const right = this.additive();
        left = { kind: 'binary', op: t.value, left, right, line };
        continue;
      }
      if (t.kind === 'name' && (t.value === 'in' || t.value === 'not')) {
        const line = this.next().line;
        if (t.value === 'not') {
          this.expect('name', 'in');
          const right = this.additive();
          left = { kind: 'unary', op: 'not', operand: { kind: 'binary', op: 'in', left, right, line }, line };
        } else {
          const right = this.additive();
          left = { kind: 'binary', op: 'in', left, right, line };
        }
        continue;
      }
      return left;
    }
  }

  private additive(): Expr {
    let left = this.multiplicative();
    for (;;) {
      const t = this.peek();
      if (t.kind === 'op' && ['+', '-'].includes(t.value)) {
        const line = this.next().line;
        const right = this.multiplicative();
        left = { kind: 'binary', op: t.value, left, right, line };
        continue;
      }
      return left;
    }
  }

  private multiplicative(): Expr {
    let left = this.unary();
    for (;;) {
      const t = this.peek();
      if (t.kind === 'op' && ['*', '/', '//', '%'].includes(t.value)) {
        const line = this.next().line;
        const right = this.unary();
        left = { kind: 'binary', op: t.value, left, right, line };
        continue;
      }
      return left;
    }
  }

  private unary(): Expr {
    const t = this.peek();
    if (t.kind === 'op' && (t.value === '-' || t.value === '+')) {
      const line = this.next().line;
      const operand = this.unary();
      return { kind: 'unary', op: t.value, operand, line };
    }
    return this.postfix();
  }

  private postfix(): Expr {
    let expr = this.primary();
    for (;;) {
      if (this.at('op', '[')) {
        const line = this.next().line;
        const index = this.expression();
        this.expect('op', ']');
        if (this.at('op', '=')) {
          this.next();
          const value = this.expression();
          expr = { kind: 'assignIndex', target: expr, index, value, line };
        } else {
          expr = { kind: 'index', target: expr, index, line };
        }
        continue;
      }
      if (this.at('op', '.')) {
        const line = this.next().line;
        const method = this.expect('name').value;
        this.expect('op', '(');
        const args: Expr[] = [];
        if (!this.at('op', ')')) {
          args.push(this.expression());
          while (this.eat('op', ',')) {
            if (this.at('op', ')')) break;
            args.push(this.expression());
          }
        }
        this.expect('op', ')');
        expr = { kind: 'methodCall', target: expr, method, args, line };
        continue;
      }
      return expr;
    }
  }

  private primary(): Expr {
    const t = this.peek();

    if (t.kind === 'num') {
      this.next();
      return { kind: 'num', value: t.num ?? Number(t.value), line: t.line };
    }
    if (t.kind === 'str') {
      this.next();
      return { kind: 'str', value: t.value, line: t.line };
    }
    if (t.kind === 'op' && t.value === '(') {
      this.next();
      const inner = this.expression();
      this.expect('op', ')');
      return inner;
    }
    if (t.kind === 'op' && t.value === '[') {
      this.next();
      const items: Expr[] = [];
      if (!this.at('op', ']')) {
        items.push(this.expression());
        while (this.eat('op', ',')) {
          if (this.at('op', ']')) break;
          items.push(this.expression());
        }
      }
      this.expect('op', ']');
      return { kind: 'list', items, line: t.line };
    }
    if (t.kind === 'name') {
      if (t.value === 'True' || t.value === 'False') {
        this.next();
        return { kind: 'bool', value: t.value === 'True', line: t.line };
      }
      if (t.value === 'None') {
        this.next();
        return { kind: 'none', line: t.line };
      }
      this.next();
      // Bare identifier call: range(...), len(...), print handled separately
      if (this.at('op', '(')) {
        this.next();
        const args: Expr[] = [];
        if (!this.at('op', ')')) {
          args.push(this.expression());
          while (this.eat('op', ',')) {
            if (this.at('op', ')')) break;
            args.push(this.expression());
          }
        }
        this.expect('op', ')');
        return { kind: 'call', callee: { kind: 'var', name: t.value, line: t.line }, args, line: t.line };
      }
      return { kind: 'var', name: t.value, line: t.line };
    }

    const got = t.kind === 'newline' ? 'end of line' : `'${t.value || t.kind}'`;
    throw new LangError(`expected an expression, got ${got}`, t.line);
  }
}

export function parse(src: string): MiniProgram {
  return new Parser(tokenize(src)).parseProgram();
}
