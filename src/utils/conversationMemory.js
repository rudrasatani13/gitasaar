// src/utils/conversationMemory.js
// Krishna's Memory — persists across sessions so every conversation feels personal

import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORY_KEY = '@gitasaar_krishna_memory';

// Topic keywords for client-side extraction
const TOPIC_MAP = {
  career:        ['career', 'job', 'work', 'office', 'boss', 'salary', 'business', 'naukri', 'kaam'],
  relationship:  ['relationship', 'love', 'partner', 'wife', 'husband', 'girlfriend', 'boyfriend', 'pyaar', 'rishta'],
  family:        ['family', 'parents', 'mother', 'father', 'siblings', 'parivar', 'maa', 'papa'],
  anxiety:       ['anxiety', 'anxious', 'stress', 'stressed', 'worried', 'worry', 'fear', 'nervous', 'tension', 'ghabra'],
  sadness:       ['sad', 'depressed', 'lonely', 'hopeless', 'empty', 'udas', 'akela'],
  purpose:       ['purpose', 'meaning', 'direction', 'lost', 'confused', 'goal', 'zindagi', 'maqsad'],
  spirituality:  ['spiritual', 'meditation', 'dharma', 'karma', 'god', 'soul', 'moksha', 'bhakti', 'dhyan'],
  anger:         ['angry', 'anger', 'frustration', 'irritated', 'gussa', 'krodh'],
  confidence:    ['confidence', 'self-doubt', 'scared', 'weak', 'himmat', 'darna'],
};

function extractTopics(messages) {
  const found = new Set();
  messages.forEach((m) => {
    if (m.type !== 'user') return;
    const txt = (m.text || '').toLowerCase();
    Object.entries(TOPIC_MAP).forEach(([topic, keywords]) => {
      if (keywords.some((kw) => txt.includes(kw))) found.add(topic);
    });
  });
  return [...found].slice(0, 6);
}

// ─── Load stored memory ───────────────────────────────────────────────────────
export async function loadMemory() {
  try {
    const raw = await AsyncStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Update memory after a conversation session ───────────────────────────────
export async function updateMemory(messages, userName) {
  try {
    const existing = (await loadMemory()) || {};
    const userMessages = messages.filter((m) => m.type === 'user' && m.id !== 'welcome');
    if (userMessages.length === 0) return existing;

    const newTopics = extractTopics(userMessages);
    const mergedTopics = [...new Set([...(existing.topics || []), ...newTopics])].slice(0, 8);

    // Keep last 2 user messages as context snippet
    const lastContext = userMessages
      .slice(-2)
      .map((m) => m.text.slice(0, 120))
      .join('; ');

    const updated = {
      userName:     userName || existing.userName || '',
      firstVisit:   existing.firstVisit || new Date().toISOString(),
      lastVisit:    new Date().toISOString(),
      visitCount:   (existing.visitCount || 0) + 1,
      topics:       mergedTopics,
      lastContext:  lastContext || existing.lastContext || '',
      messageCount: (existing.messageCount || 0) + userMessages.length,
    };

    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

// ─── Clear all memory ─────────────────────────────────────────────────────────
export async function clearMemory() {
  try {
    await AsyncStorage.removeItem(MEMORY_KEY);
  } catch {}
}

// ─── Format memory as a concise context string for Gemini system prompt ───────
export function formatMemoryForPrompt(memory, userName) {
  if (!memory || memory.visitCount < 2) return '';

  const name = userName || memory.userName || 'the seeker';
  const lines = [`User's name: ${name}`];

  const daysSince = memory.lastVisit
    ? Math.floor((Date.now() - new Date(memory.lastVisit).getTime()) / 86400000)
    : null;
  const visitLabel =
    daysSince === 0
      ? 'earlier today'
      : daysSince === 1
      ? 'yesterday'
      : `${daysSince} days ago`;

  lines.push(`This is their visit #${memory.visitCount} — they last visited ${visitLabel}`);

  if (memory.topics?.length > 0) {
    lines.push(`Topics they've previously discussed: ${memory.topics.join(', ')}`);
  }

  if (memory.lastContext) {
    lines.push(`Their recent concern: "${memory.lastContext.slice(0, 150)}"`);
  }

  if (memory.messageCount > 10) {
    lines.push(`They are a dedicated seeker — ${memory.messageCount} messages sent`);
  }

  return (
    '\n\nPERSONAL MEMORY (use to make your response feel continuous and personal):\n' +
    lines.map((l) => `- ${l}`).join('\n') +
    '\nAddress them by name, acknowledge their journey, and reference past topics naturally.'
  );
}

// ─── Generate a personalized greeting for WelcomeHero ────────────────────────
export function getPersonalizedGreeting(memory, firstName) {
  const name = firstName || memory?.userName || '';

  if (!memory || memory.visitCount < 2) {
    return { title: 'Namaste!', subtitle: null, isReturning: false };
  }

  const daysSince = memory.lastVisit
    ? Math.floor((Date.now() - new Date(memory.lastVisit).getTime()) / 86400000)
    : 0;

  let title = name ? `Welcome back, ${name}!` : 'Welcome back!';
  let subtitle = null;

  if (daysSince === 0) {
    subtitle = 'Good to see you again today.';
  } else if (daysSince === 1) {
    subtitle = `It's been a day, ${name || 'friend'}. How are you feeling?`;
  } else if (daysSince <= 7) {
    subtitle = `${daysSince} days since your last visit. Krishna was waiting.`;
  } else {
    subtitle = `You're back after ${daysSince} days. Your journey continues.`;
  }

  const lastTopic = memory.topics?.[memory.topics.length - 1];
  if (lastTopic && daysSince > 0) {
    const topicLabels = {
      career: 'your career path',
      relationship: 'relationships',
      anxiety: 'overcoming anxiety',
      family: 'family matters',
      purpose: 'finding purpose',
      spirituality: 'spiritual growth',
      sadness: 'inner peace',
      anger: 'letting go of anger',
      confidence: 'building confidence',
    };
    const topicLabel = topicLabels[lastTopic];
    if (topicLabel) {
      subtitle = `Last time we explored ${topicLabel}. What's on your mind today?`;
    }
  }

  return { title, subtitle, isReturning: true, visitCount: memory.visitCount };
}
