import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_THEME } from '@/constants/themes';
import { applyThemeToDocument, loadStoredTheme, saveStoredTheme } from '@/lib/theme';

const stored = typeof window !== 'undefined' ? loadStoredTheme() : DEFAULT_THEME;

if (typeof window !== 'undefined') {
  applyThemeToDocument(stored);
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    palette: stored.palette,
    mode: stored.mode,
  },
  reducers: {
    setPalette: (state, action) => {
      state.palette = action.payload;
      saveStoredTheme({ palette: state.palette, mode: state.mode });
      applyThemeToDocument({ palette: state.palette, mode: state.mode });
    },
    setMode: (state, action) => {
      state.mode = action.payload;
      saveStoredTheme({ palette: state.palette, mode: state.mode });
      applyThemeToDocument({ palette: state.palette, mode: state.mode });
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      saveStoredTheme({ palette: state.palette, mode: state.mode });
      applyThemeToDocument({ palette: state.palette, mode: state.mode });
    },
    setTheme: (state, action) => {
      state.palette = action.payload.palette ?? state.palette;
      state.mode = action.payload.mode ?? state.mode;
      saveStoredTheme({ palette: state.palette, mode: state.mode });
      applyThemeToDocument({ palette: state.palette, mode: state.mode });
    },
  },
});

export const { setPalette, setMode, toggleMode, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
