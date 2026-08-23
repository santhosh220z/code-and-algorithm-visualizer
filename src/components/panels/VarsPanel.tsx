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
      {step?.loops && step.loops.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4d5a] mb-1.5">
            Loop Progress
          </h4>
          <div className="flex gap-1.5 flex-wrap">
            {step.loops.map((loop, idx) => (
              <div
                key={`${loop.label}-${idx}`}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#20222f] border border-[var(--color-border)]"
              >
                <span className="text-[11px] font-mono text-[var(--color-accent-hover)]">{loop.label}</span>
                <span className="text-[13px] font-mono font-bold text-white">{loop.iteration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasVars ? (
        <table className="w-full text-left">
          <tbody>
            {Object.entries(step!.vars!).map(([key, value]) => (
              <tr key={key} className="border-b border-[#20222f] last:border-0">
                <td className="py-1.5 pr-3 font-mono text-[11.5px] text-[var(--color-active)] whitespace-nowrap align-top">
                  {key}
                </td>
                <td className="py-1.5 font-mono text-[11.5px] text-white break-all">{formatValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !step?.loops && (
          <p className="text-[11px] text-[#4a4d5a] italic">No state at this step.</p>
        )
      )}
    </div>
  );
}