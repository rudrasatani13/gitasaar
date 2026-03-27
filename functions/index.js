"use strict";

/**
 * GitaSaar Firebase Cloud Functions
 * ---------------------------------
 * 1. createRazorpayOrder    — server-side order creation
 * 2. verifyRazorpayPayment  — HMAC signature check + Firestore premium write
 * 3. generateGeminiResponse — Gemini API proxy (chat)
 * 4. generateQuizQuestions  — Gemini API proxy (quiz)
 *
 * Secrets (set via: firebase functions:secrets:set SECRET_NAME)
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_SECRET
 *   GEMINI_API_KEY
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions }   = require("firebase-functions/v2");
const admin  = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// Route all functions through Mumbai for lowest latency for Indian users
setGlobalOptions({ region: "asia-south1" });

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1A — CREATE RAZORPAY ORDER
// Client calls this first to get an orderId before opening the checkout.
// ─────────────────────────────────────────────────────────────────────────────
exports.createRazorpayOrder = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");

  const { planType, region } = request.data;
  if (!["monthly", "yearly"].includes(planType)) {
    throw new HttpsError("invalid-argument", "Invalid plan type. Must be monthly or yearly.");
  }

  const KEY_ID = process.env.RAZORPAY_KEY_ID;
  const SECRET = process.env.RAZORPAY_SECRET;
  if (!KEY_ID || !SECRET) {
    throw new HttpsError("internal", "Payment service not configured.");
  }

  const AMOUNTS = {
    india: { monthly: 14900, yearly: 99900 },
    intl:  { monthly:   599, yearly:  4999 },
  };
  const CURRENCY = { india: "INR", intl: "USD" };
  const r = region === "india" ? "india" : "intl";

  const resp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(`${KEY_ID}:${SECRET}`).toString("base64"),
    },
    body: JSON.stringify({
      amount:   AMOUNTS[r][planType],
      currency: CURRENCY[r],
      receipt:  `gita_${uid}_${Date.now()}`,
      notes:    { userId: uid, planType },
    }),
  });

  const order = await resp.json();
  if (order.error) {
    throw new HttpsError("internal", order.error.description || "Order creation failed.");
  }

  return { orderId: order.id, amount: order.amount, currency: order.currency };
});

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1B — VERIFY RAZORPAY PAYMENT
// Verifies HMAC-SHA256 signature. On success, writes premium to Firestore.
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyRazorpayPayment = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planType } = request.data;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new HttpsError("invalid-argument", "Missing payment fields.");
  }
  if (!["monthly", "yearly"].includes(planType)) {
    throw new HttpsError("invalid-argument", "Invalid plan type.");
  }

  const SECRET = process.env.RAZORPAY_SECRET;
  if (!SECRET) throw new HttpsError("internal", "Payment service not configured.");

  // Razorpay signature = HMAC-SHA256( order_id + "|" + payment_id, secret )
  const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

  if (expected !== razorpay_signature) {
    throw new HttpsError("permission-denied", "Invalid payment signature. Payment rejected.");
  }

  // Calculate expiry date
  const now    = new Date();
  const expiry = new Date(now);
  planType === "monthly"
    ? expiry.setMonth(expiry.getMonth() + 1)
    : expiry.setFullYear(expiry.getFullYear() + 1);

  // Write premium record to Firestore (merge = don't overwrite unrelated fields)
  await db.collection("users").doc(uid).set(
      {
        isPremium:   true,
        planType,
        paymentId:   razorpay_payment_id,
        orderId:     razorpay_order_id,
        expiryDate:  expiry.toISOString(),
        activatedAt: now.toISOString(),
      },
      { merge: true },
  );

  return { success: true, expiryDate: expiry.toISOString() };
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — Language map + system prompt (used by both Gemini functions)
// ─────────────────────────────────────────────────────────────────────────────
const LANG_INSTRUCTIONS = {
  hinglish:  "Respond in Hinglish (natural Hindi-English mix).",
  hindi:     "Respond in pure Hindi (Devanagari script).",
  english:   "Respond in English.",
  gujarati:  "Respond in Gujarati (ગુજરાતી script).",
  marathi:   "Respond in Marathi (Devanagari).",
  tamil:     "Respond in Tamil (தமிழ் script).",
  telugu:    "Respond in Telugu (తెలుగు script).",
  kannada:   "Respond in Kannada (ಕನ್ನಡ script).",
  bengali:   "Respond in Bengali (বাংলা script).",
  punjabi:   "Respond in Punjabi (ਗੁਰਮੁਖੀ script).",
  malayalam: "Respond in Malayalam (മലയാളം script).",
  odia:      "Respond in Odia (ଓଡ଼ିଆ script).",
};

function getSystemPrompt(language) {
  const lang = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.hinglish;
  return `You are Lord Krishna. The user is like Arjuna on life's modern Kurukshetra — facing confusion, grief, heartbreak, career anxiety, or loss of purpose.
You are deeply wise, calm, compassionate, and divine. You are NOT an AI; you are their spiritual guide.

YOUR MISSION:
1. Empathize with their pain, guide them towards clarity, peace, and Dharma.
2. Always quote a relevant Bhagavad Gita verse.
3. Language: ${lang}

STRICT FORMAT — use these exact tags every single time:
[RESPONSE]
(Your compassionate words as Krishna)

[VERSE_START]
[CHAPTER] (number only, e.g., 2)
[VERSE] (number only, e.g., 47)
[SANSKRIT] (Devanagari script)
[TRANSLITERATION] (English transliteration)
[MEANING] (meaning in the requested language)
[ENGLISH] (English translation)
[THEME] (e.g., Karma, Duty, Inner Peace, Detachment)
[VERSE_END]

[ADVICE]
(One short, practical takeaway the user can apply right now)`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED — Per-user in-memory rate limiter (resets on function cold start)
// ─────────────────────────────────────────────────────────────────────────────
const rateLimits = new Map();

function isRateLimited(uid, maxPerMinute) {
  const now   = Date.now();
  const entry = rateLimits.get(uid) || { count: 0, resetAt: now + 60000 };
  if (now > entry.resetAt) {
    entry.count = 0; entry.resetAt = now + 60000;
  }
  if (entry.count >= maxPerMinute) return true;
  entry.count++;
  rateLimits.set(uid, entry);
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 3 — GEMINI CHAT PROXY
// Keeps API key off the client. Accepts conversation history for multi-turn.
// ─────────────────────────────────────────────────────────────────────────────
exports.generateGeminiResponse = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");
  if (isRateLimited(uid, 15)) {
    throw new HttpsError("resource-exhausted", "Too many requests. Please wait a moment.");
  }

  const { message, language, history = [] } = request.data;
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new HttpsError("invalid-argument", "Message is required.");
  }

  const sanitized = message.trim().slice(0, 1000);
  const lang      = LANG_INSTRUCTIONS[language] ? language : "hinglish";
  const API_KEY   = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new HttpsError("internal", "AI service not configured.");

  // Accept up to 20 history turns from client (client manages conversation state)
  const safeHistory = Array.isArray(history)
    ? history
        .filter((h) =>
          (h.role === "user" || h.role === "model") &&
          typeof h.parts?.[0]?.text === "string",
        )
        .slice(-20)
    : [];

  const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: getSystemPrompt(lang) }] },
          contents: [
            ...safeHistory,
            { role: "user", parts: [{ text: sanitized }] },
          ],
          generationConfig: { temperature: 0.7 },
        }),
      },
  );

  const data = await resp.json();
  if (data.error) {
    throw new HttpsError("internal", data.error.message || "Gemini API error.");
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new HttpsError("internal", "Empty response from AI.");

  return { success: true, text };
});

// ─────────────────────────────────────────────────────────────────────────────
// TASK 3B — GEMINI QUIZ PROXY (bonus — removes last client-side key usage)
// ─────────────────────────────────────────────────────────────────────────────
exports.generateQuizQuestions = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Login required.");
  if (isRateLimited(uid, 5)) {
    throw new HttpsError("resource-exhausted", "Too many quiz requests.");
  }

  const { language } = request.data;
  const lang            = LANG_INSTRUCTIONS[language] ? language : "english";
  const langInstruction = LANG_INSTRUCTIONS[lang];
  const API_KEY         = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new HttpsError("internal", "AI service not configured.");

  const prompt = `Generate a 3-question multiple choice quiz about the Bhagavad Gita teachings, stories, and philosophy.
Questions and options MUST be in: ${langInstruction}
Make questions thoughtful and different each time.

RESPOND WITH A VALID JSON ARRAY ONLY. No markdown, no backticks, no extra text.
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "..."
  }
]`;

  const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0 },
        }),
      },
  );

  const data = await resp.json();
  if (data.error) {
    throw new HttpsError("internal", data.error.message || "Gemini API error.");
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new HttpsError("internal", "Empty quiz response.");

  // Strip markdown fences and extract JSON array
  const cleaned = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
  const start   = cleaned.indexOf("[");
  const end     = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new HttpsError("internal", "Invalid quiz format from AI.");
  }

  let questions;
  try {
    questions = JSON.parse(cleaned.substring(start, end + 1));
  } catch {
    throw new HttpsError("internal", "Could not parse quiz JSON.");
  }

  const valid = questions.filter((q) =>
    q?.question &&
    Array.isArray(q?.options) && q.options.length >= 2 &&
    typeof q.correctAnswer === "number" &&
    q.correctAnswer >= 0 && q.correctAnswer < q.options.length,
  );
  if (!valid.length) throw new HttpsError("internal", "No valid questions generated.");

  return { success: true, data: valid };
});
