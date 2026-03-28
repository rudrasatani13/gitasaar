// src/theme/colors.js
// SERENE OCEAN THEME — Deep midnight ocean with teal, cyan, sky-blue & spiritual gold

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
  info: '#0EA5E9',
};

// SERENE OCEAN — single universal palette
export const SpaceColors = {
  ...shared,

  // Primary: Spiritual Gold — kept sacred & warm for spiritual elements
  primary: '#E0A850',
  primaryLight: '#F5C842',
  primaryDark: '#C28840',

  // Ocean primary accents
  peacockBlue: '#22D3EE',   // Bright ocean cyan — clear & calm
  peacockLight: '#67E8F9',  // Light seafoam

  // Ocean accent tokens (same key names, ocean values)
  nebulaPurple: '#0EA5E9',  // Sky / ocean blue
  nebulaLight: '#38BDF8',   // Lighter sky blue
  cosmicBlue: '#14B8A6',    // Warm teal
  starlightCyan: '#2DD4BF', // Bright turquoise

  // Soft accent fills
  primarySoft: 'rgba(224, 168, 80, 0.14)',
  primaryGlow: 'rgba(224, 168, 80, 0.30)',
  saffronSoft: 'rgba(245, 158, 11, 0.14)',
  lotusSoft: 'rgba(201, 90, 106, 0.14)',
  nebulaSoft: 'rgba(14, 165, 233, 0.14)',   // ocean-blue soft
  cosmicSoft: 'rgba(20, 184, 166, 0.14)',   // teal soft

  // Deep ocean backgrounds — dark like looking up from the ocean floor
  bgPrimary: '#000D1A',
  bgSecondary: '#001428',
  bgTertiary: '#001C35',
  bgCard: '#00213F',
  bgCardElevated: '#002550',
  bgInput: '#001428',

  // Text — cool seafoam-white
  textPrimary: '#E8F7FC',
  textSecondary: '#A8D5E0',
  textMuted: '#4A7A90',
  textOnPrimary: '#000D1A',
  textSanskrit: '#FCD34D',    // Warm amber for Sanskrit verses
  textGold: '#E0A850',

  // Borders
  border: '#0A2540',
  borderLight: '#061A30',
  borderGold: 'rgba(224, 168, 80, 0.28)',
  borderGoldStrong: 'rgba(224, 168, 80, 0.55)',
  divider: '#0A2540',

  // Glassmorphism — ocean glass panes
  glassBg: 'rgba(14, 165, 233, 0.06)',
  glassBgStrong: 'rgba(14, 165, 233, 0.12)',
  glassInputBg: 'rgba(0, 20, 50, 0.72)',
  glassBorder: 'rgba(34, 211, 238, 0.22)',
  glassBorderGold: 'rgba(224, 168, 80, 0.45)',
  glassHighlight: 'rgba(103, 232, 249, 0.08)',
  glassShadow: { shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 12 },
  glassShimmer: 'rgba(34, 211, 238, 0.06)',

  // Ocean gradients
  gradientWarm: ['#000D1A', '#001428', '#001C30'],
  gradientGold: ['#F5C842', '#E0A850', '#C28840'],
  gradientSunrise: ['#001020', '#000C18', '#000D1A'],
  gradientTemple: ['#0EA5E9', '#0D9488'],    // sky blue → teal
  gradientGlass: ['rgba(0,16,36,0.92)', 'rgba(0,12,28,0.82)'],
  gradientHeader: ['rgba(0,13,26,0.98)', 'rgba(0,20,40,0.95)'],
  gradientNebula: ['#0C4A6E', '#164E63', '#000D1A'],
  gradientCosmic: ['#0A3050', '#041830', '#000D1A'],

  // Shadows
  shadow: { shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  shadowGold: { shadowColor: '#E0A850', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 6 },
  shadowLight: { shadowColor: '#22D3EE', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },

  // Status bar
  statusBar: 'light',
};

// Aliases for backward-compat
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