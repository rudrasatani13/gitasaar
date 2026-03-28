# GitaSaar — गीता सार — PRD

## App Overview
A React Native / Expo spiritual companion app for the Bhagavad Gita with AI-powered guidance.
All 700 verses, Sanskrit/Hindi/English translations, AI chat (Ask Krishna), spiritual journal, meditation timer, mood tracker, streaks, and community.

## Tech Stack
- React Native + Expo SDK 55
- Firebase (Auth + Firestore)
- Google Gemini AI (geminiApi.js)
- Expo AV, Notifications, Haptics, LinearGradient, BlurView

## Architecture
- `/app/App.js` — Root with ErrorBoundary + all context providers
- `/app/src/screens/` — 23 screens
- `/app/src/components/` — 16 components
- `/app/src/theme/` — ThemeContext, colors, contexts for Bookmarks/Journal/Chat/Tracker/Premium etc.
- `/app/src/navigation/AppNavigator.js` — Auth flow + bottom tab navigator
- `/app/src/utils/` — Firebase, Gemini API, haptics, notifications, payment

## User Personas
- Spiritual seekers wanting daily Gita wisdom
- Meditation practitioners
- People seeking AI-guided advice based on Gita
- Hindi/Hinglish/English speakers (multi-language support)

## Core Requirements (Static)
- Authentication: Email/Password, Google, Apple, Phone OTP
- All 700 Bhagavad Gita verses with Sanskrit/Hindi/English
- AI Chat ("Ask Krishna") via Gemini API
- Spiritual Journal with mood tracking
- Daily verse streaks and badges
- Meditation timer with Om chanting
- Community reflections sharing
- Premium subscription via Razorpay/Stripe

## What's Been Implemented

### Space Theme Redesign (2026)
Complete visual overhaul to Space/Black/Stars theme:
- `colors.js` — New `SpaceColors` palette: deep space black backgrounds (#000005), nebula purple (#8B5CF6), cosmic blue (#3B82F6), starlight cyan (#00D4FF), spiritual gold (#E0A850) as primary accent. All glassmorphism tokens updated to cosmic purple-tinted glass.
- `ThemeContext.js` — Space theme always active (isDark=true, no toggle)
- `SpiritualBackground.js` — 90 animated twinkling stars in 5 groups with independent pulse animations + 5 nebula blob overlays (purple, blue, cyan, violet, gold). Replaces all god-image backgrounds.
- `App.js` — Error boundary and loading screen use space black (#000005)
- `AppLogo.js` — Always gold tint
- `AppNavigator.js` — Tab bar with cosmic purple border (rgba(139,92,246,0.30)), dark blur tint
- `SettingsScreen.js` — Dark mode toggle replaced with "Space Theme: Active" badge
- `SplashScreen.js` — Nebula glow pulses (purple + gold) + starfield + colored ring dots
- `OnboardingScreen.js` — Slide colors updated to space palette (gold, cyan, purple, amber, emerald)
- `MeditationScreen.js` — Deep space background
- `VerseReminderScreen.js`, `ProfileEditScreen.js`, `PremiumScreen.js` — All hardcoded light colors fixed
- `ShlokaCard.js` — Sanskrit bubble uses space gradient, chapter badge uses space colors
- `ShareCardModal.js` — New "Cosmos" template (space gradient with stars) added, set as default

## Prioritized Backlog

### P0 — Critical
- None at this time

### P1 — Important
- Shooting star animation for SplashScreen
- Constellation patterns as subtle background overlays per screen
- Space-themed share card template (Cosmos) — done

### P2 — Nice to Have
- Light theme sunset/aurora variant
- Parallax star effect on scroll
- Nebula gradient per screen type (blue for chat, purple for journal, gold for home)

## Next Tasks
- Test on device for star animation performance
- Fine-tune star density/opacity for readability
- Consider adding a "deep space" meditation background effect
