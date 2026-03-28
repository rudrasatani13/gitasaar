// src/theme/colors.js
// SPACE / COSMOS THEME — Deep space black with nebula purple, cosmic blue & spiritual gold

const shared = {
  saffron: '#F59E0B',
  maroon: '#7B1830',
  deepRed: '#A02530',
  lotusRose: '#C95A6A',
  turmeric: '#F59E0B',
  vermillion: '#EF4444',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// SPACE THEME — single universal palette
export const SpaceColors = {
  ...shared,

  // Primary: Spiritual Gold (sacred & warm)
  primary: '#E0A850',
  primaryLight: '#F5C842',
  primaryDark: '#C28840',

  // Cosmic accent colours
  peacockBlue: '#00D4FF',     // Cosmic cyan
  peacockLight: '#38F5FF',

  // Extra space palette tokens
  nebulaPurple: '#8B5CF6',
  nebulaLight: '#A78BFA',
  cosmicBlue: '#3B82F6',
  starlightCyan: '#22D3EE',

  // Soft accent fills
  primarySoft: 'rgba(224, 168, 80, 0.14)',
  primaryGlow: 'rgba(224, 168, 80, 0.30)',
  saffronSoft: 'rgba(245, 158, 11, 0.14)',
  lotusSoft: 'rgba(201, 90, 106, 0.14)',
  nebulaSoft: 'rgba(139, 92, 246, 0.14)',
  cosmicSoft: 'rgba(59, 130, 246, 0.14)',

  // Deep space backgrounds
  bgPrimary: '#000005',
  bgSecondary: '#02020C',
  bgTertiary: '#05051A',
  bgCard: '#08081E',
  bgCardElevated: '#0C0C26',
  bgInput: '#060614',

  // Text — starlight white with subtle space-blue cast
  textPrimary: '#F0F0FF',
  textSecondary: '#B8B8E0',
  textMuted: '#60609A',
  textOnPrimary: '#000000',
  textSanskrit: '#FCD34D',   // Warm amber for Sanskrit verses
  textGold: '#E0A850',

  // Borders
  border: '#1A1A35',
  borderLight: '#10102A',
  borderGold: 'rgba(224, 168, 80, 0.28)',
  borderGoldStrong: 'rgba(224, 168, 80, 0.55)',
  divider: '#1A1A35',

  // Glassmorphism — cosmic glass panes
  glassBg: 'rgba(139, 92, 246, 0.07)',
  glassBgStrong: 'rgba(139, 92, 246, 0.13)',
  glassInputBg: 'rgba(25, 25, 70, 0.65)',
  glassBorder: 'rgba(139, 92, 246, 0.24)',
  glassBorderGold: 'rgba(224, 168, 80, 0.45)',
  glassHighlight: 'rgba(200, 200, 255, 0.08)',
  glassShadow: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.40, shadowRadius: 24, elevation: 12 },
  glassShimmer: 'rgba(139, 92, 246, 0.06)',

  // Space gradients
  gradientWarm: ['#000005', '#02020E', '#060516'],
  gradientGold: ['#F5C842', '#E0A850', '#C28840'],
  gradientSunrise: ['#080810', '#04040C', '#000005'],
  gradientTemple: ['#8B5CF6', '#4C1D95'],
  gradientGlass: ['rgba(8,8,30,0.90)', 'rgba(4,4,20,0.80)'],
  gradientHeader: ['rgba(0,0,5,0.98)', 'rgba(2,2,14,0.95)'],
  gradientNebula: ['#1E1B4B', '#0F172A', '#000005'],
  gradientCosmic: ['#0C0A3E', '#020214', '#000000'],

  // Shadows
  shadow: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8 },
  shadowGold: { shadowColor: '#E0A850', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  shadowLight: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },

  // Status bar
  statusBar: 'light',
};

// Aliases kept for backward-compat with existing imports
export const LightColors = SpaceColors;
export const DarkColors = SpaceColors;

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