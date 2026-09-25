import type { ReactNode } from 'react';
import type { Step } from '../../core/types';
import { usePlayerStore } from '../../core/player';
import { ArrayViz } from './ArrayViz';
import { SearchViz } from './SearchViz';
import { GraphViz } from './GraphViz';
import { GridViz } from './GridViz';
import { TreeViz } from './TreeViz';
import { ListViz } from './ListViz';
import { TableViz } from './TableViz';
import { HanoiViz } from './HanoiViz';
import { CallStackViz } from './CallStackViz';
import { VizLegend } from './VizLegend';
import { motionVars } from './palette';

interface VisualizationCanvasProps {
  step?: Step | null;
  compact?: boolean;
  className?: string;
}

function EmptyVisualization(): ReactNode {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm italic text-[var(--color-text-dim)]">
        Press Play or → to step through the trace.
      </p>
    </div>
  );
}

function renderVisualization(step: Step | null | undefined, compact: boolean): ReactNode {
  if (!step) return <EmptyVisualization />;

  switch (step.viz.type) {
    case 'array':
      return (
        <ArrayViz
          array={step.viz.array}
          highlights={step.viz.highlights}
          pointers={step.viz.pointers}
          compact={compact}
        />
      );
    case 'search':
      return (
        <SearchViz
          array={step.viz.array}
          highlights={step.viz.highlights}
          window={step.viz.window}
          found={step.viz.found}
        />
      );
    case 'graph':
      return <GraphViz />;
    case 'grid':
      return <GridViz />;
    case 'tree':
      return <TreeViz nodes={step.viz.nodes} highlights={step.viz.highlights} />;
    case 'list':
      return <ListViz nodes={step.viz.nodes} highlights={step.viz.highlights} variant={step.viz.variant} />;
    case 'table':
      return <TableViz table={step.viz.table} highlights={step.viz.highlights} />;
    case 'hanoi':
      return (
        <HanoiViz
          pegs={step.viz.pegs}
          highlights={step.viz.highlights}
          moving={step.viz.moving}
        />
      );
    case 'callstack':
      return (
        <CallStackViz
          frames={step.viz.frames}
          currentId={step.viz.currentId}
          result={step.viz.result}
        />
      );
    case 'none':
      return <EmptyVisualization />;
    default:
      return <EmptyVisualization />;
  }
}

export function VisualizationCanvas({
  step,
  compact = false,
  className = '',
}: VisualizationCanvasProps) {
  const speed = usePlayerStore((state) => state.speed);

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col ${className}`}
      style={motionVars(speed) as React.CSSProperties}
    >
      <div className={`flex shrink-0 justify-end ${compact ? 'pb-0.5' : 'pb-1'}`}>
        <VizLegend type={step?.viz.type} />
      </div>
      <div className="relative min-h-0 flex-1">{renderVisualization(step, compact)}</div>
    </div>
  );
}
