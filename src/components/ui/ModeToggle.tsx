import { modeOf, useThemeStore } from '../../core/theme';

/** Single control for the one Retro family: flips between its light and dark form. */
export function ModeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const isDark = modeOf(theme) === 'dark';
  const label = isDark ? 'Switch to Retro Light' : 'Switch to Retro Dark';

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)] transition-colors hover:border-[var(--color-accent-border)] hover:bg-[var(--color-surface-4)]"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  );
}
