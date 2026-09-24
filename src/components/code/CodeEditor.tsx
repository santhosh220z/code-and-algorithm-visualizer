import { CODE_LANGUAGE_LABEL, SNIPPETS, type Snippet } from '../../core/codeRunner';

interface CodeEditorProps {
  source: string;
  error: string | null;
  onChange: (source: string) => void;
  onRun: () => void;
}

export function CodeEditor({ source, error, onChange, onRun }: CodeEditorProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <label className="flex items-center gap-2">
          <span className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-muted)]">Language</span>
          <select
            value="miniPython"
            onChange={() => {}}
            className="px-2.5 py-1.5 rounded-lg bg-[#20222f] border border-[var(--color-border)] text-[12px] text-white focus:border-[var(--color-accent)] focus:outline-none"
            aria-label="Language"
          >
            <option value="miniPython">{CODE_LANGUAGE_LABEL}</option>
          </select>
        </label>
        <button
          onClick={onRun}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] active:scale-95 transition-all"
        >
          Visualize
          <span className="font-mono text-[10px] opacity-80">Ctrl+↵</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[12px] font-mono text-red-300"
        >
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col rounded-xl bg-[#14151c] border border-[var(--color-border)] overflow-hidden">
        <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            main.py
          </span>
          <span className="text-[10px] font-mono text-[#4a4d5a]">{source.split('\n').length} lines</span>
        </div>
        <textarea
          value={source}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onRun();
            }
            if (e.key === 'Tab') {
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart, selectionEnd, value } = el;
              const next = `${value.slice(0, selectionStart)}    ${value.slice(selectionEnd)}`;
              el.value = next;
              el.selectionStart = el.selectionEnd = selectionStart + 4;
              onChange(next);
            }
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="flex-1 min-h-0 w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-[1.6] text-[#e8eaf0] focus:outline-none scrollbar-thin"
          aria-label="Code editor"
        />
      </div>

      <div className="mt-5 shrink-0">
        <p className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
          Sample programs
        </p>
        <div className="flex gap-2 flex-wrap">
          {SNIPPETS.map((s: Snippet) => (
            <button
              key={s.id}
              onClick={() => onChange(s.source)}
              title={s.description}
              className="px-2.5 py-1.5 rounded-lg text-[11.5px] bg-[#20222f] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)] active:scale-95 transition-all"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <details className="mt-4 shrink-0 text-[11.5px] text-[var(--color-text-muted)]">
        <summary className="cursor-pointer hover:text-white transition-colors select-none">
          Supported constructs
        </summary>
        <div className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] text-[#7a7f90]">
          <span>variables: a = 1, a += 2</span>
          <span>conditionals: if / elif / else</span>
          <span>loops: while, for x in range(n)</span>
          <span>loop control: break, continue</span>
          <span>functions: def f(x): + return</span>
          <span>lists: [1, 2, 3], a[i], a.append(v)</span>
          <span>builtins: print, range, len, sum, min, max, abs, round, sqrt</span>
        </div>
      </details>
    </div>
  );
}
