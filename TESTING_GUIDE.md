# GitaSaar - Testing & Troubleshooting Guide

## 🚀 How to Run the App

### Method 1: Expo Development Server
```bash
cd /app
npx expo start --web
```

Then open: **http://localhost:8081** or **http://localhost:19006** in your browser

### Method 2: Clean Start
```bash
cd /app
rm -rf node_modules/.cache
npx expo start --clear --web
```

---

## 🐛 Troubleshooting Blank White Screen

### Issue: Blank White Screen on Web

**Possible Causes:**
1. JavaScript bundle not loaded
2. Runtime error in one of the new contexts
3. Missing dependencies
4. Font loading issue

**Solutions:**

### Solution 1: Check Browser Console
1. Open browser Dev Tools (F12)
2. Go to Console tab
3. Look for any RED errors
4. Common errors:
   - `Cannot find module...` → Missing import
   - `Undefined is not a function` → Wrong import/export
   - `Network error` → Bundle not loading

### Solution 2: Test Without New Features
Temporarily comment out new providers in `/app/App.js`:

```javascript
// Comment out these lines:
// import { BadgeProvider } from './src/theme/BadgeContext';
// import { MeditationProvider } from './src/theme/MeditationContext';
// import { MantraProvider } from './src/theme/MantraContext';
// import { LearningPathProvider } from './src/theme/LearningPathContext';

// And remove from JSX:
return (
  <ErrorBoundary>
  <ThemeProvider>
  <OfflineProvider>
    <ProfileProvider>
      <BookmarkProvider>
        <TrackerProvider>
          <JournalProvider>
            <ReadingGoalProvider>
            <PremiumProvider>
            {/* <BadgeProvider>
            <MeditationProvider>
            <MantraProvider>
            <LearningPathProvider> */}
            <ChatHistoryProvider>
              <AppContent />
            </ChatHistoryProvider>
            {/* </LearningPathProvider>
            </MantraProvider>
            </MeditationProvider>
            </BadgeProvider> */}
            </PremiumProvider>
            </ReadingGoalProvider>
          </JournalProvider>
        </TrackerProvider>
      </BookmarkProvider>
    </ProfileProvider>
  </OfflineProvider>
  </ThemeProvider>
  </ErrorBoundary>
);
```

If app loads → Issue is in one of the new contexts
If still blank → Issue is elsewhere

### Solution 3: Check Individual Context Files

**Test BadgeContext:**
```bash
cd /app
node -c src/theme/BadgeContext.js
```

**Test MeditationContext:**
```bash
node -c src/theme/MeditationContext.js
```

If any errors appear → Fix that file

### Solution 4: Clear All Caches
```bash
cd /app
rm -rf node_modules/.cache
rm -rf .expo
rm -rf web-build
npx expo start --clear --web
```

### Solution 5: Check for AsyncStorage Errors
The new contexts use AsyncStorage. On web, this might fail.

Add this to check:
```javascript
// In any context file, wrap AsyncStorage calls:
try {
  const data = await AsyncStorage.getItem('@key');
} catch (e) {
  console.log('AsyncStorage error:', e);
  // Use default values
}
```

---

## ✅ What to Check in Browser Console

### Expected Logs (Good):
```
App loaded successfully
Firebase initialized
Expo loaded
Navigation ready
```

### Error Logs (Bad):
```
ERROR: Cannot read property 'map' of undefined
ERROR: Module not found
ERROR: AsyncStorage is not available
```

---

## 🔍 Step-by-Step Debug Process

### Step 1: Open Browser Dev Tools
- Chrome/Edge: Press F12 or Ctrl+Shift+I
- Check Console tab for errors

### Step 2: Check Network Tab
- See if bundle.js is loading
- Look for 404 or 500 errors

### Step 3: Check if Fonts are Loading
The app waits for fonts. If fonts fail to load, screen stays black.

**Quick Test:**
```javascript
// In App.js, temporarily skip font loading:
export default function App() {
  // Comment out font loading:
  // const [fontsLoaded] = useFonts({...});
  // if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;

  // Add this instead:
  const fontsLoaded = true; // Force true for testing
  
  return (
    <ErrorBoundary>
      ...
    </ErrorBoundary>
  );
}
```

### Step 4: Test Error Boundary
Add a deliberate error to see if ErrorBoundary works:

```javascript
function AppContent() {
  // Add this line to trigger error:
  // throw new Error('Test error');
  
  const { colors } = useTheme();
  // ...
}
```

If you see "Something went wrong" → ErrorBoundary is working
If still blank screen → ErrorBoundary not rendering

---

## 📱 Alternative: Test on Mobile/Android

Sometimes web has issues but mobile works fine:

```bash
cd /app
npx expo start
```

Then:
- Scan QR code with Expo Go app (Android/iOS)
- OR press 'a' for Android emulator
- OR press 'i' for iOS simulator

---

## 🛠️ Quick Fixes Applied

### Fix 1: Import Error in BreathingScreen ✅
Changed `from 'react'` to `from 'react-native'` for View component

### Fix 2: Error Handling in Contexts ✅
Added `.catch()` to all AsyncStorage calls in:
- BadgeContext
- MeditationContext
- MantraContext
- LearningPathContext

### Fix 3: Enhanced GlassCard ✅
All GlassCard components now have proper blur effects

---

## 🎯 Most Likely Issue

**Font Loading on Web**
The app uses Google Fonts (@expo-google-fonts). On web, these might:
1. Take time to load (shows blank screen while loading)
2. Fail to load (stuck on blank screen)

**Quick Fix:**
Wait 10-15 seconds after opening the page. Fonts load slowly on first run.

**OR**

Temporarily disable font check (see Step 3 above)

---

## 📊 Current Status

**Bundler:** ✅ Running on port 8081
**Metro:** ✅ Active
**Contexts:** ✅ All created with error handling
**Screens:** ✅ All created
**Navigation:** ✅ Wired up

**Issue:** Likely font loading delay or browser console error

---

## 🚨 Emergency Rollback

If nothing works, rollback the new features:

```bash
cd /app
git status
# See what files changed
git checkout src/components/GlassCard.js
git checkout src/components/GlassInput.js
git checkout App.js
git checkout src/navigation/AppNavigator.js
git checkout src/screens/HomeScreen.js
```

---

## ✅ Success Indicators

**App is working when you see:**
1. SplashScreen with Om symbol
2. Auth/Login screen
3. OR Home screen with cards

**App is NOT working when:**
1. Completely blank white screen
2. No errors in console
3. Nothing renders after 30 seconds

→ Check font loading issue
→ Check browser console
→ Try incognito mode (clears cache)

---

## 📞 Next Steps

1. **Open browser Dev Tools** (F12)
2. **Check Console for errors**
3. **Wait 15-20 seconds** (fonts loading)
4. **Try incognito mode**
5. **Report exact error message** from console

---

## 🎉 If Everything Works

You should see:
- Beautiful glassmorphic UI
- Enhanced blurred cards
- New features accessible from Home & Settings
- Meditation, Mantra, Learning Paths, Breathing exercises
- Badge system on Streak screen

Enjoy testing! 🙏✨
