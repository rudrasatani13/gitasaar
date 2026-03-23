// src/utils/payment.js
// Razorpay for India + International
import { Platform } from 'react-native';

// Ab API key sirf .env se aayegi
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY;

const PLANS = {
  india: {
    monthly: { amount: 14900, currency: 'INR', display: '₹149', label: '₹149/month' },
    yearly:  { amount: 99900, currency: 'INR', display: '₹999', label: '₹999/year', save: '44%', perMonth: '₹83' },
  },
  international: {
    monthly: { amount: 599, currency: 'USD', display: '$5.99', label: '$5.99/month' },
    yearly:  { amount: 4999, currency: 'USD', display: '$49.99', label: '$49.99/year', save: '30%', perMonth: '$4.17' },
  },
};

let detectedRegion = null;

async function detectRegion() {
  if (detectedRegion) return detectedRegion;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) {
      detectedRegion = 'india';
      return 'india';
    }
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    detectedRegion = data.country_code === 'IN' ? 'india' : 'international';
  } catch (e) {
    detectedRegion = 'india';
  }
  return detectedRegion;
}

function getPlans(region) {
  return PLANS[region] || PLANS.international;
}

let razorpayLoaded = false;

function loadRazorpay() {
  if (Platform.OS !== 'web' || razorpayLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    if (window.Razorpay) { razorpayLoaded = true; resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => { razorpayLoaded = true; resolve(); };
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

async function startPayment(planType, userEmail, userName, onSuccess, onFailure) {
  if (Platform.OS !== 'web') {
    onFailure('In-app purchase coming soon');
    return;
  }

  const region = await detectRegion();
  const plans = getPlans(region);
  const plan = plans[planType];
  if (!plan) { onFailure('Invalid plan'); return; }

  await loadRazorpay();
  if (!window.Razorpay) { onFailure('Payment service not available'); return; }

  if (!RAZORPAY_KEY) {
    onFailure('Payment Config Error. Check API Keys.');
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: plan.amount,
    currency: plan.currency,
    name: 'GitaSaar',
    description: 'GitaSaar Premium - ' + (planType === 'yearly' ? 'Yearly' : 'Monthly'),
    prefill: { email: userEmail || '', name: userName || '' },
    theme: { color: '#C28840' },
    handler: (response) => {
      onSuccess({ paymentId: response.razorpay_payment_id, plan: planType, gateway: 'razorpay' });
    },
    modal: {
      ondismiss: () => onFailure('Payment cancelled'),
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (res) => onFailure(res.error.description || 'Payment failed'));
    rzp.open();
  } catch (e) {
    onFailure('Payment error: ' + e.message);
  }
}

export { startPayment, detectRegion, getPlans, PLANS };