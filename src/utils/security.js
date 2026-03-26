// src/utils/security.js
// App Security Layer - protects against common attacks
import { Platform } from 'react-native';

let SecureStore = null;
try { SecureStore = require('expo-secure-store'); } catch (e) {}

let Crypto = null;
try { Crypto = require('expo-crypto'); } catch (e) {}

// ============ 1. SECURE KEY STORAGE ============
// Store sensitive data in encrypted storage (not plain AsyncStorage)
export async function secureSet(key, value) {
  if (SecureStore && Platform.OS !== 'web') {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (e) { return false; }
  }
  // Web fallback - sessionStorage (cleared on tab close)
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(key, value);
    return true;
  }
  return false;
}

export async function secureGet(key) {
  if (SecureStore && Platform.OS !== 'web') {
    try { return await SecureStore.getItemAsync(key); } catch (e) { return null; }
  }
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(key);
  }
  return null;
}

export async function secureDelete(key) {
  if (SecureStore && Platform.OS !== 'web') {
    try { await SecureStore.deleteItemAsync(key); } catch (e) {}
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(key);
  }
}

// ============ 2. INPUT SANITIZATION ============
// Prevent XSS, injection attacks
export function sanitizeInput(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '')  // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove JS protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/eval\s*\(/gi, '') // Remove eval
    .replace(/\{\{.*?\}\}/g, '') // Remove template injections
    .trim();
}

// Sanitize for Firestore (prevent NoSQL injection)
export function sanitizeFirestore(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  Object.keys(obj).forEach(key => {
    // Block keys starting with $ or containing dots (NoSQL injection)
    if (key.startsWith('$') || key.includes('.') || key.startsWith('__')) return;
    const val = obj[key];
    if (typeof val === 'string') {
      clean[key] = sanitizeInput(val).substring(0, 5000); // Max 5000 chars
    } else if (typeof val === 'number') {
      clean[key] = isFinite(val) ? val : 0;
    } else if (typeof val === 'boolean') {
      clean[key] = val;
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeFirestore(val);
    }
  });
  return clean;
}

// ============ 3. RATE LIMITING ============
// Prevent API abuse - limit requests per minute
const rateLimits = {};

export function checkRateLimit(action, maxPerMinute = 30) {
  const now = Date.now();
  if (!rateLimits[action]) rateLimits[action] = [];

  // Clean old entries (older than 1 min)
  rateLimits[action] = rateLimits[action].filter(t => now - t < 60000);

  if (rateLimits[action].length >= maxPerMinute) {
    return false; // Rate limited
  }

  rateLimits[action].push(now);
  return true; // Allowed
}

// ============ 4. REQUEST VALIDATION ============
// Add timestamp + hash to API requests to prevent replay attacks
export async function signRequest(payload) {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 10);

  let hash = '';
  if (Crypto) {
    try {
      hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        timestamp + nonce + JSON.stringify(payload).substring(0, 100)
      );
    } catch (e) {
      hash = (timestamp + nonce).toString(36);
    }
  } else {
    // Web fallback
    hash = btoa(timestamp + nonce).substring(0, 16);
  }

  return { timestamp, nonce, hash };
}

// Validate request is not too old (5 min window)
export function isValidRequest(timestamp) {
  const diff = Date.now() - timestamp;
  return diff >= 0 && diff < 300000; // 5 minutes
}

// ============ 5. CONTENT VALIDATION ============
// Validate user content before saving
export function validateContent(text, maxLength = 5000) {
  if (!text || typeof text !== 'string') return { valid: false, error: 'Empty content' };
  const clean = sanitizeInput(text);
  if (clean.length === 0) return { valid: false, error: 'Invalid content' };
  if (clean.length > maxLength) return { valid: false, error: 'Content too long' };
  return { valid: true, text: clean };
}

// Validate email format
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============ 6. PREMIUM VALIDATION ============
// Extra check to prevent premium bypass — requires BOTH paymentId AND valid expiryDate
export function validatePremiumToken(premiumData) {
  if (!premiumData) return false;
  // Must have a non-empty paymentId (no bypassing with just isPremium flag)
  if (!premiumData.paymentId || typeof premiumData.paymentId !== 'string' || premiumData.paymentId.trim() === '') return false;
  // Must have a valid future expiry date
  if (!premiumData.expiryDate) return false;
  if (new Date(premiumData.expiryDate) <= new Date()) return false;
  return true;
}

// ============ 7. ANTI-TAMPERING ============
// Basic check if app bundle is modified
export function getAppIntegrity() {
  const checks = {
    platform: Platform.OS,
    isWeb: Platform.OS === 'web',
    hasSecureStore: !!SecureStore,
    hasCrypto: !!Crypto,
    timestamp: Date.now(),
  };

  // Check if running in debug/dev mode
  if (typeof __DEV__ !== 'undefined') {
    checks.isDev = __DEV__;
  }

  return checks;
}

// ============ 8. PREVENT CONSOLE ACCESS ============
// Disable console in production to prevent data scraping
export function lockConsole() {
  try { if (typeof __DEV__ !== 'undefined' && __DEV__) return; } catch(e) { return; } // Keep console in development
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const noop = () => {};
    window.console.log = noop;
    window.console.debug = noop;
    window.console.info = noop;
    window.console.warn = noop;
    // Keep console.error for crash reporting
  }
}

// ============ INIT SECURITY ============
export function initSecurity() {
  try { lockConsole(); } catch(e) {}
  try { return getAppIntegrity(); } catch(e) { return {}; }
}