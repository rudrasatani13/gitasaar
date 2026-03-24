# GitaSaar

A spiritual wellness app built with Expo + React Native.

GitaSaar combines Bhagavad Gita reading, AI-guided conversations, journaling, reminders, and progress tracking in one experience.

## Features

- Bhagavad Gita verse library (18 chapters, 700 verses) with progress tracking
- Daily verse, bookmarks, streaks, and reading journey stats
- AI chat guidance powered by Gemini (`gemini-2.5-flash`)
- Daily quiz generation from Gita teachings
- Journal and mood tracker flows
- Verse audio recitation with premium gating
- Daily shloka notifications (native devices)
- Multi-language response handling in AI chat
- Firebase authentication (email + web OAuth flows)

## Tech Stack

- Expo SDK 55
- React 19 + React Native 0.83
- React Navigation (native stack + bottom tabs)
- Firebase Auth
- Gemini API (`@google/generative-ai`)
- Razorpay (web checkout)
- Expo modules: Notifications, AV, Secure Store, Image, Haptics, File System, etc.

## Project Structure

```text
GitaSaar/
  App.js
  fetchVerses.js
  src/
    components/      # Reusable UI (cards, audio player, backgrounds, etc.)
    screens/         # App screens (Home, Chat, Verses, Settings, etc.)
    navigation/      # Main navigator and tab setup
    theme/           # Context providers + colors + translation helpers
    utils/           # Integrations (firebase, gemini, payment, notifications)
    data/            # Verse datasets and sample content
```

## Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI (`npx expo` is enough)
- Android Studio / Xcode (for emulator builds)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_GEMINI_KEY=your_gemini_api_key
EXPO_PUBLIC_RAZORPAY_KEY=your_razorpay_key
EXPO_PUBLIC_ELEVEN_KEY=your_elevenlabs_key
```

Notes:
- `EXPO_PUBLIC_*` values are exposed to the client at build time. Do not place server-only secrets here.
- Keep `.env` out of version control.

## Run the App

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Verse Data (Optional Refresh)

`src/data/gitaDatabase.json` is used by the verse library. To regenerate it:

```bash
node fetchVerses.js
```

This downloads all chapters and writes updated data to `src/data/gitaDatabase.json`.

## Notifications

- Native (Android/iOS): uses `expo-notifications`
- Web: limited support, browser Notification API fallback is used where possible

## Build and Release (EAS)

`eas.json` currently includes Android profiles:

- `preview`: internal distribution APK
- `production`: Android App Bundle (AAB)

Example commands:

```bash
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

## Troubleshooting

- App starts but chat fails: verify `EXPO_PUBLIC_GEMINI_KEY`
- Auth errors: verify Firebase project config and API key
- Payments unavailable on native: current payment flow is web-focused
- Verse library loading issue: run `node fetchVerses.js`
- Notification issues on simulator: test on physical device for reliable behavior

## Available Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
```

## License

This project is licensed under the terms in `LICENSE`.

