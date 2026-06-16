import { useCallback } from 'react';
import { THEME_MODES } from '@/constants/themes';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { setMode, setPalette, toggleMode } from './themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { palette, mode } = useAppSelector((state) => state.theme);

  const isDark = mode === THEME_MODES.DARK;

  const changePalette = useCallback(
    (nextPalette) => dispatch(setPalette(nextPalette)),
    [dispatch]
  );

  const changeMode = useCallback(
    (nextMode) => dispatch(setMode(nextMode)),
    [dispatch]
  );

  const toggleColorMode = useCallback(() => dispatch(toggleMode()), [dispatch]);

  return {
    palette,
    mode,
    isDark,
    setPalette: changePalette,
    setMode: changeMode,
    toggleMode: toggleColorMode,
  };
};
