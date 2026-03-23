// src/screens/QuizScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HanumanQuizBackground } from '../components/SpiritualBackground';
import { usePremium } from "../theme/PremiumContext";
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { FontSizes } from '../theme/colors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyD8l0wfb5Hvd2OXEPMeAB5Fz_QL7XZlmzU';

const LANG_MAP = {
  english: 'English',
  hindi: 'Hindi (Devanagari)',
  hinglish: 'Hinglish (Hindi-English mix)',
  gujarati: 'Gujarati',
  marathi: 'Marathi',
  tamil: 'Tamil',
  telugu: 'Telugu',
  kannada: 'Kannada',
  bengali: 'Bengali',
  punjabi: 'Punjabi',
  malayalam: 'Malayalam',
  odia: 'Odia',
};

async function generateQuizQuestions(language) {
  const langName = LANG_MAP[language] || 'English';
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 1.0, topP: 0.95, maxOutputTokens: 4096 },
  });

  const prompt = `Generate 5 unique random quiz questions about the Bhagavad Gita. Each time you MUST give completely different questions - never repeat. Cover diverse topics: chapters, characters, philosophy, shlokas, yoga types, life lessons, context, history.

Language: ${langName}
ALL questions, options, and facts MUST be in ${langName}.

Respond ONLY in this exact JSON format, no other text:
[
  {
    "q": "question text here",
    "opts": ["option A", "option B", "option C", "option D"],
    "ans": 0,
    "fact": "interesting fact about the correct answer"
  }
]

Rules:
- "ans" is the index (0-3) of the correct option
- Make questions range from easy to hard
- Include fun/surprising facts
- Cover different chapters and topics each time
- Keep options plausible, not obviously wrong`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    console.log('Quiz raw response:', raw.substring(0, 300));
    
    // Clean response - strip markdown code blocks and extra text
    let cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*\n/gm, '')
      .trim();
    
    // Extract JSON array
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1) throw new Error('No JSON array found in: ' + cleaned.substring(0, 100));
    
    const jsonStr = cleaned.substring(startIdx, endIdx + 1);
    console.log('Quiz JSON:', jsonStr.substring(0, 200));
    
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length < 3) throw new Error('Too few questions: ' + parsed.length);
    
    // Validate each question
    const valid = parsed.filter(q => q.q && q.opts && q.opts.length === 4 && typeof q.ans === 'number');
    console.log('Valid questions:', valid.length);
    return valid.slice(0, 5);
  } catch (e) {
    console.log('Quiz generation error:', e.message || e);
    console.log('Full error:', JSON.stringify(e, null, 2));
    return null;
  }
}

export default function QuizScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { useQuizPlay, quizRemaining, isPremium } = usePremium();
  const { profile } = useProfile();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [error, setError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const lang = profile.language || 'english';

  useEffect(() => {
    loadQuiz();
    (async () => {
      const best = await AsyncStorage.getItem('@gitasaar_quiz_best');
      if (best) setBestScore(parseInt(best));
    })();
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    setError(false);
    if (!isPremium && !useQuizPlay()) { if (typeof window !== "undefined") window.alert("Free limit: 1 quiz per day. Upgrade to Premium for unlimited!"); return; }
    const qs = await generateQuizQuestions(lang);
    if (qs && qs.length >= 3) {
      setQuestions(qs);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  const handleSelect = async (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === questions[current].ans;
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (current < questions.length - 1) {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
          setCurrent(c => c + 1);
          setSelected(null);
          setAnswered(false);
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        });
      } else {
        const finalScore = correct ? score + 1 : score;
        if (finalScore > bestScore) {
          setBestScore(finalScore);
          AsyncStorage.setItem('@gitasaar_quiz_best', String(finalScore));
        }
        setFinished(true);
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      }
    }, 1500);
  };

  const playAgain = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setFinished(false);
    scaleAnim.setValue(0.5);
    loadQuiz(); // Generate fresh questions
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient colors={C.gradientWarm} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <HanumanQuizBackground />
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.primarySoft, borderWidth: 1.5, borderColor: C.borderGold, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <MaterialCommunityIcons name="head-question-outline" size={36} color={C.primary} />
        </View>
        <ActivityIndicator size="large" color={C.primary} style={{ marginBottom: 14 }} />
        <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>Generating Quiz...</Text>
        <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 6 }}>AI is creating unique questions for you</Text>
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient colors={C.gradientWarm} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <HanumanQuizBackground />
        <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#D63B2F" />
        </View>
        <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>Quiz load nahi hua</Text>
        <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, textAlign: 'center', marginBottom: 20 }}>Internet check karo aur try again karo</Text>
        <TouchableOpacity onPress={loadQuiz} style={{ backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Results
  if (finished) {
    const finalScore = score;
    const emoji = finalScore === 5 ? 'trophy' : finalScore >= 3 ? 'star-outline' : 'lightbulb-on-outline';
    const msg = finalScore === 5 ? 'Perfect! You are a Gita Master!' : finalScore >= 3 ? 'Well done! Keep learning!' : 'Keep going! Practice makes perfect!';

    return (
      <LinearGradient colors={C.gradientWarm} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <HanumanQuizBackground />
        <Animated.View style={{ alignItems: 'center', transform: [{ scale: scaleAnim }] }}>
          <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: C.primarySoft, borderWidth: 2, borderColor: C.borderGoldStrong, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name={emoji} size={40} color={C.primary} />
          </View>
          <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '800', color: C.textPrimary, marginBottom: 8 }}>{finalScore}/{questions.length}</Text>
          <Text style={{ fontSize: FontSizes.lg, color: C.textSecondary, textAlign: 'center', marginBottom: 6 }}>{msg}</Text>
          <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 8 }}>Best: {Math.max(bestScore, finalScore)}/{questions.length}</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 30 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}
              style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={playAgain}
              style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, backgroundColor: C.primary }}>
              <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  const q = questions[current];

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <HanumanQuizBackground />
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Daily Quiz</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>AI-generated questions</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
            <MaterialCommunityIcons name="star" size={14} color={C.primary} />
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.primary }}>{score}/{questions.length}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
        {/* Progress */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 24 }}>
          {questions.map((_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < current ? C.primary : i === current ? C.primary + '60' : C.border }} />
          ))}
        </View>

        <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, letterSpacing: 1, marginBottom: 20 }}>QUESTION {current + 1} OF {questions.length}</Text>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Question */}
          <View style={{ backgroundColor: C.bgCard, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: C.border, ...C.shadow }}>
            <View style={{ height: 3, backgroundColor: C.primary }} />
            <View style={{ padding: 22 }}>
              <View style={{ position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: C.borderGold, borderTopRightRadius: 4, opacity: 0.3 }} />
              <View style={{ position: 'absolute', bottom: 8, left: 8, width: 14, height: 14, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderColor: C.borderGold, borderBottomLeftRadius: 4, opacity: 0.3 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.primarySoft, borderWidth: 1, borderColor: C.borderGold, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary }}>{current + 1}</Text>
                </View>
                <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
                <View style={{ width: 5, height: 5, backgroundColor: C.primary, opacity: 0.3, transform: [{ rotate: '45deg' }] }} />
              </View>
              <Text style={{ fontSize: FontSizes.xl, fontWeight: '700', color: C.textPrimary, lineHeight: 32 }}>{q.q}</Text>
            </View>
          </View>

          {/* Options */}
          {q.opts.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === q.ans;
            const showResult = answered;

            let bg = C.bgCard;
            let border = C.border;
            let iconName = null;
            let iconColor = C.textMuted;

            if (showResult && isCorrect) {
              bg = '#E8F5E9'; border = '#4CAF50';
              iconName = 'check-circle'; iconColor = '#2E7D50';
            } else if (showResult && isSelected && !isCorrect) {
              bg = '#FFEBEE'; border = '#E53935';
              iconName = 'close-circle'; iconColor = '#C62828';
            }

            return (
              <TouchableOpacity key={idx} onPress={() => handleSelect(idx)} disabled={answered}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  backgroundColor: bg, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16,
                  marginBottom: 10, borderWidth: 1.5, borderColor: border,
                }} activeOpacity={0.8}>
                <View style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: showResult && isCorrect ? '#4CAF50' + '15' : C.bgSecondary,
                  justifyContent: 'center', alignItems: 'center',
                  borderWidth: 1, borderColor: showResult && isCorrect ? '#4CAF50' + '30' : C.border,
                }}>
                  <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: showResult && isCorrect ? '#2E7D50' : C.textSecondary }}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={{ flex: 1, fontSize: FontSizes.md, fontWeight: '500', color: C.textPrimary }}>{opt}</Text>
                {iconName && <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />}
              </TouchableOpacity>
            );
          })}

          {/* Fact */}
          {answered && (
            <View style={{ backgroundColor: C.primarySoft, borderRadius: 14, padding: 16, marginTop: 8, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: C.borderGold }}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={C.primary} />
              <Text style={{ flex: 1, fontSize: FontSizes.sm, color: C.textPrimary, lineHeight: 20 }}>{q.fact}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}