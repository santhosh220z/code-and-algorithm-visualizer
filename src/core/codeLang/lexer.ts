export type TokKind = 'num' | 'str' | 'name' | 'op' | 'newline' | 'indent' | 'dedent' | 'eof';

export interface Token {
  kind: TokKind;
  /** Raw text for names/ops; parsed value for num; unquoted text for str. */
  value: string;
  num?: number;
  line: number;
}

export class LangError extends Error {
  readonly line: number;
  constructor(message: string, line: number) {
    super(line > 0 ? `Line ${line}: ${message}` : message);
    this.name = 'LangError';
    this.line = line;
  }
}

const OPERATORS = [
  '==', '!=', '<=', '>=', '//', '+=', '-=', '*=', '/=',
  '+', '-', '*', '/', '%', '<', '>', '=', '(', ')', '[', ']', ',', ':', '.',
];

function isNameStart(ch: string): boolean {
  return /[A-Za-z_]/.test(ch);
}
function isNamePart(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch);
}
function isDigit(ch: string): boolean {
  return /[0-9]/.test(ch);
}

/** Tokenize miniPython source. Handles indentation-based block structure. */
export function tokenize(src: string): Token[] {
  const lines = src.replace(/\t/g, '  ').split('\n');
  const tokens: Token[] = [];
  const indents: number[] = [0];

  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    const lineNo = li + 1;
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    // Measure indentation
    let indent = 0;
    while (indent < raw.length && raw[indent] === ' ') indent++;

    // Emit INDENT/DEDENT tokens
    const top = indents[indents.length - 1];
    if (indent > top) {
      indents.push(indent);
      tokens.push({ kind: 'indent', value: '', line: lineNo });
    } else {
      while (indent < indents[indents.length - 1]) {
        indents.pop();
        tokens.push({ kind: 'dedent', value: '', line: lineNo });
      }
      if (indent !== indents[indents.length - 1]) {
        throw new LangError('inconsistent indentation', lineNo);
      }
    }

    // Tokenize the line content
    let i = indent;
    const line = lines[li];
    while (i < line.length) {
      const ch = line[i];

      if (ch === ' ') {
        i++;
        continue;
      }

      if (ch === '#') break;

      if (isDigit(ch) || (ch === '.' && isDigit(line[i + 1] ?? ''))) {
        let j = i;
        let seenDot = false;
        while (j < line.length && (isDigit(line[j]) || (line[j] === '.' && !seenDot))) {
          if (line[j] === '.') seenDot = true;
          j++;
        }
        const text = line.slice(i, j);
        tokens.push({ kind: 'num', value: text, num: Number(text), line: lineNo });
        i = j;
        continue;
      }

      if (ch === '"' || ch === "'") {
        const quote = ch;
        let j = i + 1;
        let s = '';
        while (j < line.length && line[j] !== quote) {
          if (line[j] === '\\' && j + 1 < line.length) {
            const esc = line[j + 1];
            s += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc;
            j += 2;
          } else {
            s += line[j];
            j++;
          }
        }
        if (j >= line.length) throw new LangError('unterminated string', lineNo);
        tokens.push({ kind: 'str', value: s, line: lineNo });
        i = j + 1;
        continue;
      }

      if (isNameStart(ch)) {
        let j = i;
        while (j < line.length && isNamePart(line[j])) j++;
        const text = line.slice(i, j);
        tokens.push({ kind: 'name', value: text, line: lineNo });
        i = j;
        continue;
      }

      // Multi-char and single-char operators
      const two = line.slice(i, i + 2);
      if (OPERATORS.includes(two)) {
        tokens.push({ kind: 'op', value: two, line: lineNo });
        i += 2;
        continue;
      }
      if (OPERATORS.includes(ch)) {
        tokens.push({ kind: 'op', value: ch, line: lineNo });
        i++;
        continue;
      }

      throw new LangError(`unexpected character '${ch}'`, lineNo);
    }

    tokens.push({ kind: 'newline', value: '', line: lineNo });
  }

  // Close any open blocks
  while (indents.length > 1) {
    indents.pop();
    tokens.push({ kind: 'dedent', value: '', line: lines.length });
  }
  tokens.push({ kind: 'eof', value: '', line: lines.length });

  return tokens;
}
