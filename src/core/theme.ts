import { create } from 'zustand';

export const THEME_IDS = ['retro-light', 'retro-dark'] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'algoviz:theme:v1';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
}

export const THEMES: readonly ThemeDefinition[] = [
  { id: 'retro-light', name: 'Retro Light', mode: 'light' },
  { id: 'retro-dark', name: 'Retro Dark', mode: 'dark' },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.includes(value as ThemeId);
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function themeForMode(mode: ThemeMode): ThemeId {
  return mode === 'dark' ? 'retro-dark' : 'retro-light';
}

export function modeOf(theme: ThemeId): ThemeMode {
  return theme === 'retro-dark' ? 'dark' : 'light';
}

function prefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia(DARK_QUERY).matches;
  } catch {
    return false;
  }
}

/** Stored choice wins; otherwise follow the operating system. */
export function resolveStoredTheme(
  storage: Pick<Storage, 'getItem'> | null = getStorage(),
  systemPrefersDark = prefersDark()
): ThemeId {
  let stored: string | null = null;
  try {
    stored = storage?.getItem(THEME_STORAGE_KEY) ?? null;
  } catch {
    stored = null;
  }
  if (isThemeId(stored)) return stored;
  return themeForMode(systemPrefersDark ? 'dark' : 'light');
}

function writeStoredTheme(theme: ThemeId): void {
  try {
    getStorage()?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

function updateThemeColor(root: HTMLElement): void {
  if (typeof document === 'undefined') return;
  const color = getComputedStyle(root).getPropertyValue('--meta-theme-color').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (color && meta) meta.setAttribute('content', color);
}

export function applyTheme(theme: ThemeId, root: HTMLElement = document.documentElement): ThemeId {
  const validTheme = isThemeId(theme) ? theme : themeForMode('light');
  root.dataset.theme = validTheme;
  updateThemeColor(root);
  return validTheme;
}

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'retro-light',

  setTheme: (theme) => {
    const applied = applyTheme(theme);
    writeStoredTheme(applied);
    set({ theme: applied });
  },

  toggleMode: () => get().setTheme(themeForMode(modeOf(get().theme) === 'dark' ? 'light' : 'dark')),
}));

let mediaBound = false;

export function initializeTheme(): ThemeId {
  const theme = applyTheme(resolveStoredTheme());
  useThemeStore.setState({ theme });

  // Only meaningful when the visitor has never chosen explicitly.
  if (!mediaBound && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mediaBound = true;
    try {
      const media = window.matchMedia(DARK_QUERY);
      const onChange = (event: MediaQueryListEvent) => {
        let stored: string | null = null;
        try {
          stored = getStorage()?.getItem(THEME_STORAGE_KEY) ?? null;
        } catch {
          stored = null;
        }
        if (isThemeId(stored)) return;
        const applied = applyTheme(themeForMode(event.matches ? 'dark' : 'light'));
        useThemeStore.setState({ theme: applied });
      };
      if (typeof media.addEventListener === 'function') media.addEventListener('change', onChange);
    } catch {
      /* matchMedia unavailable — the stored/OS default already applied */
    }
  }

  return theme;
}
