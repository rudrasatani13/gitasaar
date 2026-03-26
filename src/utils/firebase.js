// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

// Yahan bhi ab EXPO_PUBLIC variable use kar rahe hain
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "gitasaar2004.firebaseapp.com",
  projectId: "gitasaar2004",
  storageBucket: "gitasaar2004.firebasestorage.app",
  messagingSenderId: "886569809716",
  appId: "1:886569809716:web:ebe280002920f5e5a89761",
};

const app = initializeApp(firebaseConfig);
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
export { auth };

// ========== EMAIL AUTH ==========
export async function signup(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (e) {
    return { success: false, error: e.code || e.message };
  }
}

export async function login(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (e) {
    return { success: false, error: e.code || e.message };
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
  return onAuthStateChanged(auth, callback);
}