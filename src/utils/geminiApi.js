// src/utils/geminiApi.js
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  try {
    const chat = getChat(language);
    const result = await chat.sendMessage(userMessage);
    const parsed = parseResponse(result.response.text());
    return { success: true, data: { text: parsed.text || 'Namaste!', verse: parsed.verse, advice: parsed.advice } };
  } catch (e) { 
    console.error("Gemini AI Error:", e);
    return { success: false, error: e.message || 'Something went wrong' }; 
  }
}

// AI Quiz Generator Logic (Safe)
export async function generateDailyQuiz(language) {
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
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    const quizData = JSON.parse(text);
    return { success: true, data: quizData };
  } catch (e) {
    return { success: false, error: e.message };
  }
}