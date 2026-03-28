// src/utils/geminiApi.js
// Gemini API is called exclusively via Firebase Cloud Functions.
// No API key exists on the client. History is managed locally and sent with each request.

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { checkRateLimit } from './security';

const geminiCallable = httpsCallable(functions, 'generateGeminiResponse');
const quizCallable   = httpsCallable(functions, 'generateQuizQuestions');

// ─── Conversation history (managed client-side, sent to CF per request) ──────
let history        = [];
let currentLanguage = null;

export function resetChat() {
  history        = [];
  currentLanguage = null;
}

// ─── Response parser (unchanged — parses the tagged format returned by Krishna) ─
function parseResponse(text) {
  try {
    const hasVerse = text.includes('[VERSE_START]') && text.includes('[VERSE_END]');

    // ── No verse case ──────────────────────────────────────────────────────
    if (!hasVerse) {
      const hasAdvice = /\[ADVICE\]/i.test(text);
      const cleanResponse = text.replace(/\[RESPONSE\]\s*/gi, '').trim();
      if (hasAdvice) {
        const parts = cleanResponse.split(/\[ADVICE\]/i);
        return {
          text: parts[0].trim() || cleanResponse,
          verse: null,
          advice: parts[1] ? parts[1].trim() : null,
        };
      }
      return { text: cleanResponse.replace(/\[ADVICE\]\s*/gi, '').trim(), verse: null, advice: null };
    }

    // ── Verse present case ─────────────────────────────────────────────────
    const beforeVerse     = text.split(/\[VERSE_START\]/i)[0].replace(/\[RESPONSE\]\s*/gi, '').trim();
    const verseBlockMatch = text.match(/\[VERSE_START\]([\s\S]*?)\[VERSE_END\]/i);
    let verse = null;

    if (verseBlockMatch) {
      const vb  = verseBlockMatch[1];
      const get = (tag) => {
        const regex = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[[A-Z_]+\\]|$)`, 'i');
        const match = vb.match(regex);
        return match ? match[1].trim() : '';
      };
      verse = {
        chapter:         parseInt(get('CHAPTER'))        || 2,
        verse:           parseInt(get('VERSE'))          || 47,
        sanskrit:        get('SANSKRIT'),
        transliteration: get('TRANSLITERATION'),
        hindi:           get('MEANING'),
        english:         get('ENGLISH'),
        theme:           get('THEME') || 'Bhagavad Gita',
      };
    }

    const afterVerse  = text.split(/\[VERSE_END\]/i)[1] || '';
    const adviceMatch = afterVerse.match(/\[ADVICE\]\s*([\s\S]*)/i);
    const advice      = adviceMatch ? adviceMatch[1].trim() : afterVerse.replace(/\[ADVICE\]\s*/gi, '').trim();

    return { text: beforeVerse, verse, advice: advice || null };
  } catch {
    return { text: text.replace(/\[.*?\]/g, '').trim(), verse: null, advice: null };
  }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function sendMessageToGemini(userMessage, language, memoryContext = '') {
  if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim())
    return { success: false, error: 'Please enter a message.' };

  const sanitized = userMessage.trim().slice(0, 1000);

  // Client-side rate limit (backup — Cloud Function also enforces server-side)
  if (!checkRateLimit('gemini_chat', 15))
    return { success: false, error: 'Too many requests. Please wait a moment.' };

  // Reset history if language changed mid-session
  const lang = language || 'hinglish';
  if (lang !== currentLanguage) {
    history        = [];
    currentLanguage = lang;
  }

  try {
    const safeHistory = Array.isArray(history)
      ? history.filter(h => h && h.role && Array.isArray(h.parts) && h.parts.length > 0)
      : [];
    const result      = await geminiCallable({ message: sanitized, language: lang, history: safeHistory, memoryContext });
    const responseText = result.data?.text;

    if (!responseText || typeof responseText !== 'string')
      return { success: false, error: 'Received an empty response. Please try again.' };

    // Append this turn to local history for next multi-turn call
    history.push({ role: 'user',  parts: [{ text: sanitized }] });
    history.push({ role: 'model', parts: [{ text: responseText }] });
    if (history.length > 40) history = history.slice(-40); // keep last 20 turns

    const parsed = parseResponse(responseText);
    return {
      success: true,
      data: { text: parsed.text || 'Namaste!', verse: parsed.verse, advice: parsed.advice },
    };
  } catch (e) {
    console.error('Gemini Cloud Function error:', e?.code, e?.message, e);
    // Reset session state on failure to prevent permanent lockout
    history         = [];
    currentLanguage = null;
    if (e.code === 'resource-exhausted')
      return { success: false, error: 'Too many requests. Please wait a moment.' };
    if (e.code === 'unauthenticated')
      return { success: false, error: 'Please log in to use the chat.' };
    if (e.code === 'internal' && e.message)
      return { success: false, error: e.message };
    return { success: false, error: `Connection error (${e.code || 'unknown'}): ${e.message || 'Please check your internet and try again.'}` };
  }
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export async function generateDailyQuiz(language) {
  if (!checkRateLimit('gemini_quiz', 5))
    return { success: false, error: 'Too many quiz requests. Please wait a moment.' };

  try {
    const result = await quizCallable({ language: language || 'english' });
    if (!result.data?.success || !result.data?.data)
      return { success: false, error: 'Invalid quiz data received. Please try again.' };
    return { success: true, data: result.data.data };
  } catch (e) {
    console.error('Quiz Cloud Function error:', e);
    if (e.code === 'resource-exhausted')
      return { success: false, error: 'Too many quiz requests. Please wait a moment.' };
    return { success: false, error: 'Could not generate quiz. Please check your connection and try again.' };
  }
}
