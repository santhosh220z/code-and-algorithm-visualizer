import type { ReactNode } from 'react';
import { useCurrentStep, usePlayerStore } from '../../core/player';
import type { Step } from '../../core/types';
import { NarrationBar } from '../panels/NarrationBar';
import { PlayerControls } from '../player/PlayerControls';
import { ResponsiveInspector, type InspectorTab } from './ResponsiveInspector';

interface LearningStudioProps {
  header: ReactNode;
  canvas: ReactNode;
  inspectorTabs: InspectorTab[];
  inspectorLabel?: string;
  controls?: ReactNode;
  notice?: ReactNode;
  step?: Step | null;
  canvasClassName?: string;
  showNarration?: boolean;
  showTransport?: boolean;
}

export function LearningStudio({
  header,
  canvas,
  inspectorTabs,
  inspectorLabel = 'Learning panel',
  controls,
  notice,
  step,
  canvasClassName = '',
  showNarration = true,
  showTransport = true,
}: LearningStudioProps) {
  const currentStep = useCurrentStep();
  const cursor = usePlayerStore((state) => state.cursor);
  const total = usePlayerStore((state) => state.steps.length);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {header}
      {notice}
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-2 sm:p-3 xl:flex-row">
        <section className="surface-panel order-1 flex min-h-[18rem] min-w-0 flex-1 flex-col overflow-hidden">
          {controls}
          <div className={`canvas-grid canvas-grid-stage relative m-2 min-h-0 flex-1 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] sm:m-3 ${canvasClassName}`}>
            {canvas}
          </div>
          {showNarration && (
            <NarrationBar step={step ?? currentStep} cursor={cursor} total={total} />
          )}
          {showTransport && <PlayerControls />}
        </section>
        <ResponsiveInspector tabs={inspectorTabs} label={inspectorLabel} />
      </div>
    </div>
  );
}
