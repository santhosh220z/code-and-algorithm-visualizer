import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  DARK_QUERY,
  THEMES,
  THEME_IDS,
  THEME_STORAGE_KEY,
  initializeTheme,
  isThemeId,
  modeOf,
  resolveStoredTheme,
  themeForMode,
  useThemeStore,
} from '../core/theme';

describe('retro theme catalog', () => {
  it('is a single family with exactly a light and a dark variant', () => {
    expect(THEME_IDS).toEqual(['retro-light', 'retro-dark']);
    expect(THEMES).toHaveLength(2);
    expect(THEMES.map((t) => t.mode)).toEqual(['light', 'dark']);
  });

  it('maps each mode to its variant and back', () => {
    expect(themeForMode('dark')).toBe('retro-dark');
    expect(themeForMode('light')).toBe('retro-light');
    expect(modeOf('retro-dark')).toBe('dark');
    expect(modeOf('retro-light')).toBe('light');
  });

  it('recognises only the two valid ids', () => {
    for (const id of THEME_IDS) expect(isThemeId(id)).toBe(true);
    expect(isThemeId('dark-aurora')).toBe(false);
    expect(isThemeId('light-editorial')).toBe(false);
    expect(isThemeId('retro-terminal')).toBe(false);
    expect(isThemeId('colorful-classroom')).toBe(false);
    expect(isThemeId(null)).toBe(false);
  });
});

describe('mode resolution', () => {
  it('prefers the stored choice', () => {
    expect(resolveStoredTheme({ getItem: () => 'retro-dark' }, false)).toBe('retro-dark');
    expect(resolveStoredTheme({ getItem: () => 'retro-light' }, true)).toBe('retro-light');
  });

  it('falls back to the operating system when nothing is stored', () => {
    expect(resolveStoredTheme({ getItem: () => null }, true)).toBe('retro-dark');
    expect(resolveStoredTheme({ getItem: () => null }, false)).toBe('retro-light');
  });

  it('ignores a stale theme id left by an older build', () => {
    expect(resolveStoredTheme({ getItem: () => 'colorful-classroom' }, true)).toBe('retro-dark');
    expect(resolveStoredTheme({ getItem: () => 'colorful-classroom' }, false)).toBe('retro-light');
  });

  it('survives missing or throwing storage', () => {
    expect(resolveStoredTheme(null, true)).toBe('retro-dark');
    expect(
      resolveStoredTheme(
        {
          getItem: () => {
            throw new Error('storage unavailable');
          },
        },
        false
      )
    ).toBe('retro-light');
  });
});

describe('mode toggle', () => {
  const stored = new Map<string, string>();
  const rootDataset: Record<string, string> = {};
  let storageListener: ((event: { matches: boolean }) => void) | null = null;
  let systemPrefersDark = false;

  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => void stored.set(key, value),
    },
    matchMedia: (query: string) => ({
      matches: query === DARK_QUERY ? systemPrefersDark : false,
      addEventListener: (_type: string, handler: (e: { matches: boolean }) => void) => {
        storageListener = handler as never;
      },
    }),
  };

  const globals = globalThis as unknown as Record<string, unknown>;
  const savedWindow = globals.window;
  const savedDocument = globals.document;
  const savedGetComputedStyle = globals.getComputedStyle;

  beforeAll(() => {
    globals.window = fakeWindow;
    globals.document = { documentElement: { dataset: rootDataset }, querySelector: () => null };
    globals.getComputedStyle = () => ({ getPropertyValue: () => '' });
  });

  afterAll(() => {
    globals.window = savedWindow;
    globals.document = savedDocument;
    globals.getComputedStyle = savedGetComputedStyle;
  });

  beforeEach(() => {
    stored.clear();
    delete rootDataset.theme;
    systemPrefersDark = false;
    // storageListener is intentionally not cleared: initializeTheme binds the
    // media listener only once per module instance, so the one captured by the
    // first test stays valid for the stable fake window used throughout.
    useThemeStore.setState({ theme: 'retro-light' });
  });

  it('starts from the OS preference when the visitor has not chosen', () => {
    systemPrefersDark = true;
    expect(initializeTheme()).toBe('retro-dark');
    expect(rootDataset.theme).toBe('retro-dark');
  });

  it('flips between the two variants and remembers the choice', () => {
    initializeTheme();
    expect(rootDataset.theme).toBe('retro-light');

    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().theme).toBe('retro-dark');
    expect(rootDataset.theme).toBe('retro-dark');
    expect(stored.get(THEME_STORAGE_KEY)).toBe('retro-dark');

    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().theme).toBe('retro-light');
    expect(stored.get(THEME_STORAGE_KEY)).toBe('retro-light');
  });

  it('honours an explicit choice over a later OS change', () => {
    useThemeStore.getState().setTheme('retro-light');
    expect(storageListener).toBeTypeOf('function');

    // the OS flips to dark, but the visitor explicitly chose light
    storageListener!({ matches: true });
    expect(useThemeStore.getState().theme).toBe('retro-light');
  });

  it('follows the OS while the visitor has made no explicit choice', () => {
    systemPrefersDark = false;
    initializeTheme();
    // simulate the OS flipping to dark with nothing stored
    stored.clear();
    storageListener!({ matches: true });
    expect(useThemeStore.getState().theme).toBe('retro-dark');
  });
});
