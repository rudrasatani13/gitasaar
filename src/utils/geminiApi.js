// src/utils/geminiApi.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const LANG_INSTRUCTIONS = {
  hinglish: `Respond in Hinglish (natural mix of Hindi + English).`,
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

function getSystemPrompt(language) {
  const langInstruction = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.hinglish;
  return `You are "Krishna" — the soul of the app "GitaSaar". You are NOT a chatbot. You are a warm, deeply wise, emotionally intelligent spiritual companion.
LANGUAGE: ${langInstruction}
HOW TO RESPOND:
1. Be warm and empathetic.
2. If sharing a verse, use format: [VERSE_START] ... [VERSE_END]
3. Keep it concise. Quality over quantity.`;
}

function parseResponse(text) {
  const hasVerse = text.includes('[VERSE_START]') && text.includes('[VERSE_END]');
  if (!hasVerse) {
    let clean = text.replace(/\[RESPONSE\]\s*/gi, '').replace(/\[ADVICE\]\s*/gi, '').replace(/\*\*/g, '').trim();
    return { text: clean, verse: null, advice: null };
  }
  const beforeVerse = text.split('[VERSE_START]')[0].replace(/\[RESPONSE\]\s*/gi, '').replace(/\*\*/g, '').trim();
  const verseBlock = text.match(/\[VERSE_START\]([\s\S]*?)\[VERSE_END\]/);
  let verse = null;
  if (verseBlock) {
    const vb = verseBlock[1];
    const get = (tag) => {
      const m = vb.match(new RegExp('\\[' + tag + '\\]\\s*([\\s\\S]*?)(?=\\[(?:CHAPTER|VERSE|SANSKRIT|TRANSLITERATION|MEANING|ENGLISH|THEME|VERSE_END)\\]|$)'));
      return m ? m[1].trim() : '';
    };
    verse = { chapter: parseInt(get('CHAPTER')) || 2, verse: parseInt(get('VERSE')) || 47, sanskrit: get('SANSKRIT'), transliteration: get('TRANSLITERATION'), hindi: get('MEANING'), english: get('ENGLISH'), theme: get('THEME') || 'Bhagavad Gita' };
  }
  const afterVerse = text.split('[VERSE_END]')[1] || '';
  const adviceMatch = afterVerse.match(/\[ADVICE\]\s*([\s\S]*)/);
  const advice = adviceMatch ? adviceMatch[1].replace(/\*\*/g, '').trim() : '';
  return { text: beforeVerse, verse, advice: advice || null };
}

let genAI = null;
let chatSession = null;
let currentLanguage = null;

function getChat(language) {
  const lang = language || 'hinglish';
  if (lang !== currentLanguage) { chatSession = null; currentLanguage = lang; }
  if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  if (!chatSession) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: getSystemPrompt(lang), generationConfig: { temperature: 0.9 } });
    chatSession = model.startChat({ history: [] });
  }
  return chatSession;
}

export async function sendMessageToGemini(userMessage, language) {
  try {
    const chat = getChat(language);
    const result = await chat.sendMessage(userMessage);
    const parsed = parseResponse(result.response.text());
    return { success: true, data: { text: parsed.text || 'Namaste!', verse: parsed.verse, advice: parsed.advice } };
  } catch (e) { return { success: false, error: e.message || 'Something went wrong' }; }
}

// ==========================================
// 🚀 NAYA FUNCTION: AI QUIZ GENERATOR
// ==========================================
export async function generateDailyQuiz(language) {
  try {
    if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const langInstruction = LANG_INSTRUCTIONS[language] || "English";
    
    // Gemini ko strict instruction de rahe hain ki sirf JSON format mein answer kare
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
    ]
    (Note: correctAnswer must be the index of the correct option, i.e., 0, 1, 2, or 3)`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { temperature: 1.0 } }); // Temperature 1.0 = highly creative/random questions
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean up Gemini's markdown formatting if it adds ```json ... ```
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    const quizData = JSON.parse(text);
    return { success: true, data: quizData };
  } catch (e) {
    console.log("Quiz Generation Error:", e);
    return { success: false, error: e.message };
  }
}