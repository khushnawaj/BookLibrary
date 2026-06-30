export const THEME_MODES = {
  DARK: 'dark',
  LIGHT: 'light',
};

export const THEME_PALETTES = {
  AESTHETIC: 'aesthetic',
  FOREST: 'forest',
  MIDNIGHT: 'midnight',
};

export const DEFAULT_THEME = {
  palette: THEME_PALETTES.AESTHETIC,
  mode: THEME_MODES.DARK,
};

export const PALETTE_META = [
  {
    id: THEME_PALETTES.AESTHETIC,
    name: 'Warm Espresso',
    description: 'A beautiful, warm coffee liquid glass aesthetic',
    swatch: ['#8B4513', '#C0622F', '#D27D2D'],
  },
  {
    id: THEME_PALETTES.FOREST,
    name: 'Emerald Forest',
    description: 'A botanical, deep moss and emerald green book sanctuary',
    swatch: ['#1B4D3E', '#10B981', '#E8F5E9'],
  },
  {
    id: THEME_PALETTES.MIDNIGHT,
    name: 'Midnight Lavender',
    description: 'A modern deep slate indigo and lavender glass aesthetic',
    swatch: ['#1E1B4B', '#6366F1', '#EEF2F6'],
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
  forest: {
    dark: {
      background: '#08100e', // Deep dark forest green-black
      foreground: '#eef7f4', // Light sage text
      card: 'rgba(16, 28, 24, 0.45)', // Translucent deep green glass
      'card-foreground': '#eef7f4',
      popover: 'rgba(10, 20, 17, 0.85)',
      'popover-foreground': '#eef7f4',
      primary: '#10b981', // Emerald accent
      'primary-foreground': '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.05)',
      'secondary-foreground': '#eef7f4',
      muted: 'rgba(255, 255, 255, 0.03)',
      'muted-foreground': '#a3bca9',
      accent: 'rgba(255, 255, 255, 0.08)',
      'accent-foreground': '#ffffff',
      mint: '#047857',
      'mint-foreground': '#ffffff',
      forest: '#10b981',
      success: '#10b981',
      'success-foreground': '#ffffff',
      destructive: '#ef4444',
      'destructive-foreground': '#ffffff',
      border: 'rgba(255, 255, 255, 0.08)',
      input: 'rgba(255, 255, 255, 0.03)',
      ring: '#10b981',
      glass: 'rgba(8, 16, 14, 0.5)',
      sidebar: 'rgba(8, 16, 14, 0.75)',
      'glow-1': 'rgba(16, 185, 129, 0.12)',
      'glow-2': 'rgba(4, 120, 87, 0.08)',
      'glow-3': 'rgba(5, 150, 105, 0.12)',
      'gradient-start': '#1b4d3e',
      'gradient-mid': '#10b981',
      'gradient-end': '#34d399',
      'glass-border': 'rgba(255, 255, 255, 0.11)',
      'glass-highlight': 'rgba(255, 255, 255, 0.08)',
      'selection-bg': 'rgba(16, 185, 129, 0.3)',
    },
    light: {
      background: '#f6faf8', // Pale sage paper background
      foreground: '#102a22', // Deep spruce green text
      card: 'rgba(255, 255, 255, 0.45)', // Translucent pale green glass
      'card-foreground': '#102a22',
      popover: 'rgba(255, 255, 255, 0.85)',
      'popover-foreground': '#102a22',
      primary: '#1b4d3e', // Rich forest green brand primary
      'primary-foreground': '#ffffff',
      secondary: 'rgba(0, 0, 0, 0.03)',
      'secondary-foreground': '#102a22',
      muted: 'rgba(0, 0, 0, 0.02)',
      'muted-foreground': '#4e655d',
      accent: 'rgba(0, 0, 0, 0.05)',
      'accent-foreground': '#102a22',
      mint: '#10b981',
      'mint-foreground': '#ffffff',
      forest: '#059669',
      success: '#16a34a',
      'success-foreground': '#ffffff',
      destructive: '#dc2626',
      'destructive-foreground': '#ffffff',
      border: 'rgba(0, 0, 0, 0.06)',
      input: 'rgba(255, 255, 255, 0.7)',
      ring: '#1b4d3e',
      glass: 'rgba(255, 255, 255, 0.45)',
      sidebar: 'rgba(246, 250, 248, 0.75)',
      'glow-1': 'rgba(27, 77, 62, 0.04)',
      'glow-2': 'rgba(16, 185, 129, 0.03)',
      'glow-3': 'rgba(5, 150, 105, 0.04)',
      'gradient-start': '#1b4d3e',
      'gradient-mid': '#10b981',
      'gradient-end': '#34d399',
      'glass-border': 'rgba(255, 255, 255, 0.45)',
      'glass-highlight': 'rgba(255, 255, 255, 0.7)',
      'selection-bg': 'rgba(27, 77, 62, 0.15)',
    },
  },
  midnight: {
    dark: {
      background: '#09090b', // Near pitch black
      foreground: '#fafafa', // Soft white
      card: 'rgba(18, 18, 24, 0.45)', // Translucent indigo dark glass
      'card-foreground': '#fafafa',
      popover: 'rgba(12, 12, 16, 0.85)',
      'popover-foreground': '#fafafa',
      primary: '#818cf8', // Indigo accent
      'primary-foreground': '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.05)',
      'secondary-foreground': '#fafafa',
      muted: 'rgba(255, 255, 255, 0.03)',
      'muted-foreground': '#a1a1aa',
      accent: 'rgba(255, 255, 255, 0.08)',
      'accent-foreground': '#ffffff',
      mint: '#6366f1',
      'mint-foreground': '#ffffff',
      forest: '#10b981',
      success: '#10b981',
      'success-foreground': '#ffffff',
      destructive: '#ef4444',
      'destructive-foreground': '#ffffff',
      border: 'rgba(255, 255, 255, 0.08)',
      input: 'rgba(255, 255, 255, 0.03)',
      ring: '#818cf8',
      glass: 'rgba(9, 9, 11, 0.5)',
      sidebar: 'rgba(9, 9, 11, 0.75)',
      'glow-1': 'rgba(129, 140, 248, 0.12)',
      'glow-2': 'rgba(99, 102, 241, 0.08)',
      'glow-3': 'rgba(79, 70, 229, 0.12)',
      'gradient-start': '#312e81',
      'gradient-mid': '#4f46e5',
      'gradient-end': '#818cf8',
      'glass-border': 'rgba(255, 255, 255, 0.11)',
      'glass-highlight': 'rgba(255, 255, 255, 0.08)',
      'selection-bg': 'rgba(129, 140, 248, 0.3)',
    },
    light: {
      background: '#f8fafc', // Slate-50 background
      foreground: '#0f172a', // Slate-900 text
      card: 'rgba(255, 255, 255, 0.55)', // Slate light glass card
      'card-foreground': '#0f172a',
      popover: 'rgba(255, 255, 255, 0.85)',
      'popover-foreground': '#0f172a',
      primary: '#4f46e5', // Royal indigo brand primary
      'primary-foreground': '#ffffff',
      secondary: 'rgba(0, 0, 0, 0.03)',
      'secondary-foreground': '#0f172a',
      muted: 'rgba(0, 0, 0, 0.02)',
      'muted-foreground': '#475569',
      accent: 'rgba(0, 0, 0, 0.05)',
      'accent-foreground': '#0f172a',
      mint: '#4f46e5',
      'mint-foreground': '#ffffff',
      forest: '#059669',
      success: '#16a34a',
      'success-foreground': '#ffffff',
      destructive: '#dc2626',
      'destructive-foreground': '#ffffff',
      border: 'rgba(0, 0, 0, 0.06)',
      input: 'rgba(255, 255, 255, 0.7)',
      ring: '#4f46e5',
      glass: 'rgba(255, 255, 255, 0.45)',
      sidebar: 'rgba(248, 250, 252, 0.75)',
      'glow-1': 'rgba(79, 70, 229, 0.04)',
      'glow-2': 'rgba(99, 102, 241, 0.03)',
      'glow-3': 'rgba(129, 140, 248, 0.04)',
      'gradient-start': '#4f46e5',
      'gradient-mid': '#6366f1',
      'gradient-end': '#818cf8',
      'glass-border': 'rgba(255, 255, 255, 0.45)',
      'glass-highlight': 'rgba(255, 255, 255, 0.7)',
      'selection-bg': 'rgba(79, 70, 229, 0.15)',
    },
  },
};
