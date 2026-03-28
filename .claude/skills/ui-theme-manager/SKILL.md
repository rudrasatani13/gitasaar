---
name: ui-theme-manager
description: Handles navigation stack, tab bar, theming (light/dark), all reusable UI components, translations, and screen layout for GitaSaar. Invoke when working on navigation, colors, glassmorphism, animations, or any shared component.
disable-model-invocation: true
allowed-tools: Read, Edit, Grep
---

# UI & Theme Manager — GitaSaar

## Scope

You are operating in **ui-theme-manager** mode. You may ONLY read or edit files in the list below. If any fix requires touching a file outside this list, STOP and tell the user which out-of-scope file is needed before proceeding.

### Owned Files

```
src/navigation/AppNavigator.js
src/theme/ThemeContext.js
src/theme/colors.js
src/theme/translations.js
src/theme/useTranslation.js
src/components/AnimatedPressable.js
src/components/AnimatedTabIcon.js
src/components/AppLogo.js
src/components/BottomSheet.js
src/components/CachedImage.js
src/components/GlassCard.js
src/components/GlassInput.js
src/components/MurliIcon.js
src/components/ShareCardModal.js
src/components/ShlokaCard.js
src/components/SkeletonLoader.js
src/components/SpiritualBackground.js
src/utils/navEvents.js
src/utils/haptics.js
App.js
```

Screens are **consumers** of these components. You may read any screen file for context, but only edit a screen's UI/layout code — never its business logic.

---

## Architecture

### Navigation
- **Stack**: React Navigation stack wrapping a bottom tab navigator.
- **Tabs (5)**: Home, Journal, Verses, Chat, Settings.
- **Auth gate**: `AppNavigator.js` listens to `onAuthStateChanged` and conditionally renders the auth stack vs. the main tab stack. Do NOT add navigation logic to individual screens — all auth-driven redirects belong in `AppNavigator.js`.
- **Deep links**: If adding new screens, register them in the linking config inside `AppNavigator.js`.

### Theme System
- **`colors.js`**: Single source of truth for all colors. Contains full Light and Dark palettes. Exports: `LightColors`, `DarkColors`.
- **`ThemeContext.js`**: Provides `{ colors, isDark, toggleTheme }`. Persists preference to AsyncStorage.
- **Usage**: Components call `useContext(ThemeContext)` — never hard-code hex values in component files.

### Color Palette
- Primary (gold): `#C28840`
- Saffron: defined in `colors.js`
- Glassmorphism tokens: `glass`, `glassBorder`, `glassText` — available for both light and dark modes
- Gradients: `gradientWarm`, `gradientGold`, `gradientSunrise`, `gradientTemple`

### Glassmorphism Pattern
All glass-style cards must use `GlassCard.js`. Do NOT re-implement glassmorphism inline in screens. `GlassCard` and `GlassInput` handle the `backdropFilter`/`blurRadius` cross-platform differences.

### Translation System
- `translations.js` is the single source for all UI strings.
- `useTranslation.js` hook returns `t(key)`.
- Never hard-code user-visible strings in component files — always add them to `translations.js` first.
- Supported languages: English, Hindi, Hinglish, Gujarati, Marathi, Tamil, Telugu, Kannada, Bengali, Punjabi, Malayalam, Odia.

---

## Coding Standards

1. **Theming**: All color references must come from `ThemeContext` → `colors.*`. No inline hex strings.
2. **Touch targets**: All interactive elements must use `AnimatedPressable.js`, not raw `TouchableOpacity` or `Pressable`, to ensure consistent haptics and animation.
3. **Haptics**: Call `haptics.light()` / `haptics.medium()` from `haptics.js` on significant interactions — never call `expo-haptics` directly from components.
4. **Skeleton loading**: Use `SkeletonLoader.js` for all async-loaded content — never show an empty container while loading.
5. **Bottom sheets**: Use `BottomSheet.js` for all modal bottom sheets. Do not create new modal patterns.
6. **Tab icons**: `AnimatedTabIcon.js` handles the focused/unfocused animation — do not modify tab icon rendering in `AppNavigator.js` directly.
7. **Images**: Use `CachedImage.js` for any remote image — never use `<Image source={{ uri }}>` directly in screen files.

---

## Known Pitfalls

### Navigation & Login Race Condition
- **Where**: `AppNavigator.js` auth listener + `ProfileContext.js` load timing.
- **Risk**: `onAuthStateChanged` fires before `ProfileContext` has finished reading AsyncStorage, causing a flash of the auth screen or a redirect loop to `ProfileSetupScreen`.
- **Fix**: `AppNavigator.js` must wait for `profileLoaded === true` (from `ProfileContext`) before rendering either stack. Render a neutral `SplashScreen` while `profileLoaded` is false. **Never** navigate based on `user !== null` alone.

### Tab Bar Outline Bug
- **Where**: `AppNavigator.js` tab bar style.
- **Risk**: On Android, the tab bar can render with an unexpected border/outline due to elevation + background color interaction.
- **Fix**: Set `elevation: 0` and `borderTopWidth: 1` explicitly in the tab bar style. Do not use `shadow*` props on the tab bar on Android.

### `navEvents.js` Listener Leak
- **Where**: `src/utils/navEvents.js` custom event emitter.
- **Risk**: Screens that subscribe to nav events via `navEvents.addListener()` and don't call `remove()` on unmount will accumulate duplicate listeners across navigation pushes.
- **Fix**: Always return the `remove()` call from `useEffect`'s cleanup function.

### Dark Mode Flash on Cold Start
- **Where**: `ThemeContext.js` AsyncStorage read on init.
- **Risk**: AsyncStorage is async — on cold start, the app briefly renders in the default (light) theme before reading the user's preference, causing a visible flash.
- **Fix**: Keep `themeLoaded` boolean in `ThemeContext`; render `null` or `SplashScreen` until `themeLoaded === true`.

---

## Do Not Touch

- `src/theme/ProfileContext.js` — owned by `auth-manager`
- `src/theme/PremiumContext.js` — owned by `payment-manager`
- `src/theme/ChatHistoryContext.js`, `BookmarkContext.js`, `JournalContext.js`, `TrackerContext.js`, `ReadingGoalContext.js`, `OfflineContext.js` — data contexts; changes require the owning feature skill
- `src/utils/firebase.js` — owned by `auth-manager`
- `src/utils/payment.js` — owned by `payment-manager`
- `src/utils/geminiApi.js` — owned by `media-ai-manager`
- `functions/index.js` — owned by `payment-manager` / `media-ai-manager`
- `src/components/AudioPlayer.js` — owned by `media-ai-manager`
- `src/components/PremiumGate.js` — owned by `payment-manager`
