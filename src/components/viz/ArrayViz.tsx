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

  const kindOf = new Map<number, ArrayHighlight['kind']>();
  for (const h of highlights) kindOf.set(h.index, h.kind);

  const pointerRows = new Map<number, Pointer[]>();
  for (const p of pointers) {
    const row = pointerRows.get(p.index) ?? [];
    row.push(p);
    pointerRows.set(p.index, row);
  }

  return (
    <div className="w-full h-full flex flex-col justify-end overflow-hidden">
      <div className="flex-1" />
      {/* Pointer labels */}
      <div className="relative h-6 mx-auto" style={{ width: n * (barW + gap) }}>
        {[...pointerRows.entries()].map(([index, ptrs]) => (
          <div
            key={index}
            className="absolute bottom-0 flex flex-col items-center"
            style={{
              left: index * (barW + gap),
              width: barW,
              transform: `translateX(${barW / 2}px)`,
            }}
          >
            {ptrs.map((p, i) => (
              <span
                key={p.label}
                className="text-[10px] font-mono font-semibold leading-tight whitespace-nowrap"
                style={{ color: p.color ?? '#a855f7', marginTop: i > 0 ? -2 : 0 }}
              >
                {i === 0 ? '▾' : ''}{p.label}
              </span>
            ))}
          </div>
        ))}
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
              {n <= 30 && (
                <span
                  className={`absolute left-1/2 -translate-x-1/2 text-center font-mono text-[10px] transition-colors ${
                    kind ? 'text-white font-bold' : 'text-[#5a5e6e]'
                  }`}
                  style={{ top: `${chartH - h - 16}px`, width: barW * 2 }}
                >
                  {value}
                </span>
              )}
              <div
                className="rounded-t-[3px] transition-all duration-150 ease-out"
                style={{
                  height: `${h}px`,
                  background: color,
                  boxShadow: glowing ? `0 0 10px ${color}` : undefined,
                  transform: kind === 'swap' ? 'scale(1.06)' : undefined,
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