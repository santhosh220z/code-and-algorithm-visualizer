import type { HTMLAttributes } from 'react';

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text-muted)]',
  accent: 'border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)]',
  success: 'border border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
};

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-[var(--radius-control)] px-2 py-0.5 font-mono text-[11px] ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
