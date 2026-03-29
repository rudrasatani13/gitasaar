# GitaSaar — गीता सार — PRD

## App Overview
A React Native / Expo spiritual companion app for the Bhagavad Gita with AI-powered guidance.
All 700 verses, Sanskrit/Hindi/English translations, AI chat (Ask Krishna), spiritual journal, meditation timer, mood tracker, streaks, and community.

## Tech Stack
- React Native + Expo SDK 55
- Firebase (Auth + Firestore)
- Google Gemini AI (via Cloud Functions)
- ElevenLabs TTS (via Cloud Functions)
- Razorpay Payment Gateway
- Expo AV, Notifications, Haptics, LinearGradient, BlurView

## Architecture
- `/app/App.js` — Root with ErrorBoundary + all context providers
- `/app/src/screens/` — 28+ screens
- `/app/src/components/` — 16+ components
- `/app/src/theme/` — ThemeContext, colors, contexts for Bookmarks/Journal/Chat/Tracker/Premium etc.
- `/app/src/navigation/AppNavigator.js` — Auth flow + bottom tab navigator
- `/app/src/utils/` — Firebase, Gemini API, haptics, notifications, payment
- `/app/functions/index.js` — Firebase Cloud Functions (Gemini, Razorpay, ElevenLabs)

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

### Authentication System
- Email/Password signup & login
- Google OAuth (web)
- Apple OAuth (web)
- Phone OTP authentication
- Password reset flow
- Firebase Auth persistence

### Premium Features
- Razorpay integration via Cloud Functions
- Server-side payment verification (HMAC-SHA256)
- Firestore-based premium status (single source of truth)
- Daily usage limits for free users
- Premium gating on 30+ meditation sessions, 6 premium mantras, 6 learning paths
- **NEW: Offline premium status caching** (Jan 2026)

### AI Integration
- Gemini 2.5 Pro via Cloud Functions
- Multi-turn conversation support
- Conversation memory across sessions
- Quiz generation
- ElevenLabs TTS for audio recitation

### New Features (Jan 2026)
- Badge & Milestone system (25+ badges)
- Meditation Library (30+ sessions)
- Breathing Exercises (6 pranayama practices)
- Mantra Library (10 sacred mantras)
- Personalized Learning Paths (6 life-based journeys)
- Enhanced Glassmorphic UI

## QA Audit Findings (Jan 2026)

### Bugs Fixed:

| # | Bug | File | Fix Applied |
|---|-----|------|-------------|
| 1 | Missing Audio Assets Crash | `meditationAudio.js` | Added synthesized audio fallback, removed hard require() |
| 2 | Firebase API Key Empty Fallback | `firebase.js` | Added startup validation with clear error logging |
| 3 | Premium Offline Lockout | `PremiumContext.js` | Added AsyncStorage cache with Firestore error fallback |
| 4 | Payment Key Missing | `payment.js` | Added `isPaymentConfigured()` helper with clear user error |
| 5 | Voice Input Native | `VoiceInput.js` | Added helpful Alert for native users, disabled icon state |
| 6 | Post-Login Race Condition | `AppNavigator.js` | Added 5s timeout fallback for cloud restore |
| 7 | Rate Limit Memory Leak | `functions/index.js` | Added periodic cleanup (every 5 min) with TTL |

### Changes Summary:
- **meditationAudio.js**: Audio files are now optional; system uses Web Audio API synthesized sounds as fallback
- **firebase.js**: `isFirebaseConfigValid()` export added for UI to check config status
- **PremiumContext.js**: Premium status cached in `@gitasaar_premium_cache` for offline resilience
- **payment.js**: `isPaymentConfigured()` export added for pre-flight checks
- **VoiceInput.js**: Shows disabled mic icon on native with helpful alert on tap
- **AppNavigator.js**: Cloud restore now has 5-second timeout to prevent stuck onboarding
- **functions/index.js**: Rate limiter cleans up stale entries every 5 minutes

## Prioritized Backlog

### P0 — Critical (DONE)
- [x] Audio assets crash fix
- [x] Firebase API key validation
- [x] Premium offline caching
- [x] Payment key validation
- [x] Voice input native feedback
- [x] Post-login race condition fix
- [x] Rate limit memory leak fix

### P1 — Important
- [ ] Add expo-speech-recognition for native voice input
- [ ] Add real audio files to assets/sounds/ for better meditation experience
- [ ] Implement Firestore-based rate limiting for scale (if needed)

### P2 — Nice to Have
- [ ] Shooting star animation for SplashScreen
- [ ] Constellation patterns as subtle background overlays
- [ ] In-app purchase for iOS/Android native

## Next Tasks
1. Deploy Cloud Functions with new rate limit cleanup
2. Test complete auth flow on device
3. Test payment flow end-to-end
4. Test offline premium access scenario
5. Consider adding real audio assets for meditation
