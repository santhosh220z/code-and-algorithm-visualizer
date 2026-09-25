import type { TableCell, TableHighlight } from '../../core/types';
import { MOTION, VIZ, resolveVisualState } from './palette';

const DEFAULT_FILL = VIZ.gridEmpty;
const DEFAULT_STROKE = VIZ.idleStrong;
const COMPUTED_FILL = VIZ.nodeFill;

export function TableViz({ table, highlights }: { table: TableCell[][]; highlights: TableHighlight[] }) {
  if (table.length === 0 || table[0].length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
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
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        role="img"
        aria-label="Dynamic programming table with highlighted computation states"
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
            fontFamily={VIZ.fontCode}
            fontWeight={600}
            fill={VIZ.labelCanvas}
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
            fontFamily={VIZ.fontCode}
            fontWeight={600}
            fill={VIZ.labelCanvas}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {row}
          </text>
        ))}

        {/* Grid lines */}
        <g stroke={VIZ.edge} strokeWidth={0.5} opacity={0.45}>
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
            const state = resolveVisualState(kind);
            const fill = kind
              ? state.fill
              : cell.computed
                ? COMPUTED_FILL
                : DEFAULT_FILL;
            const stroke = kind ? state.stroke : DEFAULT_STROKE;

            return (
              <g key={`${r},${c}`}>
                <rect
                  x={c * cellW}
                  y={headerH + r * cellH}
                  width={cellW}
                  height={cellH}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={kind ? 2 : 1}
                  style={{
                    filter: kind === 'current' ? `drop-shadow(0 0 ${VIZ.glowSm} ${VIZ.current})` : undefined,
                    transition: MOTION.fill,
                  }}
                />
                <text
                  x={c * cellW + cellW / 2}
                  y={headerH + r * cellH + cellH / 2 + 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontFamily={VIZ.fontCode}
                  fontWeight={cell.computed ? 600 : 400}
                  fill={kind ? state.text : VIZ.label}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {cell.value}
                </text>
                {cell.computed && !kind && (
                  <circle
                    cx={c * cellW + cellW - 8}
                    cy={headerH + r * cellH + 8}
                    r={4}
                    fill={VIZ.sorted}
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