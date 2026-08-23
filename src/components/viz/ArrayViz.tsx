import type { ArrayHighlight, Pointer } from '../../core/types';

interface ArrayVizProps {
  array: number[];
  highlights: ArrayHighlight[];
  pointers: Pointer[];
}

const COLORS: Record<ArrayHighlight['kind'], string> = {
  compare: '#f87171',
  swap: '#fbbf24',
  sorted: '#4ade80',
  pivot: '#a855f7',
  current: '#60a5fa',
  trail: 'rgba(96,165,250,0.45)',
};

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export function ArrayViz({ array, highlights, pointers }: ArrayVizProps) {
  if (array.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[#4a4d5a] italic">
        No data to visualize
      </div>
    );
  }

  const max = Math.max(...array, 1);
  const n = array.length;
  const gap = n > 40 ? 1 : 3;
  const barW = Math.max(6, Math.min(48, 760 / n - gap));
  const chartH = 260;

  // Latest highlight wins per index
  const kindOf = new Map<number, ArrayHighlight['kind']>();
  for (const h of highlights) kindOf.set(h.index, h.kind);

  // Stack row per pointer at the same index; keyed by label so arrows GLIDE.
  const rowOf = new Map<string, number>();
  const seenAt = new Map<number, number>();
  for (const p of pointers) {
    const row = seenAt.get(p.index) ?? 0;
    rowOf.set(p.label, row);
    seenAt.set(p.index, row + 1);
  }

  return (
    <div className="w-full h-full flex flex-col justify-end overflow-hidden">
      <div className="flex-1" />

      {/* Pointer labels — keyed by label + absolute left so they animate between indices */}
      <div className="relative h-6 mx-auto" style={{ width: n * (barW + gap) }}>
        {pointers.map((p) => {
          const row = rowOf.get(p.label) ?? 0;
          return (
            <div
              key={p.label}
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                left: p.index * (barW + gap),
                transform: `translateX(${barW / 2}px) translateY(-${row * 11}px)`,
                transition: `left 260ms ${EASE}, transform 260ms ${EASE}`,
              }}
            >
              <span
                className="text-[10px] font-mono font-semibold leading-tight whitespace-nowrap"
                style={{ color: p.color ?? '#a855f7' }}
              >
                ▾{p.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bars */}
      <div className="flex items-end mx-auto" style={{ gap: `${gap}px`, height: chartH + 24 }}>
        {array.map((value, i) => {
          const kind = kindOf.get(i);
          const color = kind ? COLORS[kind] : '#374151';
          const h = Math.max(6, (value / max) * chartH);
          const glowing = kind === 'compare' || kind === 'swap' || kind === 'current';
          return (
            <div key={i} className="relative shrink-0" style={{ width: barW }}>
              {/* Value label rides the bar top smoothly */}
              {n <= 30 && (
                <span
                  className={`absolute left-1/2 -translate-x-1/2 text-center font-mono text-[10px] ${
                    kind ? 'text-white font-bold' : 'text-[#5a5e6e]'
                  }`}
                  style={{
                    top: `${chartH - h - 16}px`,
                    width: barW * 2,
                    transition: `top 220ms ${EASE}, color 150ms linear`,
                  }}
                >
                  {value}
                </span>
              )}
              <div
                className="rounded-t-[3px]"
                style={{
                  height: `${h}px`,
                  background: color,
                  boxShadow: glowing ? `0 0 12px ${color}` : '0 0 0 rgba(0,0,0,0)',
                  transform:
                    kind === 'swap'
                      ? 'scaleY(1.07)'
                      : kind === 'compare' || kind === 'current'
                      ? 'translateY(-3px)'
                      : 'none',
                  transition: `height 200ms ${EASE}, background-color 160ms linear, box-shadow 200ms ${EASE}, transform 220ms ${kind === 'swap' ? SPRING : EASE}`,
                }}
              />
              {n <= 20 && (
                <span className="block text-center font-mono text-[8px] text-[#3a3d49] mt-0.5 select-none">
                  {i}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}