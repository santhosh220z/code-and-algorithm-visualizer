import type { HanoiPegs, HanoiHighlight, HanoiMovingDisk } from '../../core/types';
import {
  HANOI_BASE_Y,
  HANOI_DISK_H,
  HANOI_PEG_X,
  HANOI_VIEW_H,
  HANOI_VIEW_W,
  hanoiDiskWidth,
  hanoiRestY,
} from '../../algos/recursion/hanoiGeometry';
import { DISK_COLORS, MOTION, VIZ } from './palette';

const PEG_LABELS: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];

const VIEW_W = HANOI_VIEW_W;
const VIEW_H = HANOI_VIEW_H;

const BASE_Y = HANOI_BASE_Y;
const PLATE_Y = 210;
const POLE_W = 8;
const POLE_H = 150;
const DISK_H = HANOI_DISK_H;

const PEG_X = HANOI_PEG_X;

export function HanoiViz({
  pegs,
  highlights,
  moving,
}: {
  pegs: HanoiPegs;
  highlights: HanoiHighlight[];
  moving: HanoiMovingDisk | null;
}) {
  const totalDiskCount =
    PEG_LABELS.reduce((sum, p) => sum + pegs[p].length, 0) + (moving ? 1 : 0);
  if (totalDiskCount === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm italic" style={{ color: VIZ.textDim }}>
        Tower of Hanoi
      </div>
    );
  }

  const hiMap = new Map<string, HanoiHighlight>();
  for (const h of highlights) {
    hiMap.set(`${h.peg}:${h.disk}`, h);
  }
  const isSettledLast = (peg: 'A' | 'B' | 'C', disk: number) =>
    hiMap.get(`${peg}:${disk}`)?.kind === 'settled';

  const disks = PEG_LABELS.flatMap((peg) =>
    pegs[peg].map((disk, idx) => ({
      peg,
      disk,
      y: hanoiRestY(idx),
      x: PEG_X[peg],
      bottom: idx,
    }))
  );

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="max-h-full max-w-full"
        style={{ minWidth: '100%' }}
        role="img"
        aria-label="Tower of Hanoi with disk positions and the disk currently moving"
      >
        <defs>
          <linearGradient id="hanoi-pole" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIZ.textDim} />
            <stop offset="50%" stopColor={VIZ.borderStrong} />
            <stop offset="100%" stopColor={VIZ.surfaceStrong} />
          </linearGradient>
        </defs>

        {/* base plate */}
        <rect
          x={40}
          y={PLATE_Y}
          width={VIEW_W - 80}
          height={12}
          rx={5}
          fill={VIZ.surfaceStrong}
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
                style={{ transition: MOTION.fill }}
              />
              <text
                x={x}
                y={BASE_Y - POLE_H - 14}
                textAnchor="middle"
                fontSize={18}
                fontFamily={VIZ.fontCode}
                fontWeight={700}
                fill={VIZ.labelCanvas}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {peg}
              </text>
            </g>
          );
        })}

        {/* disks */}
        {disks.map(({ peg, disk, y, x }) => {
          const settledLast = isSettledLast(peg, disk);
          const width = hanoiDiskWidth(disk);
          const color = DISK_COLORS[(disk - 1) % DISK_COLORS.length];
          // keyed by disk id so a moving disk travels instead of remounting
          return (
            <g key={disk} className="anim-viz-pop" style={{ transition: MOTION.geometry }}>
              <rect
                x={x - width / 2}
                y={y - DISK_H / 2}
                width={width}
                height={DISK_H}
                rx={DISK_H / 2}
                fill={color}
                fillOpacity={settledLast ? 1 : 0.9}
                stroke={settledLast ? VIZ.text : VIZ.borderStrong}
                strokeWidth={settledLast ? 2 : 1}
                style={{
                  filter: settledLast ? `drop-shadow(0 0 ${VIZ.glowMd} ${color})` : undefined,
                  transition: MOTION.fill,
                }}
              />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontFamily={VIZ.fontCode}
                fontWeight={700}
                fill={VIZ.onState}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {disk}
              </text>
            </g>
          );
        })}

        {/* in-flight disk */}
        {moving && (
          <g className="anim-viz-pulse" style={{ transition: MOTION.geometry }}>
            <rect
              x={moving.x - hanoiDiskWidth(moving.disk) / 2}
              y={moving.y - DISK_H / 2}
              width={hanoiDiskWidth(moving.disk)}
              height={DISK_H}
              rx={DISK_H / 2}
              fill={DISK_COLORS[(moving.disk - 1) % DISK_COLORS.length]}
              stroke={VIZ.text}
              strokeWidth={2.5}
              style={{
                filter: `drop-shadow(0 0 ${VIZ.glowMd} ${DISK_COLORS[(moving.disk - 1) % DISK_COLORS.length]})`,
                transition: MOTION.geometry,
              }}
            />
            <text
              x={moving.x}
              y={moving.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontFamily={VIZ.fontCode}
              fontWeight={700}
              fill={VIZ.onState}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {moving.disk}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
