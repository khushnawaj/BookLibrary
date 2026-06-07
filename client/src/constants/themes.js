export const THEME_MODES = {
  DARK: 'dark',
  LIGHT: 'light',
};

export const THEME_PALETTES = {
  AESTHETIC: 'aesthetic',
};

export const DEFAULT_THEME = {
  palette: THEME_PALETTES.AESTHETIC,
  mode: THEME_MODES.DARK,
};

export const PALETTE_META = [
  {
    id: THEME_PALETTES.AESTHETIC,
    name: 'BookVerse Premium',
    description: 'A beautiful, high-contrast modern aesthetic',
    swatch: ['#000000', '#ffffff', '#3b82f6'],
  },
];

export const THEME_TOKENS = {
  aesthetic: {
    dark: {
      background: '#000000', // Pure black
      foreground: '#ffffff', // Pure white
      card: '#0a0a0a', // Very dark gray
      'card-foreground': '#ffffff',
      popover: '#0a0a0a',
      'popover-foreground': '#ffffff',
      primary: '#ffffff', // White as primary for dark mode
      'primary-foreground': '#000000',
      secondary: '#171717', // Neutral-900
      'secondary-foreground': '#ffffff',
      muted: '#171717',
      'muted-foreground': '#a3a3a3', // Neutral-400
      accent: '#27272a', // Neutral-800
      'accent-foreground': '#ffffff',
      mint: '#3b82f6', // Blue-500 accent
      'mint-foreground': '#ffffff',
      forest: '#10b981', 
      success: '#10b981',
      'success-foreground': '#ffffff',
      destructive: '#ef4444', 
      'destructive-foreground': '#ffffff',
      border: '#262626', // Neutral-800 borders
      input: '#0a0a0a',
      ring: '#ffffff',
      glass: 'rgba(10, 10, 10, 0.65)',
      sidebar: '#000000',
      'glow-1': 'rgba(255, 255, 255, 0.03)',
      'glow-2': 'rgba(255, 255, 255, 0.02)',
      'glow-3': 'rgba(59, 130, 246, 0.05)', 
      'gradient-start': '#ffffff',
      'gradient-mid': '#a3a3a3',
      'gradient-end': '#525252',
      'glass-border': '#262626',
      'glass-highlight': 'rgba(255, 255, 255, 0.05)',
      'selection-bg': 'rgba(255, 255, 255, 0.2)',
    },
    light: {
      background: '#ffffff', 
      foreground: '#000000', 
      card: '#fafafa', // Neutral-50
      'card-foreground': '#000000',
      popover: '#ffffff',
      'popover-foreground': '#000000',
      primary: '#000000', 
      'primary-foreground': '#ffffff',
      secondary: '#f5f5f5', // Neutral-100
      'secondary-foreground': '#000000',
      muted: '#f5f5f5',
      'muted-foreground': '#737373', // Neutral-500
      accent: '#e5e5e5', // Neutral-200
      'accent-foreground': '#000000',
      mint: '#3b82f6', 
      'mint-foreground': '#ffffff',
      forest: '#059669', 
      success: '#16a34a', 
      'success-foreground': '#ffffff',
      destructive: '#dc2626', 
      'destructive-foreground': '#ffffff',
      border: '#e5e5e5', // Neutral-200
      input: '#ffffff',
      ring: '#000000',
      glass: 'rgba(255, 255, 255, 0.8)',
      sidebar: '#fafafa',
      'glow-1': 'rgba(0, 0, 0, 0.02)',
      'glow-2': 'rgba(0, 0, 0, 0.01)',
      'glow-3': 'rgba(59, 130, 246, 0.03)',
      'gradient-start': '#000000', 
      'gradient-mid': '#525252', 
      'gradient-end': '#a3a3a3', 
      'glass-border': '#e5e5e5',
      'glass-highlight': 'rgba(255, 255, 255, 0.8)',
      'selection-bg': 'rgba(0, 0, 0, 0.1)',
    },
  },
};
