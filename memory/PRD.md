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

### Critical Bugs Identified:
1. **Missing Audio Assets** - `/app/assets/sounds/` directory missing, causes crash
2. **Firebase API Key Fallback** - Empty string fallback causes auth failures
3. **Premium Offline Lockout** - Paying users lose access when offline

### High Priority Bugs:
4. Payment key validation needed
5. Voice input has no native fallback
6. Post-login navigation race condition
7. Cloud Functions rate limit memory leak

## Prioritized Backlog

### P0 — Critical (Fix Before Release)
- [ ] Create audio assets OR guard meditationAudio.js imports
- [ ] Add Firebase API key startup validation
- [ ] Cache premium status in AsyncStorage for offline

### P1 — Important
- [ ] Add expo-speech-recognition for native voice input
- [ ] Add timeout fallback for cloud restore
- [ ] Validate Razorpay key at startup

### P2 — Nice to Have
- [ ] Firestore-based rate limiting for scale
- [ ] Shooting star animation for SplashScreen
- [ ] Constellation patterns as subtle background overlays

## Next Tasks
1. Fix critical audio assets bug
2. Add Firebase key validation
3. Implement premium offline caching
4. Test complete auth flow on device
5. Test payment flow end-to-end
