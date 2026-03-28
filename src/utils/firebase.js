// src/utils/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCredential,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions }  from 'firebase/functions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

// All config values from env — set EXPO_PUBLIC_FIREBASE_API_KEY in eas.json env block for EAS builds
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "gitasaar2004.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "gitasaar2004",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "gitasaar2004.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "886569809716",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:886569809716:web:ebe280002920f5e5a89761",
};

// [AUTH DEBUG] Log config on startup to verify env vars are reaching the build
console.log('[AUTH DEBUG] Firebase config — apiKey present:', !!firebaseConfig.apiKey, '| projectId:', firebaseConfig.projectId, '| platform:', Platform.OS);
if (!firebaseConfig.apiKey) {
  console.warn('[AUTH DEBUG] WARNING: EXPO_PUBLIC_FIREBASE_API_KEY is missing — add it to eas.json env block for EAS builds');
}

// Guard against double-init on hot reload / Fast Refresh
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // initializeAuth throws if already initialized (hot reload / duplicate call) — fall back safely
    console.log('[AUTH DEBUG] initializeAuth fallback to getAuth:', e.message);
    auth = getAuth(app);
  }
}
export { auth };

// Firestore database instance
export const db = getFirestore(app);

// Cloud Functions instance — must match the region set in functions/index.js
export const functions = getFunctions(app, 'asia-south1');

// ========== EMAIL AUTH ==========
export async function signup(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('[AUTH DEBUG] signup success:', result.user?.uid, result.user?.email);
    return { success: true, user: result.user };
  } catch (e) {
    console.log('[AUTH DEBUG] signup error — code:', e.code, '| message:', e.message, '| full:', JSON.stringify(e));
    return { success: false, error: e.code || e.message, code: e.code, message: e.message, raw: JSON.stringify(e) };
  }
}

export async function login(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('[AUTH DEBUG] login success:', result.user?.uid, result.user?.email);
    return { success: true, user: result.user };
  } catch (e) {
    console.log('[AUTH DEBUG] login error — code:', e.code, '| message:', e.message, '| full:', JSON.stringify(e));
    return { success: false, error: e.code || e.message, code: e.code, message: e.message, raw: JSON.stringify(e) };
  }
}

// ========== GOOGLE AUTH ==========
export async function loginWithGoogle() {
  try {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } else {
      return { success: false, error: 'Google login will be available after the APK build on devices.' };
    }
  } catch (e) {
    let msg = e.message;
    if (msg.includes('popup-closed')) msg = 'Login popup was closed. Please try again.';
    if (msg.includes('cancelled')) msg = 'Login was cancelled.';
    return { success: false, error: msg };
  }
}

// ========== APPLE AUTH ==========
export async function loginWithApple() {
  try {
    if (Platform.OS === 'web') {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } else {
      return { success: false, error: 'Apple login sirf iOS pe available hai' };
    }
  } catch (e) {
    let msg = e.message;
    if (msg.includes('popup-closed')) msg = 'Login popup was closed. Please try again.';
    return { success: false, error: msg };
  }
}

// ========== PHONE AUTH ==========
let confirmationResult = null;

export async function sendPhoneOTP(phoneNumber) {
  try {
    if (Platform.OS === 'web') {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
      }

      let formatted = phoneNumber.trim();
      if (!formatted.startsWith('+')) {
        formatted = '+91' + formatted.replace(/^0/, '');
      }

      confirmationResult = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      return { success: true, message: 'OTP sent to ' + formatted };
    } else {
      return { success: false, error: 'Phone login works in browser. Native support will come in APK build.' };
    }
  } catch (e) {
    let msg = e.message;
    if (msg.includes('invalid-phone-number')) msg = 'Invalid phone number. Please use +91XXXXXXXXXX format.';
    if (msg.includes('too-many-requests')) msg = 'Too many attempts. Please try again later.';
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch(err) {}
      window.recaptchaVerifier = null;
    }
    return { success: false, error: msg };
  }
}

export async function verifyPhoneOTP(otp) {
  try {
    if (!confirmationResult) {
      return { success: false, error: 'Pehle OTP bhejo. Phone number daalo aur Send OTP dabao.' };
    }
    const result = await confirmationResult.confirm(otp);
    confirmationResult = null;
    return { success: true, user: result.user };
  } catch (e) {
    let msg = e.message;
    if (msg.includes('invalid-verification-code')) msg = 'Invalid OTP. Please enter the correct code.';
    if (msg.includes('code-expired')) msg = 'OTP expired. Please request a new OTP.';
    return { success: false, error: msg };
  }
}

// ========== FORGOT PASSWORD ==========
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ========== LOGOUT + AUTH STATE ==========
export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    console.log('[AUTH DEBUG] onAuthStateChanged triggered — uid:', user?.uid ?? 'null', '| email:', user?.email ?? 'null');
    try {
      callback(user);
    } catch (e) {
      console.log('[AUTH DEBUG] onAuthChange callback error:', e.message);
    }
  });
}