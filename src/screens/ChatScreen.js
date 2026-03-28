// src/screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Animated, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { useTranslation } from '../theme/useTranslation';
import { FontSizes } from '../theme/colors';
import { sendMessageToGemini, resetChat } from '../utils/geminiApi';
// flute image loaded via require
import VoiceInput from '../components/VoiceInput';
import TypeWriter from '../components/TypeWriter';
import { ChatBackground, ResponseImage } from '../components/SpiritualBackground';
import { tapMedium, tapError } from '../utils/haptics';
import { usePremium } from '../theme/PremiumContext';
import { PremiumBanner } from '../components/PremiumGate';
import GlassCard from '../components/GlassCard';

const WELCOME = {
  id: 'welcome', type: 'ai', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  text: "Namaste! Main hoon aapka spiritual guide, Bhagavad Gita ki timeless wisdom se inspired.\n\nLife mein koi bhi sawal ho \u2014 career, relationships, anxiety, self-doubt, purpose \u2014 mujhse poochiye.\n\nYa bas baat karna ho, wo bhi chalega!",
};
const SUGGESTIONS = [
  { text: 'I feel lost in my career', icon: 'briefcase-outline' },
  { text: 'How to deal with anxiety?', icon: 'head-heart-outline' },
  { text: 'Finding my life purpose', icon: 'compass-outline' },
  { text: 'Letting go of the past', icon: 'leaf' },
];

function TypingDots() {
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;
  const { colors: C } = useTheme();
  useEffect(() => {
    const go = (d, delay) => Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(d, { toValue: 0.3, duration: 300, useNativeDriver: true }), Animated.delay(600)])).start();
    go(d1, 0); go(d2, 200); go(d3, 400);
  }, []);
  return <View style={{ flexDirection: 'row', gap: 5 }}>{[d1, d2, d3].map((d, i) => <Animated.View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, opacity: d }} />)}</View>;
}

function MessageBubble({ item, C, tr, isLatest }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  if (item.type === 'user') {
    return (
      <Animated.View style={{ alignItems: 'flex-end', marginBottom: 14, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
        <LinearGradient colors={C.gradientGold} style={{ borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 18, paddingVertical: 13, maxWidth: '80%' }}>
          <Text style={{ fontSize: FontSizes.md, color: C.textOnPrimary, lineHeight: 22 }}>{item.text}</Text>
        </LinearGradient>
        {item.time && <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 4, marginRight: 4, opacity: 0.6 }}>{item.time}</Text>}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorderGold, justifyContent: 'center', alignItems: 'center', marginTop: 2, overflow: 'hidden' }}>
        <Image source={require('../../assets/images/flute.png')} style={{ width: 24, height: 24, borderRadius: 12 }} resizeMode='cover' />
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        {/* AI text bubble — glass */}
        <GlassCard noPadding style={{ borderRadius: 20, borderTopLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 13 }} intensity={40}>
          {isLatest ? (
            <TypeWriter text={item.text} style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 23 }} speed={25} />
          ) : (
            <Text style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 23 }}>{item.text}</Text>
          )}
        </GlassCard>

        {/* Spiritual Image */}
        {item.verse && <ResponseImage theme={item.verse.theme} />}

        {/* Verse Card — glass with gold accent */}
        {item.verse && (
          <GlassCard noPadding style={{ borderRadius: 18, overflow: 'hidden' }} intensity={45}>
            <View style={{ height: 3, backgroundColor: C.primary }} />
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.glassBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorderGold }}>
                  <MaterialCommunityIcons name="book-open-variant" size={12} color={C.primary} />
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary }}>Gita {item.verse.chapter}.{item.verse.verse}</Text>
                </View>
                {item.verse.theme ? <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontStyle: 'italic' }}>{item.verse.theme}</Text> : null}
              </View>

              <View style={{ backgroundColor: C.glassBg, borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', borderWidth: 1, borderColor: C.glassBorder }}>
                <View style={{ width: 3, backgroundColor: C.primary, borderRadius: 2, marginRight: 12, opacity: 0.6 }} />
                <Text style={{ flex: 1, fontSize: FontSizes.md, color: C.textSanskrit, lineHeight: 26 }}>{item.verse.sanskrit}</Text>
              </View>

              {item.verse.transliteration ? <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontStyle: 'italic', textAlign: 'center', marginBottom: 10, lineHeight: 18 }}>{item.verse.transliteration}</Text> : null}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorder }} />
                <View style={{ width: 4, height: 4, backgroundColor: C.primary, opacity: 0.3, transform: [{ rotate: '45deg' }] }} />
                <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorder }} />
              </View>

              {item.verse.hindi ? <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 21, marginBottom: 6 }}>{item.verse.hindi}</Text> : null}
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, lineHeight: 21, fontStyle: 'italic' }}>"{item.verse.english}"</Text>
            </View>
          </GlassCard>
        )}

        {/* Advice card — glass with saffron glow */}
        {item.advice && (
          <GlassCard noPadding style={{ borderRadius: 14, padding: 14 }} intensity={35}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.saffronSoft, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={12} color={C.turmeric} />
              </View>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.turmeric, letterSpacing: 0.5 }}>{tr('practicalTakeaway')}</Text>
            </View>
            <Text style={{ fontSize: FontSizes.sm, color: C.textPrimary, lineHeight: 22 }}>{item.advice}</Text>
          </GlassCard>
        )}

        {item.time && <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginLeft: 4, opacity: 0.6 }}>{item.time}</Text>}
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { colors: C, isDark } = useTheme();
  const navigation = useNavigation();
  const { profile } = useProfile();
  const { tr } = useTranslation();
  
  // --- NAYA PAYWALL LOGIC ---
  const { useChatMessage, chatRemaining, isPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  // --------------------------

  const [messages, setMessages] = useState([WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);
  const currentLang = profile.language || 'hinglish';

  const handleNewChat = () => {
    Alert.alert('New Chat', 'Start a new conversation? The current chat will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New Chat', onPress: () => { resetChat(); setMessages([WELCOME]); setShowSuggestions(true); setShowPaywall(false); } },
    ]);
  };

  const sendMessage = async (text) => {
    const msg = text || inputText.trim();
    if (!msg || isTyping) return;

    // --- LIMIT CHECK (without deducting yet) ---
    const canChat = isPremium || chatRemaining > 0;
    if (!canChat) {
      tapError();
      setShowPaywall(true); // Limit khatam, banner dikhao
      return;
    }
    // -------------------------------------------

    setShowPaywall(false);
    setShowSuggestions(false);
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setMessages((p) => [...p, { id: Date.now().toString(), type: 'user', text: msg, time: now }].slice(-100));
    setInputText('');
    setIsTyping(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 20000)
      );
      const result = await Promise.race([sendMessageToGemini(msg, currentLang), timeoutPromise]);
      const aiTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      if (result.success) {
        useChatMessage(); // Deduct only after confirmed success
        setMessages((p) => [...p, { id: (Date.now() + 1).toString(), type: 'ai', text: result.data.text, verse: result.data.verse, advice: result.data.advice, time: aiTime }].slice(-100));
      } else {
        // No deduct on failure
        setMessages((p) => [...p, { id: (Date.now() + 1).toString(), type: 'ai', text: result.error || 'Kuch gadbad ho gayi. Please try again.', verse: null, advice: null, time: aiTime }]);
      }
    } catch (e) {
      // No deduct on error/timeout
      const aiTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const errText = e.message === 'timeout'
        ? 'Response timed out. Please check your connection and try again.'
        : 'Kuch gadbad ho gayi. Please try again.';
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), type: 'ai', text: errText, verse: null, advice: null, time: aiTime }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPrimary }}>
      <LinearGradient colors={C.gradientWarm} style={StyleSheet.absoluteFill} />
      <ChatBackground />

      {/* Header */}
      <View style={{ zIndex: 10 }}>
        <LinearGradient colors={C.gradientHeader} style={{ paddingTop: 54, paddingBottom: 12, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 5 }}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={C.textPrimary} />
              </TouchableOpacity>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.primarySoft, borderWidth: 1.5, borderColor: C.borderGoldStrong, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <Image source={require('../../assets/images/flute.png')} style={{ width: 32, height: 32, borderRadius: 16 }} resizeMode='cover' />
              </View>
              <View>
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Ask Krishna</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isTyping ? C.turmeric : '#34C759' }} />
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{isTyping ? 'Typing...' : 'Online'}</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => navigation.navigate('ChatHistory')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold }} activeOpacity={0.7}>
                <MaterialCommunityIcons name="history" size={18} color={C.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNewChat} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold }} activeOpacity={0.7}>
                <MaterialCommunityIcons name="chat-plus-outline" size={18} color={C.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Messages */}
      <FlatList ref={flatListRef} data={messages}
        renderItem={({ item, index }) => <MessageBubble item={item} C={C} tr={tr} isLatest={item.type === 'ai' && index === messages.length - 1} />}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={<>
          {showSuggestions && (
            <View style={{ marginTop: 6, marginBottom: 14 }}>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 }}>Try asking about...</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s.text} onPress={() => sendMessage(s.text)} activeOpacity={0.7}>
                    <GlassCard noPadding style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }} intensity={30}>
                      <MaterialCommunityIcons name={s.icon} size={14} color={C.primary} />
                      <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, fontWeight: '500' }}>{s.text}</Text>
                    </GlassCard>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {isTyping && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.glassBg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: C.glassBorderGold }}>
                <Image source={require('../../assets/images/flute.png')} style={{ width: 18, height: 18, borderRadius: 9 }} resizeMode='cover' />
              </View>
              <GlassCard noPadding style={{ borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 }} intensity={30}>
                <TypingDots />
              </GlassCard>
            </View>
          )}
        </>}
      />

      {/* Input bar — floating pill above tab bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 108 : 94, backgroundColor: 'transparent' }}>

          {/* Paywall banner */}
          {showPaywall && (
            <View style={{ marginBottom: 10 }}>
              <PremiumBanner title="Daily Wisdom Reached" subtitle="Upgrade to Premium for unlimited deep conversations with Krishna." icon="chat-alert" />
            </View>
          )}

          {/* Free counter badge */}
          {!isPremium && !showPaywall && (
            <View style={{ alignItems: 'center', marginBottom: 6 }}>
              <View style={{ backgroundColor: C.glassBg, borderWidth: 1, borderColor: chatRemaining <= 2 ? '#D63B2F40' : C.glassBorder, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 }}>
                <Text style={{ fontSize: FontSizes.xs, color: chatRemaining <= 2 ? '#D63B2F' : C.textMuted, fontWeight: '700', letterSpacing: 0.3 }}>
                  {chatRemaining} free messages left today
                </Text>
              </View>
            </View>
          )}

          {/* Pill input row */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : C.glassBgStrong,
            borderRadius: 36,
            borderWidth: 1.5,
            borderColor: C.glassBorderGold,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}>
            {/* Text input */}
            <TextInput
              style={{
                flex: 1,
                fontSize: FontSizes.md,
                color: C.textPrimary,
                paddingHorizontal: 10,
                paddingVertical: 8,
                maxHeight: 100,
                minHeight: 38,
                lineHeight: 20,
              }}
              placeholder={tr('askAnything')}
              placeholderTextColor={C.textMuted}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                if (showPaywall) setShowPaywall(false);
              }}
              multiline maxLength={500} editable={!isTyping}
              selectionColor={C.primary}
              underlineColorAndroid="transparent"
            />

            {/* Voice input */}
            {!inputText.trim() && (
              <VoiceInput onResult={(text) => { setInputText(text); }} onAutoSend={(text) => { sendMessage(text); }} disabled={isTyping} />
            )}

            {/* Send button — gold pill */}
            <TouchableOpacity
              onPress={() => { tapMedium(); sendMessage(); }}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={inputText.trim() && !isTyping ? C.gradientGold : [C.glassBg, C.glassBg]}
                style={{
                  width: 38, height: 38, borderRadius: 19,
                  justifyContent: 'center', alignItems: 'center',
                  borderWidth: inputText.trim() ? 0 : 1,
                  borderColor: C.glassBorder,
                }}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={18}
                  color={inputText.trim() && !isTyping ? C.textOnPrimary : C.textMuted}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}