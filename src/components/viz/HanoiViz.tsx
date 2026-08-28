import type { HanoiPegs, HanoiHighlight } from '../../core/types';

const PEG_LABELS: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];

const VIEW_W = 720;
const VIEW_H = 260;

const BASE_Y = 180;
const PLATE_Y = 210;
const POLE_W = 8;
const POLE_H = 150;
const DISK_H = 22;

const PEG_X: Record<'A' | 'B' | 'C', number> = { A: 150, B: 360, C: 570 };

const DISK_COLORS = [
  '#f87171',
  '#fb923c',
  '#fbbf24',
  '#4ade80',
  '#38bdf8',
  '#a78bfa',
  '#f472b6',
];

export function HanoiViz({
  pegs,
  highlights,
}: {
  pegs: HanoiPegs;
  highlights: HanoiHighlight[];
}) {
  const totalDiskCount = PEG_LABELS.reduce((sum, p) => sum + pegs[p].length, 0);
  if (totalDiskCount === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-[#4a4d5a] italic">
        Tower of Hanoi
      </div>
    );
  }

  const hiMap = new Map<string, HanoiHighlight>();
  for (const h of highlights) {
    hiMap.set(`${h.peg}:${h.disk}`, h);
  }

  const disks = PEG_LABELS.flatMap((peg) =>
    pegs[peg].map((disk, idx) => ({
      peg,
      disk,
      y: BASE_Y - (idx + 1) * DISK_H,
      bottom: idx,
    }))
  );

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="max-w-full max-h-full"
        style={{ minWidth: '100%' }}
      >
        <defs>
          <linearGradient id="hanoi-pole" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b5f6e" />
            <stop offset="50%" stopColor="#3a3d49" />
            <stop offset="100%" stopColor="#2a2c36" />
          </linearGradient>
        </defs>

        {/* base plate */}
        <rect
          x={40}
          y={PLATE_Y}
          width={VIEW_W - 80}
          height={12}
          rx={5}
          fill="#2b2d38"
        />

        {/* each peg: pole + label */}
        {PEG_LABELS.map((peg) => {
          const x = PEG_X[peg];
          return (
            <g key={peg}>
              <rect
                x={x - POLE_W / 2}
                y={BASE_Y - POLE_H}
                width={POLE_W}
                height={POLE_H}
                rx={4}
                fill="url(#hanoi-pole)"
                style={{ transition: 'all 200ms ease' }}
              />
              <text
                x={x}
                y={BASE_Y - POLE_H - 14}
                textAnchor="middle"
                fontSize={18}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="#6b7280"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {peg}
              </text>
            </g>
          );
        })}

        {/* disks */}
        {disks.map(({ peg, disk, y }) => {
          const x = PEG_X[peg];
          const hi = hiMap.get(`${peg}:${disk}`);
          const isMoving = hi?.kind === 'moving';
          const width = 52 + disk * 34;
          const color = DISK_COLORS[(disk - 1) % DISK_COLORS.length];
          return (
            <g key={`${peg}-${disk}`} style={{ transition: 'all 200ms ease' }}>
              <rect
                x={x - width / 2}
                y={y - DISK_H / 2}
                width={width}
                height={DISK_H}
                rx={DISK_H / 2}
                fill={color}
                fillOpacity={isMoving ? 1 : 0.9}
                stroke={isMoving ? '#ffffff' : 'rgba(255,255,255,0.18)'}
                strokeWidth={isMoving ? 2 : 1}
                style={{
                  filter: isMoving ? `drop-shadow(0 0 8px ${color})` : undefined,
                  transition: 'all 200ms ease',
                }}
              />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="#1a1b22"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {disk}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
