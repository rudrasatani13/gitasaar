---
name: payment-manager
description: Handles Razorpay order creation, payment verification, premium status, usage limits, and the PremiumGate component for GitaSaar. Invoke when working on billing, subscriptions, usage counters, or paywalls.
disable-model-invocation: true
allowed-tools: Read, Edit, Grep
---

# Payment Manager — GitaSaar

## Scope

You are operating in **payment-manager** mode. You may ONLY read or edit files in the list below. If any fix requires touching a file outside this list, STOP and tell the user which out-of-scope file is needed before proceeding.

### Owned Files

```
src/screens/PremiumScreen.js
src/theme/PremiumContext.js
src/utils/payment.js
src/components/PremiumGate.js
functions/index.js          ← only functions: createRazorpayOrder (lines 35–77), verifyRazorpayPayment (lines 80–129)
```

---

## Architecture

### Pricing
| Plan | India | International |
|------|-------|---------------|
| Monthly | ₹149 | $5.99 |
| Yearly | ₹999 (44% off) | $49.99 (30% off) |

Region is detected via timezone + IP geolocation in `payment.js`. Never hard-code region; always derive it at runtime.

### Payment Flow
1. Client calls `createRazorpayOrder` Cloud Function with `{ planType, region }`.
2. Server validates plan, calculates amount, creates Razorpay order → returns `{ orderId, amount, currency }`.
3. Client opens Razorpay checkout modal with `orderId`.
4. On payment success, client calls `verifyRazorpayPayment` Cloud Function with the three Razorpay fields + `planType`.
5. Server verifies HMAC-SHA256 signature. On success, writes premium fields to Firestore `users/{uid}` via Admin SDK.
6. `PremiumContext` Firestore listener auto-picks up the change; no manual refresh needed.

### Firestore Premium Fields (`users/{uid}`)
```
isPremium        boolean
planType         "monthly" | "yearly"
paymentId        string   (Razorpay payment ID)
orderId          string   (Razorpay order ID)
expiryDate       ISO 8601 string
activatedAt      ISO 8601 string
```
These fields are **write-protected** in Firestore rules — only Cloud Functions (Admin SDK) may write them. Never write them from the client.

### Free Tier Limits (enforced in `PremiumContext.js`)
| Feature | Limit |
|---------|-------|
| Chat messages | 5 / day |
| Audio recitations | 3 / day |
| Quiz plays | 1 / day |
| Bookmark folders | 4 max |
| Templates | 2 available |
| Ads | Shown |

Usage counters are stored in AsyncStorage and synced to Firestore `users/{uid}/heavyData`.

---

## Coding Standards

1. **Never** put `RAZORPAY_SECRET` or `ELEVENLABS_API_KEY` in client code or `.env` — secrets live in Cloud Function environment only.
2. Payment verification **must** happen server-side (Cloud Function). A client-only check is not acceptable.
3. `expiryDate` comparison must use UTC — never `Date()` without explicit UTC handling.
4. Decrement usage counters only after a successful API response, not optimistically.
5. `PremiumGate` must check both `isPremium` AND `expiryDate > now` — an expired premium user is treated as free tier.
6. All `PremiumContext` state updates must be idempotent — the Firestore listener may fire multiple times.

---

## Known Pitfalls

### Razorpay Script Load Failure
- **Where**: `payment.js` (lines 51–63).
- **Risk**: On slow connections, the Razorpay JS SDK fails to load, leaving the checkout button non-functional with no user feedback.
- **Fix**: 3-second load timeout is already implemented. If you modify this section, keep the timeout AND ensure the error state is surfaced in `PremiumScreen.js` as a user-visible message (not just a console log).
- **Do NOT** increase the timeout beyond 5 seconds — it degrades UX worse than a fast failure.

### Usage Counter Race on Cross-Device Login
- **Where**: `PremiumContext.js` (line 115) reads from AsyncStorage; `userDataSync.js` may overwrite AsyncStorage during the same session.
- **Fix**: After `userDataSync` completes, `PremiumContext` must re-hydrate its counter state from AsyncStorage, not from its stale in-memory copy.

### Double-Charge Risk
- **Where**: Network retry logic in `payment.js`.
- **Risk**: If the client retries `createRazorpayOrder` after a timeout, a duplicate order may be created.
- **Fix**: Always check for an existing pending order ID in state before creating a new one. Clear the stored order ID only after `verifyRazorpayPayment` succeeds or the user explicitly cancels.

---

## Do Not Touch

- `src/utils/firebase.js` — owned by `auth-manager`
- `src/theme/ProfileContext.js` — owned by `auth-manager`
- `functions/index.js` lines 195–410 — owned by `media-ai-manager`
- Any navigation or component file outside `PremiumGate.js` — owned by `ui-theme-manager`
