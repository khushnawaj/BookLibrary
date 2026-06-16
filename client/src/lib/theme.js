import {
  DEFAULT_THEME,
  THEME_TOKENS,
  THEME_MODES,
  THEME_PALETTES,
} from '@/constants/themes';
import { STORAGE_KEYS } from '@/constants';

export const loadStoredTheme = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (!raw) return DEFAULT_THEME;

    const parsed = JSON.parse(raw);
    const palette = Object.values(THEME_PALETTES).includes(parsed.palette)
      ? parsed.palette
      : DEFAULT_THEME.palette;

    const mode = Object.values(THEME_MODES).includes(parsed.mode)
      ? parsed.mode
      : DEFAULT_THEME.mode;

    return { palette, mode };
  } catch {
    return DEFAULT_THEME;
  }
};

export const saveStoredTheme = ({ palette, mode }) => {
  localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify({ palette, mode }));
};

export const applyThemeToDocument = ({ palette, mode }) => {
  const tokens = THEME_TOKENS[palette]?.[mode] ?? THEME_TOKENS.midnight.dark;
  const root = document.documentElement;

  root.setAttribute('data-palette', palette);
  root.setAttribute('data-mode', mode);
  root.classList.toggle('dark', mode === THEME_MODES.DARK);
  root.classList.toggle('light', mode === THEME_MODES.LIGHT);

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};

export const getThemeTokens = (palette, mode) =>
  THEME_TOKENS[palette]?.[mode] ?? THEME_TOKENS.midnight.dark;
