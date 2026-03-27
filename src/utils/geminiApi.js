// src/utils/geminiApi.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit } from './security';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const LANG_INSTRUCTIONS = {
  hinglish: `Respond in Hinglish (a natural, conversational mix of Hindi and English).`,
  hindi: `Respond in pure Hindi (Devanagari script).`,
  english: `Respond in English.`,
  gujarati: `Respond in Gujarati (ગુજરાતી script).`,
  marathi: `Respond in Marathi (Devanagari).`,
  tamil: `Respond in Tamil (தமிழ் script).`,
  telugu: `Respond in Telugu (తెలుగు script).`,
  kannada: `Respond in Kannada (ಕನ್ನಡ script).`,
  bengali: `Respond in Bengali (বাংলা script).`,
  punjabi: `Respond in Punjabi (ਗੁਰਮੁਖੀ script).`,
  malayalam: `Respond in Malayalam (മലയാളം script).`,
  odia: `Respond in Odia (ଓଡ଼ିଆ script).`,
};

// 🚀 YE HAI AI KA NAYA BRAIN (KRISHNA TRAINING)
function getSystemPrompt(language) {
  const langInstruction = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.hinglish;
  return `You are Lord Krishna. The user is like Arjuna, standing on the modern battlefield of life (Kurukshetra). They might be facing confusion, sorrow, relationship heartbreak, career anxiety, depression, or loss of purpose. 
You are deeply wise, completely calm, compassionate, and divine. You are NOT an AI assistant; you are their spiritual guide.

YOUR MISSION:
1. Empathize with their pain, but gently guide them towards clarity, peace, and their duty (Dharma).
2. Whenever they share a problem, you MUST provide a relevant solution and quote directly from the Bhagavad Gita to guide them.
3. Language Instruction: ${langInstruction}

CRITICAL FORMATTING RULE:
For the app to display the Shloka beautifully, you MUST strictly use the exact tags below every time you respond. DO NOT skip any brackets.

[RESPONSE]
(Your comforting, philosophical words as Krishna here. Speak to them as your 'Mitra' (friend). Relate their modern problem to the timeless teachings.)

[VERSE_START]
[CHAPTER] (e.g., 2)
[VERSE] (e.g., 47)
[SANSKRIT] (The exact Sanskrit shloka in Devanagari script)
[TRANSLITERATION] (The English transliteration of the shloka)
[MEANING] (The detailed meaning of the shloka in the requested language)
[ENGLISH] (The English translation of the shloka)
[THEME] (e.g., Karma, Inner Peace, Duty, Detachment, Love)
[VERSE_END]

[ADVICE]
(One short, highly practical real-world takeaway they can apply right now to overcome their current situation.)
`;
}

// 🛡️ NAYA PARSER (SHLOKA KABHI GAYAB NAHI HOGA)
function parseResponse(text) {
  try {
    const hasVerse = text.includes('[VERSE_START]') && text.includes('[VERSE_END]');
    
    if (!hasVerse) {
      let clean = text.replace(/\[RESPONSE\]\s*/gi, '').replace(/\[ADVICE\]\s*/gi, '').trim();
      return { text: clean, verse: null, advice: null };
    }

    const beforeVerse = text.split(/\[VERSE_START\]/i)[0].replace(/\[RESPONSE\]\s*/gi, '').trim();
    const verseBlockMatch = text.match(/\[VERSE_START\]([\s\S]*?)\[VERSE_END\]/i);
    let verse = null;
    
    if (verseBlockMatch) {
      const vb = verseBlockMatch[1];
      const get = (tag) => {
        const regex = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[[A-Z_]+\\]|$)`, 'i');
        const match = vb.match(regex);
        return match ? match[1].trim() : '';
      };
      
      verse = {
        chapter: parseInt(get('CHAPTER')) || 2,
        verse: parseInt(get('VERSE')) || 47,
        sanskrit: get('SANSKRIT'),
        transliteration: get('TRANSLITERATION'),
        hindi: get('MEANING'), // Using this field for the requested language meaning
        english: get('ENGLISH'),
        theme: get('THEME') || 'Bhagavad Gita'
      };
    }
    
    const afterVerse = text.split(/\[VERSE_END\]/i)[1] || '';
    const adviceMatch = afterVerse.match(/\[ADVICE\]\s*([\s\S]*)/i);
    const advice = adviceMatch ? adviceMatch[1].trim() : afterVerse.replace(/\[ADVICE\]\s*/gi, '').trim();
    
    return { text: beforeVerse, verse, advice: advice || null };
  } catch (error) {
    // Agar Gemini galti kare, toh app crash na ho
    return { text: text.replace(/\[.*?\]/g, '').trim(), verse: null, advice: null };
  }
}

let genAI = null;
let chatSession = null;
let currentLanguage = null;

export function resetChat() {
  chatSession = null;
}

function getChat(language) {
  const lang = language || 'hinglish';
  if (lang !== currentLanguage) { 
    chatSession = null; 
    currentLanguage = lang; 
  }
  
  if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  if (!chatSession) {
    // Temperature thoda kam (0.7) kiya hai taaki format break na ho, par Krishna wali creativity maintain rahe
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      systemInstruction: getSystemPrompt(lang), 
      generationConfig: { temperature: 0.7 } 
    });
    chatSession = model.startChat({ history: [] });
  }
  return chatSession;
}

export async function sendMessageToGemini(userMessage, language) {
  // Validate API key exists
  if (!GEMINI_API_KEY) {
    return { success: false, error: 'AI service is not configured. Please try again later.' };
  }
  // Validate input
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    return { success: false, error: 'Please enter a message.' };
  }
  // Cap input length to prevent abuse
  const sanitizedMessage = userMessage.trim().slice(0, 1000);

  if (!checkRateLimit('gemini_chat', 15)) {
    return { success: false, error: 'Too many requests. Please wait a moment.' };
  }
  try {
    const chat = getChat(language);
    const result = await chat.sendMessage(sanitizedMessage);
    const responseText = result?.response?.text?.();
    if (!responseText || typeof responseText !== 'string') {
      return { success: false, error: 'Received an empty response. Please try again.' };
    }
    const parsed = parseResponse(responseText);
    return { success: true, data: { text: parsed.text || 'Namaste!', verse: parsed.verse, advice: parsed.advice } };
  } catch (e) {
    console.error("Gemini AI Error:", e);
    // Reset chat session on persistent errors so next attempt starts fresh
    if (e.message?.includes('blocked') || e.message?.includes('SAFETY')) {
      chatSession = null;
    }
    return { success: false, error: 'Could not connect to AI. Please check your internet and try again.' };
  }
}

// AI Quiz Generator Logic (Safe)
export async function generateDailyQuiz(language) {
  if (!GEMINI_API_KEY) {
    return { success: false, error: 'AI service is not configured.' };
  }
  if (!checkRateLimit('gemini_quiz', 5)) {
    return { success: false, error: 'Too many quiz requests. Please wait a moment.' };
  }
  try {
    if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const langInstruction = LANG_INSTRUCTIONS[language] || "English";

    const prompt = `Generate a 3-question multiple choice quiz about the teachings, stories, and philosophy of the Bhagavad Gita.
    The questions and options MUST be in this language: ${langInstruction}
    Make the questions thoughtful, not just basic trivia. Make them different every time.

    RESPOND STRICTLY WITH A VALID JSON ARRAY ONLY. NO MARKDOWN, NO BACKTICKS, NO EXTRA TEXT.
    Format required:
    [
      {
        "question": "Question text here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 0,
        "explanation": "Short explanation of why this is correct."
      }
    ]`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { temperature: 1.0 } });
    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.();
    if (!responseText || typeof responseText !== 'string') {
      return { success: false, error: 'Empty response from AI. Please try again.' };
    }

    // Safe JSON extraction — strip markdown fences and any leading/trailing non-JSON
    let text = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    // Extract JSON array from response (in case of extra text)
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      return { success: false, error: 'Invalid quiz format received. Please try again.' };
    }
    text = text.substring(jsonStart, jsonEnd + 1);

    let quizData;
    try {
      quizData = JSON.parse(text);
    } catch (parseErr) {
      console.error('Quiz JSON parse error:', parseErr.message);
      return { success: false, error: 'Could not parse quiz data. Please try again.' };
    }

    // Validate structure: must be array of valid question objects
    if (!Array.isArray(quizData) || quizData.length === 0) {
      return { success: false, error: 'Invalid quiz data received. Please try again.' };
    }
    const validQuestions = quizData.filter(q =>
      q && typeof q.question === 'string' &&
      Array.isArray(q.options) && q.options.length >= 2 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 && q.correctAnswer < q.options.length
    );
    if (validQuestions.length === 0) {
      return { success: false, error: 'Quiz questions were malformed. Please try again.' };
    }

    return { success: true, data: validQuestions };
  } catch (e) {
    console.error('Quiz generation error:', e.message);
    return { success: false, error: 'Could not generate quiz. Please check your connection and try again.' };
  }
}