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
    name: 'ShelfForge Premium',
    description: 'A beautiful, warm coffee liquid glass aesthetic',
    swatch: ['#8B4513', '#C0622F', '#D27D2D'],
  },
];

export const THEME_TOKENS = {
  aesthetic: {
    dark: {
      background: '#0d0b09', // Deep dark espresso
      foreground: '#f5f0e8', // Warm latte paper text
      card: 'rgba(28, 22, 18, 0.45)', // Roasted coffee glass card
      'card-foreground': '#f5f0e8',
      popover: 'rgba(20, 16, 13, 0.85)',
      'popover-foreground': '#f5f0e8',
      primary: '#D27D2D', // Glowing caramel accent
      'primary-foreground': '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.05)',
      'secondary-foreground': '#f5f0e8',
      muted: 'rgba(255, 255, 255, 0.03)',
      'muted-foreground': '#c5bbae',
      accent: 'rgba(255, 255, 255, 0.08)',
      'accent-foreground': '#ffffff',
      mint: '#c2410c', // Cinnamon accent
      'mint-foreground': '#ffffff',
      forest: '#10b981',
      success: '#10b981',
      'success-foreground': '#ffffff',
      destructive: '#ef4444',
      'destructive-foreground': '#ffffff',
      border: 'rgba(255, 255, 255, 0.08)',
      input: 'rgba(255, 255, 255, 0.03)',
      ring: '#D27D2D',
      glass: 'rgba(16, 12, 10, 0.5)',
      sidebar: 'rgba(13, 11, 9, 0.75)',
      'glow-1': 'rgba(139, 69, 19, 0.12)', // Warm espresso glows
      'glow-2': 'rgba(192, 98, 47, 0.08)', // Copper glows
      'glow-3': 'rgba(210, 125, 45, 0.12)', // Caramel glows
      'gradient-start': '#8B4513',
      'gradient-mid': '#C0622F',
      'gradient-end': '#D27D2D',
      'glass-border': 'rgba(255, 255, 255, 0.11)',
      'glass-highlight': 'rgba(255, 255, 255, 0.08)',
      'selection-bg': 'rgba(210, 125, 45, 0.3)',
    },
    light: {
      background: '#fdfbf7', // Soft warm cream paper
      foreground: '#1c1a17', // Roasted espresso text
      card: 'rgba(255, 255, 255, 0.45)', // Translucent cream glass card
      'card-foreground': '#1c1a17',
      popover: 'rgba(255, 255, 255, 0.85)',
      'popover-foreground': '#1c1a17',
      primary: '#8B4513', // Saddle brown coffee brand primary
      'primary-foreground': '#ffffff',
      secondary: 'rgba(0, 0, 0, 0.03)',
      'secondary-foreground': '#1c1a17',
      muted: 'rgba(0, 0, 0, 0.02)',
      'muted-foreground': '#5c5044',
      accent: 'rgba(0, 0, 0, 0.05)',
      'accent-foreground': '#1c1a17',
      mint: '#8B4513',
      'mint-foreground': '#ffffff',
      forest: '#059669',
      success: '#16a34a',
      'success-foreground': '#ffffff',
      destructive: '#dc2626',
      'destructive-foreground': '#ffffff',
      border: 'rgba(0, 0, 0, 0.06)',
      input: 'rgba(255, 255, 255, 0.7)',
      ring: '#8B4513',
      glass: 'rgba(255, 255, 255, 0.45)',
      sidebar: 'rgba(253, 251, 247, 0.75)',
      'glow-1': 'rgba(139, 69, 19, 0.04)',
      'glow-2': 'rgba(192, 98, 47, 0.03)',
      'glow-3': 'rgba(210, 125, 45, 0.04)',
      'gradient-start': '#8B4513',
      'gradient-mid': '#C0622F',
      'gradient-end': '#D27D2D',
      'glass-border': 'rgba(255, 255, 255, 0.45)',
      'glass-highlight': 'rgba(255, 255, 255, 0.7)',
      'selection-bg': 'rgba(139, 69, 19, 0.15)',
    },
  },
};
