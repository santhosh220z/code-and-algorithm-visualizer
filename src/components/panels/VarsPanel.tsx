import type { Step } from '../../core/types';

interface VarsPanelProps {
  step: Step | null;
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) {
    if (value.length <= 10) return `[${value.join(', ')}]`;
    return `[${value.slice(0, 10).join(', ')} …] (${value.length} items)`;
  }
  const s = String(value);
  return s.length > 60 ? s.slice(0, 57) + '…' : s;
}

export function VarsPanel({ step }: VarsPanelProps) {
  const hasVars = step?.vars && Object.keys(step.vars).length > 0;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-3">
      {step?.stack && step.stack.length > 0 && (
        <section aria-labelledby="call-stack-heading">
          <h4 id="call-stack-heading" className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Call stack
          </h4>
          <ol className="space-y-1">
            {step.stack.map((frame, index) => (
              <li key={`${frame.fn}-${index}`} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-3)] px-2.5 py-2 font-mono text-xs text-[var(--color-text)]">
                {frame.fn}({Object.entries(frame.args).map(([key, value]) => `${key}: ${String(value)}`).join(', ')})
              </li>
            ))}
          </ol>
        </section>
      )}

      {step?.loops && step.loops.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Loop Progress
          </h4>
          <div className="flex gap-1.5 flex-wrap">
            {step.loops.map((loop, idx) => (
              <div
                key={`${loop.label}-${idx}`}
                className="flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-control)] bg-[var(--color-surface-3)] border border-[var(--color-border)]"
              >
                <span className="text-[11px] font-mono text-[var(--color-accent-hover)]">{loop.label}</span>
                <span className="text-[13px] font-mono font-bold text-[var(--color-text)]">{loop.iteration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasVars ? (
        <section aria-labelledby="live-values-heading">
          <h4 id="live-values-heading" className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Live values
          </h4>
          <table className="w-full text-left">
            <caption className="sr-only">Variable values at the current algorithm step</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Variable</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
            {Object.entries(step!.vars!).map(([key, value]) => (
              <tr key={key} className="border-b border-[var(--color-border)] last:border-0">
                <th scope="row" className="whitespace-nowrap py-1.5 pr-3 text-left align-top font-mono text-xs text-[var(--color-code-key)]">
                  {key}
                </th>
                <td className="break-all py-1.5 font-mono text-xs text-[var(--color-text)]">{formatValue(value)}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </section>
      ) : (
        !step?.loops && (
          <p className="text-[11px] text-[var(--color-text-dim)] italic">No state at this step.</p>
        )
      )}
    </div>
  );
}