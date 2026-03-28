---
name: auth-manager
description: Handles all authentication flows, usage limits, profile setup, and cross-device sync for GitaSaar. Invoke this skill when working on login/logout, OTP, social auth, usage counters, profile setup, or Firestore user document logic.
disable-model-invocation: true
allowed-tools: Read, Edit, Grep
---

# Auth Manager — GitaSaar

## Scope

You are operating in **auth-manager** mode. You may ONLY read or edit files in the list below. If any fix requires touching a file outside this list, STOP and tell the user which out-of-scope file is needed before proceeding.

### Owned Files

```
src/screens/AuthScreen.js
src/screens/ProfileSetupScreen.js
src/screens/ProfileEditScreen.js
src/theme/ProfileContext.js
src/utils/firebase.js
src/utils/userDataSync.js
src/utils/security.js
firestore.rules
```

---

## Architecture

- **Auth methods**: email/password, Google Sign-In, Apple Sign-In, phone OTP (reCAPTCHA web only).
- **Auth state listener**: `onAuthStateChanged` in `firebase.js`. Navigation reacts to this; never call `navigate()` directly from an auth callback.
- **User document**: Firestore `users/{uid}`. Mirrored to AsyncStorage via `ProfileContext.js` for offline reads.
- **Profile setup gate**: After first sign-in, `profileSetupComplete` field in Firestore determines whether `ProfileSetupScreen` is shown. Check this field before any navigation decision.
- **Cross-device sync**: `userDataSync.js` restores cloud data on login. Usage counters must use `mergeIfNewer()` (lines 80–90) so a cloud restore never overwrites same-day local usage.

---

## Coding Standards

1. All auth errors must surface the Firebase error code to the user (e.g., `auth/email-already-in-use`). Never swallow errors silently.
2. Never store sensitive credentials (password, token) in AsyncStorage — use `security.js → secureStore()` for native, `sessionStorage` for web.
3. Input fields must pass through `sanitizeInput()` from `security.js` before any Firestore write or auth call.
4. After sign-out, clear AsyncStorage profile cache AND revoke Google/Apple tokens where applicable.
5. Phone OTP: always destroy the reCAPTCHA verifier instance (`window.recaptchaVerifier.clear()`) after use to prevent memory leaks on web.

---

## Known Pitfalls

### Login Race Condition
- **Where**: `ProfileContext.js` initial load + `userDataSync.js` cloud restore happen concurrently.
- **Risk**: If cloud restore fires before `ProfileContext` finishes reading AsyncStorage, the in-memory profile can be momentarily `null`, triggering a false "profile incomplete" redirect loop.
- **Fix**: The `onSyncComplete` callback in `userDataSync.js` must re-read AsyncStorage after sync; `ProfileContext` must not set `profileLoaded = true` until both the local read AND any pending sync are settled.
- **Do NOT**: call `setProfile()` from two concurrent async paths without a mutex/flag guard.

### Daily Usage Counter Overwrite
- **Where**: `PremiumContext.js` (line 115) + `userDataSync.js` (lines 80–90).
- **Risk**: Cross-device login restores cloud snapshot, erasing today's increments on the local device.
- **Fix**: Always call `mergeIfNewer()` for usage objects; never assign the cloud object directly.

### ProfileSetupScreen Loop
- **Where**: `AppNavigator.js` + `ProfileContext.js`.
- **Risk**: If `profileSetupComplete` is not written atomically with the rest of the profile doc, a reload can re-show setup.
- **Fix**: Write `profileSetupComplete: true` in the same Firestore `setDoc` call that writes name/photo; never in a separate update.

---

## Do Not Touch

- `src/theme/PremiumContext.js` — owned by `payment-manager`
- `src/navigation/AppNavigator.js` — owned by `ui-theme-manager`
- `functions/index.js` — owned by `payment-manager` / `media-ai-manager`
- Any component file under `src/components/` — owned by `ui-theme-manager`
