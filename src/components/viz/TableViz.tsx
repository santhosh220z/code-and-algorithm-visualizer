import type { TableCell, TableHighlight } from '../../core/types';

const CELL_FILL: Record<TableHighlight['kind'], string> = {
  compute: '#fbbf24',
  read: '#60a5fa',
  result: '#4ade80',
  current: '#a855f7',
};

const CELL_STROKE: Record<TableHighlight['kind'], string> = {
  compute: '#fcd34d',
  read: '#93c5fd',
  result: '#86efac',
  current: '#c084fc',
};

const DEFAULT_FILL = '#1c1d26';
const DEFAULT_STROKE = '#3a3d49';
const COMPUTED_FILL = '#2a2d3e';

export function TableViz({ table, highlights }: { table: TableCell[][]; highlights: TableHighlight[] }) {
  if (table.length === 0 || table[0].length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[#4a4d5a] italic">
        No table to visualize
      </div>
    );
  }

  const hiMap = new Map(highlights.map((h) => [`${h.row},${h.col}`, h]));

  const rows = table.length;
  const cols = table[0].length;
  const cellW = 70;
  const cellH = 40;
  const headerH = 30;

  const width = cols * cellW;
  const height = rows * cellH + headerH;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full max-h-full"
        style={{ minWidth: '100%' }}
      >
        {/* Column headers */}
        {table[0].map((_, col) => (
          <text
            key={`col-${col}`}
            x={col * cellW + cellW / 2}
            y={headerH / 2 + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={600}
            fill="#8fa8c9"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {col}
          </text>
        ))}

        {/* Row headers */}
        {table.map((_, row) => (
          <text
            key={`row-${row}`}
            x={5}
            y={headerH + row * cellH + cellH / 2 + 5}
            textAnchor="start"
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={600}
            fill="#8fa8c9"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {row}
          </text>
        ))}

        {/* Grid lines */}
        <g stroke="#3a3d49" strokeWidth={0.5} opacity={0.3}>
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <line
              key={`vline-${i}`}
              x1={i * cellW}
              y1={headerH}
              x2={i * cellW}
              y2={height}
            />
          ))}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <line
              key={`hline-${i}`}
              x1={0}
              y1={headerH + i * cellH}
              x2={width}
              y2={headerH + i * cellH}
            />
          ))}
        </g>

        {/* Cells */}
        {table.map((row, r) =>
          row.map((cell, c) => {
            const hi = hiMap.get(`${r},${c}`);
            const kind = hi?.kind;
            const fill = kind
              ? CELL_FILL[kind]
              : cell.computed
                ? COMPUTED_FILL
                : DEFAULT_FILL;
            const stroke = kind ? CELL_STROKE[kind] : DEFAULT_STROKE;

            return (
              <g key={`${r},${c}`} style={{ transition: 'all 150ms ease' }}>
                <rect
                  x={c * cellW}
                  y={headerH + r * cellH}
                  width={cellW}
                  height={cellH}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={kind ? 2 : 1}
                  style={{
                    filter: kind === 'current' ? 'drop-shadow(0 0 3px #a855f7)' : undefined,
                  }}
                />
                <text
                  x={c * cellW + cellW / 2}
                  y={headerH + r * cellH + cellH / 2 + 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={cell.computed ? 600 : 400}
                  fill={kind ? '#0f1015' : cell.computed ? '#4ade80' : '#c8ccd8'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {cell.value}
                </text>
                {cell.computed && !kind && (
                  <circle
                    cx={c * cellW + cellW - 8}
                    cy={headerH + r * cellH + 8}
                    r={4}
                    fill="#4ade80"
                    opacity={0.7}
                  />
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}