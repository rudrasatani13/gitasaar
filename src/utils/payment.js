// src/utils/payment.js
// Production-level Razorpay integration — order creation + server-side verification
// via Firebase Cloud Functions. API key and secret never touch the client.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const REGION_CACHE_KEY = '@gitasaar_region';

// Razorpay KEY_ID is safe to expose on client (it's a public identifier, not the secret)
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY;

// Bug #4 fix: Validate payment key at module load and export helper
export const isPaymentConfigured = () => !!RAZORPAY_KEY_ID && RAZORPAY_KEY_ID.trim() !== '';

// Log warning at module load if payment not configured
if (!isPaymentConfigured()) {
  console.warn('[Payment] EXPO_PUBLIC_RAZORPAY_KEY is not set. Payment features will be unavailable.');
}

const PLANS = {
  india: {
    monthly: { display: '₹149',   label: '₹149/month' },
    yearly:  { display: '₹999',   label: '₹999/year', save: '44%', perMonth: '₹83' },
  },
  international: {
    monthly: { display: '$5.99',  label: '$5.99/month' },
    yearly:  { display: '$49.99', label: '$49.99/year', save: '30%', perMonth: '$4.17' },
  },
};

let detectedRegion = null;

async function detectRegion() {
  if (detectedRegion) return detectedRegion;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) {
      detectedRegion = 'india';
      AsyncStorage.setItem(REGION_CACHE_KEY, detectedRegion).catch(() => {});
      return 'india';
    }
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(tid);
    const data = await res.json();
    detectedRegion = data.country_code === 'IN' ? 'india' : 'international';
    AsyncStorage.setItem(REGION_CACHE_KEY, detectedRegion).catch(() => {});
  } catch {
    try {
      // Use cached region from previous session before guessing from offset
      const cached = await AsyncStorage.getItem(REGION_CACHE_KEY);
      if (cached === 'india' || cached === 'international') {
        detectedRegion = cached;
        return detectedRegion;
      }
      const offset = new Date().getTimezoneOffset();
      detectedRegion = offset === -330 ? 'india' : 'international';
    } catch {
      detectedRegion = 'international';
    }
  }
  return detectedRegion;
}

export function getPlans(region) {
  return PLANS[region] || PLANS.international;
}

let razorpayLoaded = false;

function loadRazorpay() {
  if (Platform.OS !== 'web' || razorpayLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { razorpayLoaded = true; resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => { razorpayLoaded = true; resolve(); };
    s.onerror = () => reject(new Error('Failed to load payment service. Please check your connection.'));
    document.head.appendChild(s);
  });
}

// Cloud Function callables
const createRazorpayOrder   = httpsCallable(functions, 'createRazorpayOrder');
const verifyRazorpayPayment = httpsCallable(functions, 'verifyRazorpayPayment');

export async function startPayment(planType, userEmail, userName, onSuccess, onFailure) {
  if (Platform.OS !== 'web') {
    onFailure('In-app purchase coming soon');
    return;
  }

  // Bug #4 fix: Better error message for missing payment config
  if (!isPaymentConfigured()) {
    onFailure('Payment is not available. The app administrator needs to configure payment settings.');
    console.error('[Payment] EXPO_PUBLIC_RAZORPAY_KEY must be set for payments to work.');
    return;
  }

  const region = await detectRegion();

  // Step 1 — Create order server-side (amount + currency decided by server, not client)
  let orderId, amount, currency;
  try {
    const result = await createRazorpayOrder({ planType, region });
    ({ orderId, amount, currency } = result.data);
  } catch (e) {
    onFailure(e.message || 'Could not create payment order. Please try again.');
    return;
  }

  try {
    await loadRazorpay();
  } catch (e) {
    onFailure(e.message || 'Payment service unavailable. Please check your connection.');
    return;
  }
  if (!window.Razorpay) { onFailure('Payment service not available'); return; }

  const options = {
    key:         RAZORPAY_KEY_ID,
    amount,
    currency,
    order_id:    orderId,           // required for HMAC signature verification
    name:        'GitaSaar',
    description: `GitaSaar Premium — ${planType === 'yearly' ? 'Yearly' : 'Monthly'}`,
    prefill:     { email: userEmail || '', name: userName || '' },
    theme:       { color: '#C28840' },

    // Step 2 — Verify signature server-side before granting premium
    handler: async (response) => {
      try {
        await verifyRazorpayPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_signature:  response.razorpay_signature,
          planType,
        });
        // Premium is now written to Firestore by the Cloud Function.
        // PremiumContext's onSnapshot listener picks it up automatically.
        onSuccess({ paymentId: response.razorpay_payment_id, plan: planType, gateway: 'razorpay' });
      } catch (e) {
        onFailure(e.message || 'Payment verification failed. Please contact support.');
      }
    },

    modal: { ondismiss: () => onFailure('Payment cancelled') },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (res) => onFailure(res.error.description || 'Payment failed'));
    rzp.open();
  } catch (e) {
    onFailure('Payment error: ' + e.message);
  }
}

export { detectRegion, PLANS };
