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

  // Divine Gradients
  gradientWarm: ['#FDF8EF', '#FAF0DE', '#F5E8CC'],
  gradientGold: ['#D4AF37', '#B8860B', '#9E6B2C'],
  gradientSunrise: ['#FFF8E1', '#FFE0B2', '#FFCC80'],
  gradientTemple: ['#E8793A', '#A02530'],
  gradientGlass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
  gradientHeader: ['rgba(250,250,250,0.95)', 'rgba(250,250,250,0.85)'],

  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 },
  shadowGold: { shadowColor: '#C28840', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  shadowLight: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
};

// 🌌 DARK MODE: Cosmic Midnight Theme (Deep space vibe with glowing saffron/gold accents)
export const DarkColors = {
  ...shared,
  primary: '#E0A850',      // Brighter gold/saffron for dark mode contrast
  primaryLight: '#ECBE72',
  primaryDark: '#C28840',
  peacockBlue: '#14918E',
  peacockLight: '#1BC4C0',

  primarySoft: 'rgba(224, 168, 80, 0.15)',
  primaryGlow: 'rgba(224, 168, 80, 0.30)',
  saffronSoft: 'rgba(232, 121, 58, 0.15)',
  lotusSoft: 'rgba(201, 90, 106, 0.15)',

  bgPrimary: '#0A0E17',    // Cosmic Deep Blue/Black (Not pure black, gives a night sky feel)
  bgSecondary: '#121826',
  bgTertiary: '#1A2130',
  bgCard: '#1A2130',       // Elevated night card
  bgCardElevated: '#1E2532',
  bgInput: '#121826',

  textPrimary: '#F0F2F5',  // Soft White
  textSecondary: '#CFD8DC',
  textMuted: '#90A4AE',
  textOnPrimary: '#121212', // Dark text on light gold buttons
  textSanskrit: '#FFCC80',  // Glowing orange-gold for sanskrit text
  textGold: '#FFD700',

  // Subtle warm borders
  border: '#2A3441',
  borderLight: '#1E2532',
  borderGold: 'rgba(224, 168, 80, 0.25)',
  borderGoldStrong: 'rgba(224, 168, 80, 0.45)',
  divider: '#2A3441',

  // Glowing Gradients
  gradientWarm: ['#0A0E17', '#121826', '#1A2130'],
  gradientGold: ['#FFD700', '#E0A850', '#C28840'],
  gradientSunrise: ['#1A2130', '#121826', '#0A0E17'],
  gradientTemple: ['#D4962A', '#A02530'],
  gradientGlass: ['rgba(10,14,23,0.96)', 'rgba(10,14,23,0.86)'],
  gradientHeader: ['rgba(10,14,23,0.98)', 'rgba(10,14,23,0.93)'],

  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 8 },
  shadowGold: { shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  shadowLight: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
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
};