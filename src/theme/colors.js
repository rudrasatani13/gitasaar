// src/theme/colors.js
// Refined Light + Dark theme palettes

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

  bgPrimary: '#FDF8EF',
  bgSecondary: '#FAF0DE',
  bgTertiary: '#F5E8CC',
  bgCard: '#FFFFFF',
  bgCardElevated: '#FFFDF8',
  bgGlass: 'rgba(255, 253, 248, 0.85)',
  bgInput: '#FFF8ED',
  bgOverlay: 'rgba(26, 18, 9, 0.65)',

  textPrimary: '#1F1206',
  textSecondary: '#4A3420',
  textMuted: '#8C7A66',
  textOnPrimary: '#FFF9F0',
  textSanskrit: '#5C3018',
  textGold: '#C28840',

  border: '#E8D5B7',
  borderLight: '#F0E4D0',
  borderGold: 'rgba(194, 136, 64, 0.35)',
  borderGoldStrong: 'rgba(194, 136, 64, 0.6)',
  divider: '#EAD9C2',

  gradientWarm: ['#FDF8EF', '#FAF0DE', '#F7E9D0'],
  gradientGold: ['#DBA04E', '#C28840', '#A87235'],
  gradientSunrise: ['#FDF8EF', '#FAE5C4', '#F5D9A8'],
  gradientTemple: ['#C28840', '#A02530'],
  gradientGlass: ['rgba(255,253,248,0.95)', 'rgba(255,253,248,0.80)'],
  gradientHeader: ['rgba(253,248,239,0.98)', 'rgba(253,248,239,0.92)'],

  shadow: { shadowColor: '#4A3420', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  shadowGold: { shadowColor: '#C28840', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 },
  shadowLight: { shadowColor: '#4A3420', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  shadowStrong: { shadowColor: '#1A1209', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },

  statusBar: 'dark',
};

export const DarkColors = {
  ...shared,
  // Brighter gold for dark backgrounds
  primary: '#E0A850',
  primaryLight: '#ECBE72',
  primaryDark: '#C28840',
  peacockBlue: '#20B8B4',
  peacockLight: '#28CCC8',

  primarySoft: 'rgba(224, 168, 80, 0.12)',
  primaryGlow: 'rgba(224, 168, 80, 0.20)',
  saffronSoft: 'rgba(232, 121, 58, 0.14)',
  lotusSoft: 'rgba(201, 90, 106, 0.14)',

  // Rich warm dark - temple at midnight feel
  bgPrimary: '#141010',
  bgSecondary: '#261E18',
  bgTertiary: '#302820',
  bgCard: '#1E1814',
  bgCardElevated: '#262018',
  bgGlass: 'rgba(20, 16, 16, 0.92)',
  bgInput: '#1E1814',
  bgOverlay: 'rgba(0, 0, 0, 0.75)',

  // Warm cream text - high contrast
  textPrimary: '#F2E6D4',
  textSecondary: '#D0C0A8',
  textMuted: '#9A8A76',
  textOnPrimary: '#141010',
  textSanskrit: '#ECBE72',
  textGold: '#E0A850',

  // Subtle warm borders
  border: '#382E24',
  borderLight: '#302620',
  borderGold: 'rgba(224, 168, 80, 0.20)',
  borderGoldStrong: 'rgba(224, 168, 80, 0.38)',
  divider: '#322A22',

  // Warm gradients
  gradientWarm: ['#141010', '#1A1412', '#1E1814'],
  gradientGold: ['#ECBE72', '#E0A850', '#C28840'],
  gradientSunrise: ['#141010', '#1E1814', '#28201A'],
  gradientTemple: ['#E0A850', '#A02530'],
  gradientGlass: ['rgba(20,16,16,0.96)', 'rgba(20,16,16,0.86)'],
  gradientHeader: ['rgba(20,16,16,0.98)', 'rgba(20,16,16,0.93)'],

  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 5 },
  shadowGold: { shadowColor: '#E0A850', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 5 },
  shadowLight: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 },
  shadowStrong: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8 },

  statusBar: 'light',
};

export const Colors = LightColors;

export const FontSizes = {
  xxs: 10, xs: 11, sm: 13, md: 15, lg: 17, xl: 21, xxl: 28, xxxl: 36, display: 48,
};

export const Spacing = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48,
};

export const Radius = {
  xs: 6, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, full: 9999,
};