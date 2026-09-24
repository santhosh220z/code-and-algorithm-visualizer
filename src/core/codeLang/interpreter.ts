import type { Expr, Stmt } from './ast';
import { parse } from './parser';
import { LangError } from './lexer';
import { toStepLine } from './toPseudocode';
import type { ArrayHighlight, Step } from '../types';

export type PyValue = number | string | boolean | null | PyValue[];

interface Frame {
  name: string;
  args: Record<string, PyValue>;
}

interface LoopCtx {
  label: string;
  iteration: number;
}

interface FuncDef {
  params: string[];
  body: Stmt[];
  line: number;
}

class ReturnSignal {
  readonly value: PyValue;
  constructor(value: PyValue) {
    this.value = value;
  }
}

class StopSignal extends Error {}

/** Thrown by `break`; caught by the nearest enclosing loop only. */
class BreakSignal extends Error {
  readonly atLine: number;
  constructor(atLine: number) {
    super('break');
    this.atLine = atLine;
  }
}

/** Thrown by `continue`; caught by the nearest enclosing loop only. */
class ContinueSignal extends Error {
  readonly atLine: number;
  constructor(atLine: number) {
    super('continue');
    this.atLine = atLine;
  }
}

export interface InterpretResult {
  steps: Step[];
  truncated: boolean;
  error: string | null;
  errorLine: number | null;
  loopLines: Set<number>;
  funcLines: Set<number>;
}

const MAX_STEPS = 5000;
const MAX_CALL_DEPTH = 200;

/**
 * Interpret miniPython source into a flat list of playback steps.
 * Emits one step per executed statement, tagged with the (0-based) source line
 * so the code panel highlights the right row.
 */
export function interpretSource(src: string): InterpretResult {
  let program;
  try {
    program = parse(src);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error';
    return {
      steps: [{ line: 0, description: msg, vars: {}, viz: { type: 'none' } }],
      truncated: false,
      error: msg,
      errorLine: e instanceof LangError ? e.line : null,
      loopLines: new Set(),
      funcLines: new Set(),
    };
  }

  const steps: Step[] = [];
  const consoleLines: string[] = [];
  const scopes: Record<string, PyValue>[] = [{}];
  const stack: Frame[] = [];
  const loops: LoopCtx[] = [];
  const funcs = new Map<string, FuncDef>();
  const arrayRefs = new Map<PyValue[], string>();
  /** The list element most recently read or written, highlighted in the viz. */
  const active: { array: PyValue[] | null; index: number; kind: ArrayHighlight['kind'] } = {
    array: null,
    index: -1,
    kind: 'current',
  };
  const touch = (arr: PyValue[], index: number, kind: ArrayHighlight['kind']): void => {
    active.array = arr;
    active.index = index;
    active.kind = kind;
  };
  let truncated = false;
  let error: string | null = null;
  let errorLine: number | null = null;

  /* ----------------------------- Value helpers ---------------------------- */

  const toDisplay = (v: PyValue): unknown => (Array.isArray(v) ? v.map(toDisplay) : v);
  const toNum = (v: PyValue): number => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : 0);
  const truthy = (v: PyValue): boolean => (Array.isArray(v) ? v.length > 0 : Boolean(v));

  const format = (v: PyValue): string => {
    if (typeof v === 'string') return v;
    if (v === null) return 'None';
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (Array.isArray(v)) return `[${v.map(format).join(', ')}]`;
    return String(v);
  };

  const compare = (a: PyValue, b: PyValue): number => {
    if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0;
    return toNum(a) - toNum(b);
  };

  const snapshotVars = (): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const scope of scopes) for (const [k, v] of Object.entries(scope)) out[k] = toDisplay(v);
    return out;
  };

  const pickViz = (): Step['viz'] => {
    if (arrayRefs.size === 0) return { type: 'none' };
    const arr = [...arrayRefs.keys()].pop();
    if (!arr || arr.length === 0) return { type: 'none' };
    const highlights =
      active.array === arr && active.index >= 0 && active.index < arr.length
        ? [{ index: active.index, kind: active.kind }]
        : [];
    return { type: 'array', array: arr.map(toNum), highlights, pointers: [] };
  };

  const emit = (line: number, description: string): void => {
    steps.push({
      line: toStepLine(line),
      description,
      vars: snapshotVars(),
      loops: loops.length > 0 ? loops.map((l) => ({ label: l.label, iteration: l.iteration })) : undefined,
      stack: stack.length > 0 ? stack.map((f) => ({ fn: f.name, args: { ...f.args } })) : undefined,
      console: consoleLines.length > 0 ? [...consoleLines] : undefined,
      viz: pickViz(),
    });
  };

  /* ------------------------------- Scoping -------------------------------- */

  const lookup = (name: string): PyValue | undefined => {
    for (let i = scopes.length - 1; i >= 0; i--) if (name in scopes[i]) return scopes[i][name];
    return undefined;
  };
  const assign = (name: string, value: PyValue): void => {
    scopes[scopes.length - 1][name] = value;
  };

  /* ----------------------------- Builtins --------------------------------- */

  const applyBinary = (op: string, l: PyValue, r: PyValue, line: number): PyValue => {
    switch (op) {
      case '+':
        if (typeof l === 'string' || typeof r === 'string') return format(l) + format(r);
        if (Array.isArray(l) && Array.isArray(r)) return [...l, ...r];
        return toNum(l) + toNum(r);
      case '-':
        return toNum(l) - toNum(r);
      case '*':
        return toNum(l) * toNum(r);
      case '/': {
        const d = toNum(r);
        if (d === 0) throw new LangError('division by zero', line);
        return toNum(l) / d;
      }
      case '//': {
        const d = toNum(r);
        if (d === 0) throw new LangError('division by zero', line);
        return Math.floor(toNum(l) / d);
      }
      case '%': {
        const d = toNum(r);
        if (d === 0) throw new LangError('division by zero', line);
        return ((toNum(l) % d) + d) % d;
      }
      case '==':
        if (Array.isArray(l) && Array.isArray(r)) return format(l) === format(r);
        return l === r;
      case '!=':
        return l !== r;
      case '<':
        return compare(l, r) < 0;
      case '<=':
        return compare(l, r) <= 0;
      case '>':
        return compare(l, r) > 0;
      case '>=':
        return compare(l, r) >= 0;
      default:
        throw new LangError(`operator '${op}' is not supported yet`, line);
    }
  };

  const rangeValues = (args: PyValue[], line: number): PyValue[] => {
    const start = args.length > 1 ? toNum(args[0]) : 0;
    const stop = args.length > 1 ? toNum(args[1]) : toNum(args[0]);
    const step = args.length > 2 ? toNum(args[2]) : 1;
    if (step === 0) throw new LangError('range() step cannot be zero', line);
    const out: PyValue[] = [];
    if (step > 0) for (let i = start; i < stop; i += step) out.push(i);
    else for (let i = start; i > stop; i += step) out.push(i);
    return out;
  };

  const callBuiltin = (name: string, args: PyValue[], line: number): PyValue => {
    switch (name) {
      case 'range':
        return rangeValues(args, line);
      case 'len':
        return Array.isArray(args[0]) ? args[0].length : typeof args[0] === 'string' ? args[0].length : 0;
      case 'str':
        return format(args[0]);
      case 'int':
        return Math.trunc(toNum(args[0]));
      case 'float':
        return toNum(args[0]);
      case 'abs':
        return Math.abs(toNum(args[0]));
      case 'min':
        return args.length === 0 ? null : args.reduce((a, b) => (compare(a, b) <= 0 ? a : b));
      case 'max':
        return args.length === 0 ? null : args.reduce((a, b) => (compare(a, b) >= 0 ? a : b));
      case 'sum': {
        const list = Array.isArray(args[0]) ? args[0] : [];
        let total = 0;
        for (const item of list) total += toNum(item);
        return total;
      }
      case 'round':
        return Math.round(toNum(args[0]));
      case 'sqrt':
        return Math.sqrt(toNum(args[0]));
      case 'input':
        return '';
      default:
        throw new LangError(`'${name}' is not supported yet`, line);
    }
  };

  /* ------------------------------ Functions -------------------------------- */

  function callFunction(name: string, args: PyValue[], line: number): PyValue {
    const fn = funcs.get(name);
    if (!fn) throw new LangError(`function '${name}' is not defined`, line);
    if (stack.length >= MAX_CALL_DEPTH) throw new LangError(`maximum call depth of ${MAX_CALL_DEPTH} exceeded`, line);

    const frame: Frame = { name, args: {} };
    fn.params.forEach((p, i) => {
      frame.args[p] = args[i] ?? null;
    });
    stack.push(frame);
    scopes.push({ ...frame.args });
    emit(line, `Call ${name}(${args.map(format).join(', ')})`);
    try {
      execBlock(fn.body);
      return null;
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      // break/continue only apply to loops in the current function.
      if (e instanceof BreakSignal || e instanceof ContinueSignal) {
        throw new LangError(
          `${e.message} is only valid inside a loop in the same function`,
          e.atLine
        );
      }
      throw e;
    } finally {
      scopes.pop();
      stack.pop();
    }
  }

  /* ----------------------------- Expressions ------------------------------ */

  function evalExpr(node: Expr): PyValue {
    switch (node.kind) {
      case 'num':
        return node.value;
      case 'str':
        return node.value;
      case 'bool':
        return node.value;
      case 'none':
        return null;
      case 'var': {
        const v = lookup(node.name);
        if (v === undefined) throw new LangError(`'${node.name}' is not defined`, node.line);
        return v;
      }
      case 'list': {
        const arr = node.items.map(evalExpr);
        const name = node.items.length === 1 && node.items[0].kind === 'var' ? node.items[0].name : 'list';
        arrayRefs.set(arr, name);
        return arr;
      }
      case 'unary': {
        const v = evalExpr(node.operand);
        if (node.op === 'not') return !truthy(v);
        return -toNum(v);
      }
      case 'binary': {
        if (node.op === 'and') return truthy(evalExpr(node.left)) ? evalExpr(node.right) : evalExpr(node.left);
        if (node.op === 'or') return truthy(evalExpr(node.left)) ? evalExpr(node.left) : evalExpr(node.right);
        if (node.op === 'in') {
          const container = evalExpr(node.right);
          const needle = evalExpr(node.left);
          if (Array.isArray(container)) return container.some((x) => format(x) === format(needle));
          return format(container).includes(format(needle));
        }
        return applyBinary(node.op, evalExpr(node.left), evalExpr(node.right), node.line);
      }
      case 'call': {
        if (node.callee.kind !== 'var') throw new LangError('unsupported call target', node.line);
        if (funcs.has(node.callee.name)) return callFunction(node.callee.name, node.args.map(evalExpr), node.line);
        return callBuiltin(node.callee.name, node.args.map(evalExpr), node.line);
      }
      case 'index': {
        const target = evalExpr(node.target);
        const idx = toNum(evalExpr(node.index));
        if (!Array.isArray(target)) throw new LangError('can only index lists', node.line);
        if (idx < 0 || idx >= target.length) throw new LangError(`list index out of range (${idx})`, node.line);
        touch(target, idx, 'current');
        return target[idx];
      }
      case 'assignIndex':
        return null;
      case 'methodCall': {
        const target = evalExpr(node.target);
        if (!Array.isArray(target)) throw new LangError('methods are only supported on lists', node.line);
        const args = node.args.map(evalExpr);
        switch (node.method) {
          case 'append':
            target.push(args[0]);
            return null;
          case 'pop':
            return target.length > 0 ? target.pop()! : null;
          case 'insert':
            target.splice(toNum(args[0]), 0, args[1]);
            return null;
          case 'remove': {
            const i = target.findIndex((x) => format(x) === format(args[0]));
            if (i >= 0) target.splice(i, 1);
            return null;
          }
          case 'index':
            return target.findIndex((x) => format(x) === format(args[0]));
          case 'count':
            return target.filter((x) => format(x) === format(args[0])).length;
          default:
            throw new LangError(`method '.${node.method}' is not supported yet`, node.line);
        }
      }
    }
  }

  /* ------------------------------ Execution ------------------------------- */

  function execBlock(body: Stmt[]): void {
    for (const stmt of body) execStmt(stmt);
  }

  function execStmt(stmt: Stmt): void {
    if (steps.length >= MAX_STEPS) {
      truncated = true;
      throw new StopSignal();
    }

    switch (stmt.kind) {
      case 'def': {
        funcs.set(stmt.name, { params: stmt.params, body: stmt.body, line: stmt.line });
        emit(stmt.line, `Define function ${stmt.name}(${stmt.params.join(', ')})`);
        break;
      }

      case 'assign': {
        if (stmt.target.kind === 'assignIndex') {
          const target = evalExpr(stmt.target.target);
          const idx = toNum(evalExpr(stmt.target.index));
          const value = evalExpr(stmt.value);
          if (!Array.isArray(target)) throw new LangError('can only assign into lists', stmt.line);
          if (idx < 0 || idx >= target.length) throw new LangError(`list index out of range (${idx})`, stmt.line);
          target[idx] = value;
          touch(target, idx, 'swap');
          const name = arrayRefs.get(target) ?? 'list';
          emit(stmt.line, `Set ${name}[${idx}] = ${format(value)}`);
          break;
        }
        if (stmt.target.kind !== 'var') throw new LangError('invalid assignment target', stmt.line);
        const value = evalExpr(stmt.value);
        assign(stmt.target.name, value);
        if (Array.isArray(value)) arrayRefs.set(value, stmt.target.name);
        emit(stmt.line, `Assign ${stmt.target.name} = ${format(value)}`);
        break;
      }

      case 'print': {
        const parts = stmt.args.map((a) => format(evalExpr(a)));
        const text = parts.join(' ');
        consoleLines.push(text);
        emit(stmt.line, `print(${parts.map((p) => `"${p}"`).join(', ')}) → ${text}`);
        break;
      }

      case 'expr': {
        // The parser folds `a[i] = v` into an expression statement.
        if (stmt.value.kind === 'assignIndex') {
          const target = evalExpr(stmt.value.target);
          const idx = toNum(evalExpr(stmt.value.index));
          const value = evalExpr(stmt.value.value);
          if (!Array.isArray(target)) throw new LangError('can only assign into lists', stmt.line);
          if (idx < 0 || idx >= target.length) throw new LangError(`list index out of range (${idx})`, stmt.line);
          target[idx] = value;
          touch(target, idx, 'swap');
          const name = arrayRefs.get(target) ?? 'list';
          emit(stmt.line, `Set ${name}[${idx}] = ${format(value)}`);
          break;
        }
        if (stmt.value.kind === 'methodCall') {
          const arr = evalExpr(stmt.value.target);
          const name = Array.isArray(arr) ? arrayRefs.get(arr) ?? 'list' : 'list';
          const v = evalExpr(stmt.value);
          if (stmt.value.method === 'append') emit(stmt.line, `${name}.append(...) → ${format(arr)}`);
          else emit(stmt.line, `${name}.${stmt.value.method}() → ${format(v)}`);
        } else {
          const v = evalExpr(stmt.value);
          if (Array.isArray(v)) arrayRefs.set(v, 'expression');
          emit(stmt.line, `Evaluate expression → ${format(v)}`);
        }
        break;
      }

      case 'if': {
        // Evaluate each condition exactly once — conditions may call functions.
        let matched: (typeof stmt.branches)[number] | null = null;
        let condText = '';
        for (const branch of stmt.branches) {
          const value = evalExpr(branch.cond);
          const text = format(value);
          if (matched === null) condText = text;
          if (truthy(value)) {
            matched = branch;
            condText = text;
            break;
          }
        }
        if (matched) {
          emit(matched.line, `Condition is true → enter branch (${condText})`);
          execBlock(matched.body);
        } else {
          emit(stmt.line, `Condition is false → skip branch (${condText})`);
          if (stmt.orelse.length > 0) execBlock(stmt.orelse);
        }
        break;
      }

      case 'while': {
        let iteration = 0;
        let brokeOut = false;
        for (;;) {
          if (steps.length >= MAX_STEPS) {
            truncated = true;
            emit(stmt.line, `Step limit of ${MAX_STEPS} reached → stopping (possible infinite loop)`);
            throw new StopSignal();
          }
          const cond = evalExpr(stmt.cond);
          iteration++;
          if (!truthy(cond)) {
            emit(stmt.line, `while condition false → exit after ${iteration - 1} iteration(s)`);
            break;
          }
          loops.push({ label: 'while', iteration });
          emit(stmt.line, `while ${format(cond)} → iteration ${iteration}`);
          try {
            execBlock(stmt.body);
          } catch (e) {
            if (e instanceof BreakSignal) {
              brokeOut = true;
            } else if (!(e instanceof ContinueSignal)) {
              loops.pop();
              throw e;
            }
          }
          loops.pop();
          if (brokeOut) {
            emit(stmt.line, `while loop exited early via break after ${iteration} iteration(s)`);
            break;
          }
        }
        break;
      }

      case 'for': {
        const sourceArray = evalExpr(stmt.iterable);
        const items = Array.isArray(sourceArray) ? sourceArray : typeof sourceArray === 'string' ? sourceArray.split('') : [];
        if (Array.isArray(sourceArray)) touch(sourceArray, 0, 'current');
        if (items.length === 0) {
          emit(stmt.line, `for loop has nothing to iterate over → skipped`);
          break;
        }
        loops.push({ label: 'for', iteration: 0 });
        let brokeOut = false;
        let ran = 0;
        for (let i = 0; i < items.length; i++) {
          if (steps.length >= MAX_STEPS) {
            truncated = true;
            emit(stmt.line, `Step limit of ${MAX_STEPS} reached → stopping`);
            throw new StopSignal();
          }
          ran = i + 1;
          assign(stmt.varName, items[i]);
          if (Array.isArray(sourceArray)) touch(sourceArray, i, 'current');
          loops[loops.length - 1] = { label: 'for', iteration: i + 1 };
          emit(stmt.line, `for ${stmt.varName} = ${format(items[i])} (iteration ${i + 1} of ${items.length})`);
          try {
            execBlock(stmt.body);
          } catch (e) {
            if (e instanceof BreakSignal) {
              brokeOut = true;
            } else if (!(e instanceof ContinueSignal)) {
              loops.pop();
              throw e;
            }
          }
          if (brokeOut) break;
        }
        loops.pop();
        emit(
          stmt.line,
          brokeOut
            ? `for loop exited early via break after ${ran} iteration(s)`
            : `for loop complete after ${items.length} iteration(s)`
        );
        break;
      }

      case 'return': {
        const value = stmt.value ? evalExpr(stmt.value) : null;
        if (Array.isArray(value)) arrayRefs.set(value, 'return');
        throw new ReturnSignal(value);
      }

      case 'break':
        emit(stmt.line, 'break → exit the loop');
        throw new BreakSignal(stmt.line);

      case 'continue':
        emit(stmt.line, 'continue → skip to the next iteration');
        throw new ContinueSignal(stmt.line);
    }
  }

  /* --------------------------------- Main --------------------------------- */

  try {
    execBlock(program.stmts);
  } catch (e) {
    if (e instanceof BreakSignal || e instanceof ContinueSignal) {
      error = `${e.message} is only valid inside a loop`;
      errorLine = e.atLine;
    } else if (!(e instanceof StopSignal)) {
      error = e instanceof Error ? e.message : 'Runtime error';
      errorLine = e instanceof LangError ? e.line : null;
    }
    if (error) {
      steps.push({
        line: errorLine !== null ? toStepLine(errorLine) : 0,
        description: `Runtime error: ${error}`,
        vars: snapshotVars(),
        console: consoleLines.length > 0 ? [...consoleLines] : undefined,
        viz: pickViz(),
      });
    }
  }

  if (steps.length === 0) {
    steps.push({ line: 0, description: 'Nothing to run.', vars: {}, viz: { type: 'none' } });
  }

  return { steps, truncated, error, errorLine, loopLines: program.loopLines, funcLines: program.funcLines };
}
