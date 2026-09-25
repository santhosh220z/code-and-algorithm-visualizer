import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  THEME_IDS,
  THEMES,
  THEME_STORAGE_KEY,
  initializeTheme,
  isThemeId,
  resolveStoredTheme,
  useThemeStore,
} from '../core/theme';

describe('theme catalog', () => {
  it('defines four unique theme presets', () => {
    expect(THEME_IDS).toEqual([
      'dark-aurora',
      'light-editorial',
      'retro-terminal',
      'colorful-classroom',
    ]);
    expect(new Set(THEMES.map((theme) => theme.id)).size).toBe(4);
  });

  it('uses Dark Aurora as the default preset', () => {
    expect(DEFAULT_THEME).toBe('dark-aurora');
    expect(THEMES[0].mode).toBe('dark');
  });

  it('recognizes every registered theme id', () => {
    for (const theme of THEME_IDS) expect(isThemeId(theme)).toBe(true);
    expect(isThemeId('unknown-theme')).toBe(false);
    expect(isThemeId(null)).toBe(false);
  });

  it('restores a valid stored theme', () => {
    expect(resolveStoredTheme({ getItem: () => 'retro-terminal' })).toBe('retro-terminal');
  });

  it('falls back safely for missing, invalid, or unavailable storage', () => {
    expect(resolveStoredTheme({ getItem: () => null })).toBe(DEFAULT_THEME);
    expect(resolveStoredTheme({ getItem: () => 'retired-theme' })).toBe(DEFAULT_THEME);
    expect(resolveStoredTheme(null)).toBe(DEFAULT_THEME);
    expect(
      resolveStoredTheme({
        getItem: () => {
          throw new Error('storage unavailable');
        },
      })
    ).toBe(DEFAULT_THEME);
  });
});


describe('theme persistence and preview', () => {
  interface StorageEventLike {
    key: string | null;
    newValue: string | null;
  }

  const stored = new Map<string, string>();
  const historyState = { id: 'router-state', usr: { keep: true } };
  const replaceCalls: Array<{ state: unknown; href: string }> = [];
  const storageListeners: Array<(event: StorageEventLike) => void> = [];
  let currentHref = 'https://app.test/';
  const rootDataset: Record<string, string> = {};

  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => void stored.set(key, value),
      removeItem: (key: string) => void stored.delete(key),
    },
    location: {
      get href() {
        return currentHref;
      },
      get search() {
        return new URL(currentHref).search;
      },
    },
    history: {
      get state() {
        return historyState;
      },
      replaceState: (nextState: unknown, _title: string, next: unknown) => {
        replaceCalls.push({ state: nextState, href: String(next) });
        currentHref = String(next);
      },
    },
    addEventListener: (type: string, handler: (event: StorageEventLike) => void) => {
      if (type === 'storage') storageListeners.push(handler);
    },
  };

  const fakeDocument = {
    documentElement: { dataset: rootDataset },
    querySelector: () => null,
  };

  const globals = globalThis as unknown as Record<string, unknown>;
  const savedWindow = globals.window;
  const savedDocument = globals.document;
  const savedGetComputedStyle = globals.getComputedStyle;

  beforeAll(() => {
    globals.window = fakeWindow;
    globals.document = fakeDocument;
    globals.getComputedStyle = () => ({ getPropertyValue: () => '' });
  });

  afterAll(() => {
    globals.window = savedWindow;
    globals.document = savedDocument;
    globals.getComputedStyle = savedGetComputedStyle;
  });

  beforeEach(() => {
    stored.clear();
    replaceCalls.length = 0;
    // storageListeners is intentionally not cleared: initializeTheme binds the
    // storage handler only once per module instance, so the listener captured by
    // the first test stays valid for the fake window used here.
    currentHref = 'https://app.test/';
    delete rootDataset.theme;
    useThemeStore.setState({ theme: DEFAULT_THEME });
  });

  function emitStorage(key: string | null, newValue: string | null) {
    for (const listener of [...storageListeners]) listener({ key, newValue });
  }

  it('keeps the ?theme preview in the URL but commits it to storage', () => {
    currentHref = 'https://app.test/algo/grid?theme=retro-terminal';

    expect(initializeTheme()).toBe('retro-terminal');
    expect(rootDataset.theme).toBe('retro-terminal');
    expect(new URL(currentHref).searchParams.get('theme')).toBe('retro-terminal');
    expect(stored.get(THEME_STORAGE_KEY)).toBe('retro-terminal');
  });

  it('ignores an unknown ?theme value and restores the stored choice', () => {
    currentHref = 'https://app.test/?theme=not-a-theme';
    stored.set(THEME_STORAGE_KEY, 'light-editorial');

    expect(initializeTheme()).toBe('light-editorial');
    expect(rootDataset.theme).toBe('light-editorial');
  });

  it('clears the preview on selection without discarding history state', () => {
    currentHref = 'https://app.test/?theme=retro-terminal';
    initializeTheme();

    useThemeStore.getState().setTheme('colorful-classroom');

    expect(rootDataset.theme).toBe('colorful-classroom');
    expect(stored.get(THEME_STORAGE_KEY)).toBe('colorful-classroom');
    expect(new URL(currentHref).searchParams.has('theme')).toBe(false);
    expect(currentHref).toBe('https://app.test/');
    expect(replaceCalls).toHaveLength(1);
    expect(replaceCalls[0].state).toBe(historyState);
  });

  it('does not touch history when there is no preview parameter', () => {
    currentHref = 'https://app.test/';
    initializeTheme();

    useThemeStore.getState().setTheme('retro-terminal');

    expect(replaceCalls).toHaveLength(0);
    expect(currentHref).toBe('https://app.test/');
  });

  it('falls back to Dark Aurora when another tab clears the stored theme', () => {
    initializeTheme();
    useThemeStore.getState().setTheme('light-editorial');
    expect(rootDataset.theme).toBe('light-editorial');

    emitStorage(THEME_STORAGE_KEY, null);
    expect(useThemeStore.getState().theme).toBe(DEFAULT_THEME);
    expect(rootDataset.theme).toBe(DEFAULT_THEME);

    emitStorage(THEME_STORAGE_KEY, 'retro-terminal');
    expect(useThemeStore.getState().theme).toBe('retro-terminal');
  });
});
