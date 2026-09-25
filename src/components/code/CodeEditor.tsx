import { useState } from 'react';
import { CODE_LANGUAGE_LABEL, SNIPPETS, type Snippet } from '../../core/codeRunner';

interface CodeEditorProps {
  source: string;
  error: string | null;
  onChange: (source: string) => void;
  onRun: () => void;
}

interface CodeEditorGuideProps {
  onSelect: (source: string) => void;
  view?: 'all' | 'starters' | 'syntax';
}

export function CodeEditorGuide({ onSelect, view = 'all' }: CodeEditorGuideProps) {
  return (
    <div className="space-y-6 p-4">
      {view !== 'syntax' && (
        <section aria-labelledby="starter-programs-heading">
        <h2 id="starter-programs-heading" className="text-sm font-semibold text-[var(--color-text)]">Starter programs</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">Choose an example, then change it and run the trace.</p>
        <div className="mt-3 grid gap-2">
          {SNIPPETS.map((snippet: Snippet) => (
            <button
              key={snippet.id}
              type="button"
              onClick={() => onSelect(snippet.source)}
              className="flex min-h-14 flex-col rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-left transition-colors hover:border-[var(--color-accent-border)] hover:bg-[var(--color-surface-3)]"
            >
              <span className="text-sm font-semibold text-[var(--color-text)]">{snippet.name}</span>
              <span className="mt-0.5 text-xs text-[var(--color-text-dim)]">{snippet.description}</span>
            </button>
          ))}
        </div>
      </section>
      )}

      {view !== 'starters' && (
        <section aria-labelledby="supported-syntax-heading" className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
        <h2 id="supported-syntax-heading" className="text-sm font-semibold text-[var(--color-text)]">Supported syntax</h2>
        <div className="mt-3 grid gap-2 font-mono text-xs text-[var(--color-text-muted)]">
          <span>variables: a = 1, a += 2</span>
          <span>conditionals: if / elif / else</span>
          <span>loops: while, for x in range(n)</span>
          <span>loop control: break, continue</span>
          <span>functions: def f(x): + return</span>
          <span>lists: [1, 2, 3], a[i], a.append(v)</span>
          <span>builtins: print, range, len, sum, min, max, abs, round, sqrt</span>
          <span>keyboard: Ctrl/Cmd + Enter runs</span>
        </div>
      </section>
      )}
    </div>
  );
}

export function CodeEditor({ source, error, onChange, onRun }: CodeEditorProps) {
  const [tabInsertsIndent, setTabInsertsIndent] = useState(false);

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-3 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Language</span>
          <select
            defaultValue="miniPython"
            disabled
            title="Only one language is supported right now"
            className="min-h-10 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-3)] px-3 py-2 text-xs text-[var(--color-text)] opacity-70"
            aria-label="Language"
          >
            <option value="miniPython">{CODE_LANGUAGE_LABEL}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={onRun}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-accent-border)] bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Visualize
          <span className="font-mono text-[10px] opacity-80">Ctrl/Cmd + ↵</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-3 flex items-start gap-2 rounded-[var(--radius-control)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-xs font-mono text-[var(--color-danger)]">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5v.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-code-bg)] shadow-[var(--shadow-card)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">main.py</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTabInsertsIndent((value) => !value)}
              aria-pressed={tabInsertsIndent}
              className="min-h-10 rounded-[var(--radius-control)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
            >
              Tab: {tabInsertsIndent ? 'indent' : 'move focus'}
            </button>
            <span className="font-mono text-[10px] text-[var(--color-text-dim)]">{source.split('\n').length} lines</span>
          </div>
        </div>
        <textarea
          value={source}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              onRun();
              return;
            }
            if (event.key === 'Escape' && tabInsertsIndent) {
              event.preventDefault();
              setTabInsertsIndent(false);
              return;
            }
            if (event.key === 'Tab' && tabInsertsIndent && !event.ctrlKey && !event.metaKey && !event.altKey) {
              event.preventDefault();
              const element = event.currentTarget;
              const { selectionStart, selectionEnd, value } = element;
              const next = `${value.slice(0, selectionStart)}    ${value.slice(selectionEnd)}`;
              element.value = next;
              element.selectionStart = element.selectionEnd = selectionStart + 4;
              onChange(next);
            }
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="scrollbar-thin min-h-0 w-full flex-1 resize-none bg-transparent px-4 py-3 font-mono text-sm leading-[1.6] text-[var(--color-text)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]"
          aria-label="Code editor"
        />
      </div>
    </div>
  );
}
