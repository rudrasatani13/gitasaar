// src/screens/QuizScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { usePremium } from '../theme/PremiumContext';
import { useProfile } from '../theme/ProfileContext'; // Bhasha check karne ke liye
import { PremiumBanner } from '../components/PremiumGate';
import { generateDailyQuiz } from '../utils/geminiApi'; // Naya function import
import { FontSizes } from '../theme/colors';
import { tapLight, tapSuccess, tapError } from '../utils/haptics';

const { width } = Dimensions.get('window');

export default function QuizScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { profile } = useProfile(); 
  
  // Paywall & Limits Logic
  const { useQuizPlay, isPremium, quizRemaining, FREE_LIMITS, usage } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  // Quiz States
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Gemini loading state
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // AI se aaye hue questions
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = async () => {
    // 1. Pehle check karo limit hai ya nahi (Bina deduct kiye)
    const canPlay = isPremium || usage.quizPlays < FREE_LIMITS.quizPlays;
    if (!canPlay) {
      tapError();
      setShowPaywall(true);
      return;
    }

    // 2. Limit hai toh Gemini se questions mangwao
    tapLight();
    setShowPaywall(false);
    setIsLoading(true); // Loading spinner on
    
    const response = await generateDailyQuiz(profile?.language || 'english');
    
    setIsLoading(false); // Loading spinner off

    if (response.success && response.data && response.data.length > 0) {
      // 3. Agar questions aa gaye, tabhi limit me se 1 cut karo (useQuizPlay run karo)
      useQuizPlay(); 
      
      setGeneratedQuestions(response.data);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      Alert.alert("Network Error", "Aapke liye naye questions nahi aa paaye. Kripya apna internet check karein.");
    }
  };

  const handleAnswer = (index) => {
    if (isAnswered) return;
    
    const currentQuestion = generatedQuestions[currentQuestionIndex];
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswer) {
      tapSuccess();
      setScore(score + 1);
    } else {
      tapError();
    }
  };

  const nextQuestion = () => {
    tapLight();
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const currentQuestion = generatedQuestions[currentQuestionIndex];

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPrimary }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.bgCard, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Daily Wisdom Quiz</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* State 1: Welcome Screen */}
        {!quizStarted && !showResult && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
               <MaterialCommunityIcons name="head-lightbulb-outline" size={50} color={C.primary} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: C.textPrimary, marginBottom: 12 }}>Test Your Knowledge</Text>
            <Text style={{ fontSize: FontSizes.md, color: C.textMuted, textAlign: 'center', marginBottom: 40, lineHeight: 22, paddingHorizontal: 20 }}>
              Get 3 newly generated AI questions daily in {profile?.language || 'English'}. Let's see how much you know!
            </Text>

            {/* Paywall Banner */}
            {showPaywall ? (
              <View style={{ width: '100%' }}>
                <PremiumBanner 
                  title="Daily Limit Reached" 
                  subtitle="Upgrade to Premium to play more quizzes today." 
                  icon="lock" 
                />
                <TouchableOpacity onPress={() => setShowPaywall(false)} style={{ marginTop: 15, alignSelf: 'center' }}>
                   <Text style={{ color: C.textMuted, fontSize: 14 }}>Go Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: '100%', alignItems: 'center' }}>
                <TouchableOpacity onPress={startQuiz} activeOpacity={0.8} style={{ width: '80%' }} disabled={isLoading}>
                  <LinearGradient colors={C.gradientWarm} style={{ paddingVertical: 16, borderRadius: 999, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, ...C.shadowLight }}>
                    {isLoading ? (
                      <>
                        <ActivityIndicator color={C.textOnPrimary} size="small" />
                        <Text style={{ color: C.textOnPrimary, fontSize: FontSizes.md, fontWeight: '700' }}>GENERATING...</Text>
                      </>
                    ) : (
                      <Text style={{ color: C.textOnPrimary, fontSize: FontSizes.md, fontWeight: '700', letterSpacing: 0.5 }}>START QUIZ</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Free User Counter */}
                {!isPremium && (
                  <Text style={{ marginTop: 16, fontSize: 12, color: C.textMuted, fontWeight: '600' }}>
                    {quizRemaining} free quiz remaining today
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* State 2: Active Quiz */}
        {quizStarted && !showResult && currentQuestion && (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, fontWeight: '600' }}>Question {currentQuestionIndex + 1} of {generatedQuestions.length}</Text>
              <Text style={{ fontSize: FontSizes.sm, color: C.primary, fontWeight: '700' }}>Score: {score}</Text>
            </View>

            <Text style={{ fontSize: 22, fontWeight: '700', color: C.textPrimary, lineHeight: 32, marginBottom: 30 }}>
              {currentQuestion.question}
            </Text>

            <View style={{ gap: 12 }}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                
                let bgColor = C.bgCard;
                let borderColor = C.border;
                let textColor = C.textPrimary;

                if (isAnswered) {
                  if (isCorrect) {
                    bgColor = '#E8F5E9'; borderColor = '#4CAF50'; textColor = '#2E7D32';
                  } else if (isSelected && !isCorrect) {
                    bgColor = '#FFEBEE'; borderColor = '#F44336'; textColor = '#C62828';
                  }
                } else if (isSelected) {
                  bgColor = C.primarySoft; borderColor = C.primary;
                }

                return (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => handleAnswer(index)} 
                    disabled={isAnswered}
                    activeOpacity={0.7}
                    style={{ padding: 16, borderRadius: 16, backgroundColor: bgColor, borderWidth: 1.5, borderColor: borderColor }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: FontSizes.md, color: textColor, fontWeight: isSelected || (isAnswered && isCorrect) ? '600' : '500', flex: 1 }}>
                        {option}
                      </Text>
                      {isAnswered && isCorrect && <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />}
                      {isAnswered && isSelected && !isCorrect && <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isAnswered && (
              <View style={{ marginTop: 24, padding: 16, backgroundColor: C.bgSecondary, borderRadius: 12, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>Explanation</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, lineHeight: 20 }}>{currentQuestion.explanation}</Text>
              </View>
            )}

            {isAnswered && (
              <TouchableOpacity onPress={nextQuestion} style={{ marginTop: 30, backgroundColor: C.primary, paddingVertical: 16, borderRadius: 999, alignItems: 'center' }}>
                <Text style={{ color: C.textOnPrimary, fontSize: FontSizes.md, fontWeight: '700' }}>
                  {currentQuestionIndex < generatedQuestions.length - 1 ? 'Next Question' : 'See Results'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* State 3: Results Screen */}
        {showResult && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons name="trophy-outline" size={80} color="#FFC107" style={{ marginBottom: 20 }} />
            <Text style={{ fontSize: 28, fontWeight: '800', color: C.textPrimary, marginBottom: 10 }}>Quiz Completed!</Text>
            <Text style={{ fontSize: 18, color: C.textMuted, marginBottom: 30 }}>You scored {score} out of {generatedQuestions.length}</Text>
            
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: '80%' }}>
              <LinearGradient colors={C.gradientGold} style={{ paddingVertical: 16, borderRadius: 999, alignItems: 'center' }}>
                <Text style={{ color: C.textOnPrimary, fontSize: FontSizes.md, fontWeight: '700' }}>DONE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}