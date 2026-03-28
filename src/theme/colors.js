// src/theme/colors.js
// LIGHT: Warm Spiritual Parchment  |  DARK: Pure Black Starlight Gold

const shared = {
  saffron: '#E8793A',
  maroon: '#7B1830',
  deepRed: '#A02530',
  lotusRose: '#C95A6A',
  turmeric: '#D4962A',
  vermillion: '#D63B2F',
  success: '#2E7D50',
  error: '#C62828',
  warning: '#E88A2E',
  info: '#1565C0',
};

// ─── LIGHT MODE: Warm Spiritual Parchment ───────────────────────────────────
export const LightColors = {
  ...shared,
  primary: '#C28840',
  primaryLight: '#DBA04E',
  primaryDark: '#9E6B2C',
  peacockBlue: '#0E6B6B',
  peacockLight: '#14918E',

  nebulaPurple: '#0E6B6B',
  nebulaLight: '#14918E',
  cosmicBlue: '#0E6B6B',
  starlightCyan: '#14918E',

  primarySoft: 'rgba(194, 136, 64, 0.10)',
  primaryGlow: 'rgba(194, 136, 64, 0.25)',
  saffronSoft: 'rgba(232, 121, 58, 0.12)',
  lotusSoft: 'rgba(201, 90, 106, 0.10)',
  nebulaSoft: 'rgba(14, 107, 107, 0.10)',
  cosmicSoft: 'rgba(14, 107, 107, 0.10)',

  bgPrimary: '#FAFAFA',
  bgSecondary: '#F5F5F5',
  bgTertiary: '#EEEEEE',
  bgCard: '#FFFFFF',
  bgCardElevated: '#FFFFFF',
  bgInput: '#F5F5F5',

  textPrimary: '#212121',
  textSecondary: '#424242',
  textMuted: '#757575',
  textOnPrimary: '#FFFFFF',
  textSanskrit: '#8D6E63',
  textGold: '#B8860B',

  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderGold: 'rgba(194, 136, 64, 0.3)',
  borderGoldStrong: 'rgba(194, 136, 64, 0.6)',
  divider: '#E0E0E0',

  glassBg: 'rgba(255, 252, 245, 0.55)',
  glassBgStrong: 'rgba(255, 252, 245, 0.82)',
  glassInputBg: 'rgba(255, 255, 255, 0.70)',
  glassBorder: 'rgba(194, 136, 64, 0.18)',
  glassBorderGold: 'rgba(194, 136, 64, 0.40)',
  glassHighlight: 'rgba(255, 255, 255, 0.60)',
  glassShadow: { shadowColor: '#C28840', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  glassShimmer: 'rgba(255, 255, 255, 0.40)',

  gradientWarm: ['#FDF8EF', '#FAF0DE', '#F5E8CC'],
  gradientGold: ['#D4AF37', '#B8860B', '#9E6B2C'],
  gradientSunrise: ['#FFF8E1', '#FFE0B2', '#FFCC80'],
  gradientTemple: ['#E8793A', '#A02530'],
  gradientGlass: ['rgba(255,252,245,0.75)', 'rgba(255,248,235,0.55)'],
  gradientHeader: ['rgba(253,248,239,0.96)', 'rgba(250,240,222,0.90)'],
  gradientNebula: ['#FDF8EF', '#FAF0DE', '#F5E8CC'],
  gradientCosmic: ['#FDF8EF', '#FAF0DE', '#F5E8CC'],

  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6 },
  shadowGold: { shadowColor: '#C28840', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 12, elevation: 4 },
  shadowLight: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

  statusBar: 'dark',
};

// ─── DARK MODE: Pure Black Starlight Gold ───────────────────────────────────
export const DarkColors = {
  ...shared,
  primary: '#E0A850',           // Rich spiritual gold
  primaryLight: '#F5C842',
  primaryDark: '#C28840',
  peacockBlue: '#D4AF37',       // Warm metallic gold (secondary accent)
  peacockLight: '#F0C060',

  // Reusing token names — all gold/starlight in dark mode
  nebulaPurple: '#E0A850',      // gold
  nebulaLight: '#F5C842',
  cosmicBlue: '#D4AF37',
  starlightCyan: '#FFF8DC',     // warm starlight white

  primarySoft: 'rgba(224, 168, 80, 0.18)',
  primaryGlow: 'rgba(224, 168, 80, 0.32)',
  saffronSoft: 'rgba(232, 121, 58, 0.18)',
  lotusSoft: 'rgba(201, 90, 106, 0.18)',
  nebulaSoft: 'rgba(224, 168, 80, 0.14)',
  cosmicSoft: 'rgba(212, 175, 55, 0.14)',

  // True PURE BLACK
  bgPrimary:      '#000000',
  bgSecondary:    '#050505',
  bgTertiary:     '#0A0A0A',
  bgCard:         '#0A0A0A',
  bgCardElevated: '#111111',
  bgInput:        '#0A0A0A',

  textPrimary:   '#FFFFFF',
  textSecondary: '#E0E0E0',
  textMuted:     '#9E9E9E',
  textOnPrimary: '#000000',
  textSanskrit:  '#FFCC80',    // warm glowing amber
  textGold:      '#E0A850',

  border:           '#1A1A1A',
  borderLight:      '#111111',
  borderGold:       'rgba(224, 168, 80, 0.28)',
  borderGoldStrong: 'rgba(224, 168, 80, 0.52)',
  divider:          '#1A1A1A',

  // Gold-tinted glass on pure black
  glassBg:         'rgba(224, 168, 80, 0.05)',
  glassBgStrong:   'rgba(224, 168, 80, 0.09)',
  glassInputBg:    'rgba(10, 10, 10, 0.92)',
  glassBorder:     'rgba(224, 168, 80, 0.18)',
  glassBorderGold: 'rgba(224, 168, 80, 0.45)',
  glassHighlight:  'rgba(255, 248, 220, 0.08)',
  glassShadow:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.90, shadowRadius: 24, elevation: 12 },
  glassShimmer:    'rgba(224, 168, 80, 0.05)',

  gradientWarm:    ['#000000', '#050505', '#0A0A0A'],
  gradientGold:    ['#F5C842', '#E0A850', '#C28840'],
  gradientSunrise: ['#0A0A0A', '#050505', '#000000'],
  gradientTemple:  ['#D4962A', '#A02530'],
  gradientGlass:   ['rgba(10,10,10,0.88)', 'rgba(5,5,5,0.78)'],
  gradientHeader:  ['rgba(0,0,0,0.96)', 'rgba(5,5,5,0.92)'],
  gradientNebula:  ['#1A1000', '#0D0800', '#000000'],
  gradientCosmic:  ['#120A00', '#080400', '#000000'],

  shadow:      { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.90, shadowRadius: 20, elevation: 10 },
  shadowGold:  { shadowColor: '#E0A850', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  shadowLight: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.60, shadowRadius: 12, elevation: 5 },

  statusBar: 'light',
};

// SpaceColors alias (dark mode = space)
export const SpaceColors = DarkColors;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  huge: 34,
  xxxl: 32,
};