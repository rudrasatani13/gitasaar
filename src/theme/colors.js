// src/theme/colors.js
// Refined Light + Dark theme palettes for a premium spiritual experience

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

// 🌞 LIGHT MODE: Papyrus/Parchment feel (Warm, pure, readable, soothing on eyes)
export const LightColors = {
  ...shared,
  primary: '#C28840',
  primaryLight: '#DBA04E',
  primaryDark: '#9E6B2C',
  peacockBlue: '#0E6B6B',
  peacockLight: '#14918E',

  primarySoft: 'rgba(194, 136, 64, 0.10)',
  primaryGlow: 'rgba(194, 136, 64, 0.25)',
  saffronSoft: 'rgba(232, 121, 58, 0.12)',
  lotusSoft: 'rgba(201, 90, 106, 0.10)',

  bgPrimary: '#FAFAFA',    // Soft Off-White (Much better than pure white)
  bgSecondary: '#F5F5F5',  // Slight grey for contrast
  bgTertiary: '#EEEEEE',
  bgCard: '#FFFFFF',       // Clean card background
  bgCardElevated: '#FFFFFF',
  bgInput: '#F5F5F5',

  textPrimary: '#212121',  // Dark Charcoal (Pure black is too harsh for reading)
  textSecondary: '#424242',
  textMuted: '#757575',
  textOnPrimary: '#FFFFFF',
  textSanskrit: '#8D6E63', // Soft earthy brown for Sanskrit verses
  textGold: '#B8860B',

  // Subtle borders
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderGold: 'rgba(194, 136, 64, 0.3)',
  borderGoldStrong: 'rgba(194, 136, 64, 0.6)',
  divider: '#E0E0E0',

  // ✨ GLASSMORPHISM TOKENS (Light)
  glassBg: 'rgba(255, 252, 245, 0.55)',
  glassBgStrong: 'rgba(255, 252, 245, 0.82)',
  glassInputBg: 'rgba(255, 255, 255, 0.70)',
  glassBorder: 'rgba(194, 136, 64, 0.18)',
  glassBorderGold: 'rgba(194, 136, 64, 0.40)',
  glassHighlight: 'rgba(255, 255, 255, 0.60)',
  glassShadow: { shadowColor: '#C28840', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  glassShimmer: 'rgba(255, 255, 255, 0.40)',

  // Divine Gradients
  gradientWarm: ['#FDF8EF', '#FAF0DE', '#F5E8CC'],
  gradientGold: ['#D4AF37', '#B8860B', '#9E6B2C'],
  gradientSunrise: ['#FFF8E1', '#FFE0B2', '#FFCC80'],
  gradientTemple: ['#E8793A', '#A02530'],
  gradientGlass: ['rgba(255,252,245,0.75)', 'rgba(255,248,235,0.55)'],
  gradientHeader: ['rgba(253,248,239,0.96)', 'rgba(250,240,222,0.90)'],

  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 },
  shadowGold: { shadowColor: '#C28840', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  shadowLight: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
};

// 🌌 DARK MODE: OLED Pure Black (True pure black backgrounds, clean white text, glowing gold accents)
export const DarkColors = {
  ...shared,
  primary: '#E0A850',       // Rich gold — warm and visible on dark
  primaryLight: '#ECBE72',
  primaryDark: '#C28840',
  peacockBlue: '#2BB5B0',
  peacockLight: '#3DCFCB',

  primarySoft: 'rgba(224, 168, 80, 0.18)',
  primaryGlow: 'rgba(224, 168, 80, 0.32)',
  saffronSoft: 'rgba(232, 121, 58, 0.18)',
  lotusSoft: 'rgba(201, 90, 106, 0.18)',

  // True OLED Black backgrounds
  bgPrimary:       '#000000',   // Pure Black
  bgSecondary:     '#050505',   // Very dark grey
  bgTertiary:      '#0A0A0A',   // Elevated card
  bgCard:          '#0A0A0A',   // Clean dark card
  bgCardElevated:  '#111111',
  bgInput:         '#0A0A0A',

  textPrimary:    '#FFFFFF',   // Pure white
  textSecondary:  '#E0E0E0',   // Light grey
  textMuted:      '#9E9E9E',   // Medium grey
  textOnPrimary:  '#000000',   // Pure black on gold buttons
  textSanskrit:   '#FFCC80',   // Warm glowing amber for Sanskrit
  textGold:       '#E0A850',

  // Clean grey borders
  border:           '#1A1A1A',
  borderLight:      '#111111',
  borderGold:       'rgba(224, 168, 80, 0.28)',
  borderGoldStrong: 'rgba(224, 168, 80, 0.52)',
  divider:          '#1A1A1A',

  // ✨ GLASSMORPHISM TOKENS (Dark) — Clean frosted glass on pure black
  glassBg:         'rgba(255, 255, 255, 0.05)',   // subtle white tint
  glassBgStrong:   'rgba(255, 255, 255, 0.08)',   // slightly stronger
  glassInputBg:    'rgba(255, 255, 255, 0.05)',
  glassBorder:     'rgba(255, 255, 255, 0.12)',   // clean white border
  glassBorderGold: 'rgba(224, 168, 80, 0.45)',    // rich gold border
  glassHighlight:  'rgba(255, 255, 255, 0.10)',   // top shimmer
  glassShadow:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.80, shadowRadius: 24, elevation: 12 },
  glassShimmer:    'rgba(255, 255, 255, 0.05)',

  // Pure dark gradients
  gradientWarm:    ['#000000', '#050505', '#0A0A0A'],  // pure black to subtle grey
  gradientGold:    ['#FFD700', '#E0A850', '#C28840'],
  gradientSunrise: ['#0A0A0A', '#050505', '#000000'],
  gradientTemple:  ['#D4962A', '#A02530'],
  gradientGlass:   ['rgba(15,15,15,0.82)', 'rgba(5,5,5,0.72)'],
  gradientHeader:  ['rgba(0,0,0,0.95)', 'rgba(5,5,5,0.90)'],

  shadow:      { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.80, shadowRadius: 20, elevation: 10 },
  shadowGold:  { shadowColor: '#E0A850', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  shadowLight: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.50, shadowRadius: 12, elevation: 5 },
};

// Responsive Font Scaling (Maintained from your original if you had any, or added for better reading)
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