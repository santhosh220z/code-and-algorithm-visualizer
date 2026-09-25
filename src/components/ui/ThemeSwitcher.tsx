import { useId } from 'react';
import { THEMES, useThemeStore } from '../../core/theme';

export function ThemeSwitcher() {
  const id = useId();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <label htmlFor={id} className="relative inline-flex items-center">
      <span className="sr-only">Color theme</span>
      <select
        id={id}
        value={theme}
        onChange={(event) => setTheme(event.currentTarget.value as typeof theme)}
        className="min-h-10 w-[5.5rem] max-w-[5.5rem] rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-3)] px-2 py-1.5 pr-6 text-xs font-medium text-[var(--color-text)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-accent-border)]"
      >
        {THEMES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.shortName}
          </option>
        ))}
      </select>
    </label>
  );
}
