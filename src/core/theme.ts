import { create } from 'zustand';

export const THEME_IDS = [
  'dark-aurora',
  'light-editorial',
  'retro-terminal',
  'colorful-classroom',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeMode = 'dark' | 'light';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  shortName: string;
  mode: ThemeMode;
  swatches: readonly [string, string, string];
}

export const DEFAULT_THEME: ThemeId = 'dark-aurora';
export const THEME_STORAGE_KEY = 'algoviz:theme:v1';

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'dark-aurora',
    name: 'Dark Aurora',
    shortName: 'Aurora',
    mode: 'dark',
    swatches: ['#080b14', '#35d6c3', '#8b7cff'],
  },
  {
    id: 'light-editorial',
    name: 'Light Editorial',
    shortName: 'Editorial',
    mode: 'light',
    swatches: ['#f7f4ed', '#3157b8', '#d9573b'],
  },
  {
    id: 'retro-terminal',
    name: 'Retro Terminal',
    shortName: 'Retro',
    mode: 'light',
    swatches: ['#f1e1b8', '#9a4a26', '#5e6b2a'],
  },
  {
    id: 'colorful-classroom',
    name: 'Colorful Classroom',
    shortName: 'Classroom',
    mode: 'light',
    swatches: ['#fff8e8', '#6d46e8', '#f06449'],
  },
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

export function resolveStoredTheme(storage: Pick<Storage, 'getItem'> | null = getStorage()): ThemeId {
  try {
    const stored = storage?.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(theme: ThemeId): void {
  try {
    getStorage()?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

function clearThemePreview(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('theme')) return;
  url.searchParams.delete('theme');
  window.history.replaceState(window.history.state, '', url);
}

function persistTheme(theme: ThemeId): void {
  writeStoredTheme(theme);
  clearThemePreview();
}

function updateThemeColor(root: HTMLElement): void {
  if (typeof document === 'undefined') return;
  const color = getComputedStyle(root).getPropertyValue('--meta-theme-color').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (color && meta) meta.setAttribute('content', color);
}

export function applyTheme(theme: ThemeId, root: HTMLElement = document.documentElement): ThemeId {
  const validTheme = isThemeId(theme) ? theme : DEFAULT_THEME;
  root.dataset.theme = validTheme;
  updateThemeColor(root);
  return validTheme;
}

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: DEFAULT_THEME,
  setTheme: (theme) => {
    const applied = applyTheme(theme);
    persistTheme(applied);
    set({ theme: applied });
  },
}));

let storageListenerBound = false;

export function initializeTheme(): ThemeId {
  const requested = typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('theme');
  const theme = applyTheme(isThemeId(requested) ? requested : resolveStoredTheme());
  if (isThemeId(requested)) writeStoredTheme(theme);
  useThemeStore.setState({ theme });

  if (!storageListenerBound && typeof window !== 'undefined') {
    storageListenerBound = true;
    window.addEventListener('storage', (event) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const applied = applyTheme(isThemeId(event.newValue) ? event.newValue : DEFAULT_THEME);
      useThemeStore.setState({ theme: applied });
    });
  }

  return theme;
}
