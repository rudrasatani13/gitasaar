// src/screens/ChatScreen.js — Production-Level Redesign
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Animated, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { useTranslation } from '../theme/useTranslation';
import { FontSizes } from '../theme/colors';
import { sendMessageToGemini, resetChat } from '../utils/geminiApi';
import { loadMemory, updateMemory, formatMemoryForPrompt, getPersonalizedGreeting } from '../utils/conversationMemory';
import VoiceInput from '../components/VoiceInput';
import TypeWriter from '../components/TypeWriter';
import { StarfieldBackground } from '../components/SpiritualBackground';
import { tapMedium, tapError, tapLight } from '../utils/haptics';
import { usePremium } from '../theme/PremiumContext';
import { PremiumBanner } from '../components/PremiumGate';
import GlassCard from '../components/GlassCard';

const WELCOME_ID = 'welcome';
const WELCOME = {
  id: WELCOME_ID, type: 'ai',
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  text: "Namaste! Main hoon aapka spiritual guide, Bhagavad Gita ki timeless wisdom se inspired.\n\nLife mein koi bhi sawal ho — career, relationships, anxiety, self-doubt, purpose — mujhse poochiye.\n\nYa bas baat karna ho, wo bhi chalega!",
};

const TOPICS = [
  { label: 'Career', icon: 'briefcase-outline', color: '#C28840', q: 'I feel confused about my career path' },
  { label: 'Inner Peace', icon: 'meditation', color: '#14918E', q: 'How do I find inner peace and calm?' },
  { label: 'Anxiety', icon: 'head-heart-outline', color: '#C95A6A', q: 'How to overcome anxiety and worry?' },
  { label: 'Purpose', icon: 'compass-outline', color: '#D4962A', q: 'What is my true purpose in life?' },
  { label: 'Love', icon: 'heart-outline', color: '#E8793A', q: 'What does the Gita say about love?' },
  { label: 'Strength', icon: 'arm-flex-outline', color: '#7B1830', q: 'I need strength and courage to move forward' },
];

// ─── Animated bouncing typing indicator ──────────────────────────────────────
function TypingIndicator() {
  const { colors: C } = useTheme();
  const d0 = useRef(new Animated.Value(0)).current;
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    [[d0, 0], [d1, 160], [d2, 320]].forEach(([d, delay]) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.delay(Math.max(0, 600 - delay)),
        ])
      ).start();
    });
  }, []);

  const dotStyle = (d) => ({
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: C.primary,
    opacity: Animated.add(0.2, Animated.multiply(d, 0.8)),
    transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 20, paddingLeft: 4 }}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.glassBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: C.glassBorderGold, overflow: 'hidden' }}>
        <Image source={require('../../assets/images/flute.png')} style={{ width: 30, height: 30, borderRadius: 15 }} resizeMode="cover" />
      </View>
      <GlassCard noPadding style={{ borderRadius: 20, borderTopLeftRadius: 5, paddingHorizontal: 18, paddingVertical: 13 }} intensity={35}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Animated.View style={dotStyle(d0)} />
          <Animated.View style={dotStyle(d1)} />
          <Animated.View style={dotStyle(d2)} />
          <Text style={{ fontSize: 11, color: C.textMuted, marginLeft: 6, fontStyle: 'italic' }}>Krishna is reflecting...</Text>
        </View>
      </GlassCard>
    </View>
  );
}

// ─── Welcome Hero (shown when chat is fresh) ─────────────────────────────────
function WelcomeHero({ onTopicPress, greeting }) {
  const { colors: C, isDark } = useTheme();
  const glow = useRef(new Animated.Value(0.20)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.55, duration: 2200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.20, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const { title, subtitle, isReturning, visitCount } = greeting;

  return (
    <View style={{ paddingTop: 8, paddingBottom: 4 }}>
      {/* Hero card */}
      <LinearGradient
        colors={isDark
          ? ['rgba(224,168,80,0.14)', 'rgba(194,136,64,0.04)']
          : ['rgba(253,248,239,0.98)', 'rgba(250,240,222,0.65)']}
        style={{ borderRadius: 28, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: C.glassBorderGold, marginBottom: 22 }}
      >
        {/* Om with glow */}
        <View style={{ alignItems: 'center', justifyContent: 'center', width: 96, height: 96, marginBottom: 22 }}>
          <Animated.View style={{ position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: C.primary, opacity: glow }} />
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(253,248,239,0.92)', borderWidth: 2, borderColor: C.glassBorderGold, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 40, color: C.primary, lineHeight: 46 }}>{'ॐ'}</Text>
          </View>
        </View>

        <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary, marginBottom: 8, letterSpacing: -0.3 }}>{title}</Text>

        {subtitle ? (
          <Text style={{ fontSize: FontSizes.sm, color: C.peacockBlue || C.primary, textAlign: 'center', lineHeight: 22, marginBottom: 16, fontWeight: '600' }}>
            {subtitle}
          </Text>
        ) : (
          <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 20 }}>
            Your AI spiritual guide, powered by{'\n'}Bhagavad Gita's 700 timeless verses
          </Text>
        )}

        {/* Trust / memory badge */}
        {isReturning ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primarySoft, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorderGold }}>
            <MaterialCommunityIcons name="brain" size={13} color={C.primary} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary }}>
              Krishna remembers your journey · Visit #{visitCount}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primarySoft, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorderGold }}>
            <MaterialCommunityIcons name="account-group" size={13} color={C.primary} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.2 }}>50,000+ spiritual seekers guided</Text>
          </View>
        )}
      </LinearGradient>

      {/* Topic grid label */}
      <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 2, marginBottom: 14 }}>WHAT'S ON YOUR MIND?</Text>

      {/* 3×2 topic grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        {TOPICS.map((t) => (
          <TouchableOpacity
            key={t.label}
            onPress={() => onTopicPress(t.q)}
            activeOpacity={0.72}
            style={{ width: '30%' }}
          >
            <View style={{
              borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', gap: 8,
              backgroundColor: t.color + '12',
              borderWidth: 1.5, borderColor: t.color + '28',
            }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.color + '22', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name={t.icon} size={20} color={t.color} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.textSecondary, textAlign: 'center' }}>{t.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorder }} />
        <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>or type your question below</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorder }} />
      </View>
    </View>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ item, C, tr, isLatest }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 7, tension: 55, useNativeDriver: true }),
    ]).start();
  }, []);

  // Skip welcome message — handled by WelcomeHero
  if (item.id === WELCOME_ID) return null;

  // ── User message ──
  if (item.type === 'user') {
    return (
      <Animated.View style={{ alignItems: 'flex-end', marginBottom: 18, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
        <LinearGradient
          colors={C.gradientGold}
          style={{ borderRadius: 22, borderBottomRightRadius: 5, paddingHorizontal: 18, paddingVertical: 13, maxWidth: '80%' }}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={{ fontSize: FontSizes.md, color: C.textOnPrimary, lineHeight: 23, fontWeight: '500' }}>{item.text}</Text>
        </LinearGradient>
        {item.time && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5, marginRight: 4 }}>
            <Text style={{ fontSize: 10, color: C.textMuted, opacity: 0.6 }}>{item.time}</Text>
            <MaterialCommunityIcons name="check-all" size={12} color={C.primary} style={{ opacity: 0.6 }} />
          </View>
        )}
      </Animated.View>
    );
  }

  // ── AI message ──
  return (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, gap: 10, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
      {/* Krishna avatar with gold ring */}
      <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: C.primarySoft, marginTop: 2 }}>
        <Image source={require('../../assets/images/flute.png')} style={{ width: 32, height: 32, borderRadius: 16 }} resizeMode="cover" />
      </View>

      <View style={{ flex: 1, gap: 8 }}>
        {/* AI text */}
        <GlassCard noPadding style={{ borderRadius: 20, borderTopLeftRadius: 5, paddingHorizontal: 16, paddingVertical: 14 }} intensity={40}>
          {isLatest ? (
            <TypeWriter text={item.text} style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 24 }} speed={22} />
          ) : (
            <Text style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 24 }}>{item.text}</Text>
          )}
        </GlassCard>

        {/* Verse card */}
        {item.verse && (
          <GlassCard noPadding style={{ borderRadius: 20, overflow: 'hidden' }} intensity={45}>
            {/* Gold accent strip */}
            <LinearGradient colors={C.gradientGold} style={{ height: 4 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            <View style={{ padding: 16 }}>
              {/* Chapter badge + theme */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <LinearGradient
                  colors={['rgba(194,136,64,0.18)', 'rgba(194,136,64,0.05)']}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorderGold }}
                >
                  <MaterialCommunityIcons name="book-open-variant" size={11} color={C.primary} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: C.primary, letterSpacing: 0.5 }}>
                    GITA {item.verse.chapter}.{item.verse.verse}
                  </Text>
                </LinearGradient>
                {item.verse.theme ? (
                  <Text style={{ fontSize: 10, color: C.textMuted, fontStyle: 'italic', maxWidth: 110 }} numberOfLines={1}>{item.verse.theme}</Text>
                ) : null}
              </View>

              {/* Sanskrit */}
              <LinearGradient
                colors={['rgba(194,136,64,0.11)', 'rgba(194,136,64,0.03)']}
                style={{ borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.glassBorderGold, alignItems: 'center' }}
              >
                <Text style={{ fontSize: FontSizes.md, color: C.textSanskrit, lineHeight: 28, textAlign: 'center', fontWeight: '500', letterSpacing: 0.4 }}>
                  {item.verse.sanskrit}
                </Text>
              </LinearGradient>

              {item.verse.transliteration ? (
                <Text style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic', textAlign: 'center', marginBottom: 12, lineHeight: 18, paddingHorizontal: 6 }}>
                  {item.verse.transliteration}
                </Text>
              ) : null}

              {/* Gold divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorderGold, opacity: 0.45 }} />
                <MaterialCommunityIcons name="rhombus" size={8} color={C.primary} />
                <View style={{ flex: 1, height: 1, backgroundColor: C.glassBorderGold, opacity: 0.45 }} />
              </View>

              {item.verse.hindi ? (
                <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22, marginBottom: 8 }}>{item.verse.hindi}</Text>
              ) : null}
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, lineHeight: 21, fontStyle: 'italic' }}>
                "{item.verse.english}"
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Advice card */}
        {item.advice && (
          <GlassCard noPadding style={{ borderRadius: 14, padding: 14 }} intensity={30}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: C.saffronSoft, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color={C.turmeric} />
              </View>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.turmeric, letterSpacing: 0.5 }}>{tr('practicalTakeaway')}</Text>
            </View>
            <Text style={{ fontSize: FontSizes.sm, color: C.textPrimary, lineHeight: 22 }}>{item.advice}</Text>
          </GlassCard>
        )}

        {/* Time + save action */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 2 }}>
          {item.time && <Text style={{ fontSize: 10, color: C.textMuted, opacity: 0.65 }}>{item.time}</Text>}
          <TouchableOpacity
            onPress={() => { tapLight(); Alert.alert('', 'Response noted!'); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}
          >
            <MaterialCommunityIcons name="bookmark-plus-outline" size={12} color={C.textMuted} />
            <Text style={{ fontSize: 10, color: C.textMuted }}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const { colors: C, isDark } = useTheme();
  const navigation = useNavigation();
  const { profile, displayName } = useProfile();
  const { tr } = useTranslation();
  const { useChatMessage, chatRemaining, isPremium } = usePremium();

  const [showPaywall, setShowPaywall] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const [memory, setMemory] = useState(null);
  const memoryContextRef = useRef('');
  const flatListRef = useRef(null);
  const currentLang = profile.language || 'hinglish';
  const firstName = (displayName || '').split(' ')[0] || '';

  // Load memory on mount
  useEffect(() => {
    loadMemory().then((mem) => {
      setMemory(mem);
      memoryContextRef.current = formatMemoryForPrompt(mem, firstName);
    });
  }, []);

  // Save memory when leaving the screen
  useEffect(() => {
    return () => {
      const userMsgs = messages.filter((m) => m.type === 'user' && m.id !== WELCOME_ID);
      if (userMsgs.length > 0) {
        updateMemory(messages, firstName).catch(() => {});
      }
    };
  }, [messages]);

  const greeting = getPersonalizedGreeting(memory, firstName);

  const handleNewChat = () => {
    Alert.alert('New Chat', 'Start a new conversation? Current chat will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'New Chat',
        onPress: () => {
          // Save memory before clearing
          updateMemory(messages, firstName).then((mem) => {
            setMemory(mem);
            memoryContextRef.current = formatMemoryForPrompt(mem, firstName);
          }).catch(() => {});
          resetChat();
          setMessages([WELCOME]);
          setShowSuggestions(true);
          setShowPaywall(false);
        },
      },
    ]);
  };

  const sendMessage = async (text) => {
    const msg = text || inputText.trim();
    if (!msg || isTyping) return;
    if (!(isPremium || chatRemaining > 0)) { tapError(); setShowPaywall(true); return; }
    setShowPaywall(false);
    setShowSuggestions(false);
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { id: Date.now().toString(), type: 'user', text: msg, time: now }];
    setMessages(newMessages.slice(-100));
    setInputText('');
    setIsTyping(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const result = await Promise.race([
        sendMessageToGemini(msg, currentLang, memoryContextRef.current),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000)),
      ]);
      const aiTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      if (result.success) {
        useChatMessage();
        const aiMsg = { id: (Date.now() + 1).toString(), type: 'ai', text: result.data.text, verse: result.data.verse, advice: result.data.advice, time: aiTime };
        setMessages((p) => [...p, aiMsg].slice(-100));
        // Update memory after every 3rd user message to avoid too many writes
        const userCount = newMessages.filter((m) => m.type === 'user').length;
        if (userCount % 3 === 0) {
          updateMemory([...newMessages, aiMsg], firstName).then((mem) => {
            if (mem) {
              setMemory(mem);
              memoryContextRef.current = formatMemoryForPrompt(mem, firstName);
            }
          }).catch(() => {});
        }
      } else {
        setMessages((p) => [...p, { id: (Date.now() + 1).toString(), type: 'ai', text: result.error || 'Kuch gadbad ho gayi. Please try again.', verse: null, advice: null, time: aiTime }]);
      }
    } catch (e) {
      const aiTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), type: 'ai', text: e.message === 'timeout' ? 'Response timed out. Check your connection and try again.' : 'Kuch gadbad ho gayi. Please try again.', verse: null, advice: null, time: aiTime }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPrimary }}>
      <LinearGradient colors={C.gradientWarm} style={StyleSheet.absoluteFill} />
      <StarfieldBackground />

      {/* ─── Header ─── */}
      <View style={{ zIndex: 10 }}>
        <LinearGradient
          colors={C.gradientHeader}
          style={{ paddingTop: Platform.OS === 'ios' ? 54 : 44, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.glassBorder }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Left: back + avatar + info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, justifyContent: 'center', alignItems: 'center' }}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={C.textPrimary} />
              </TouchableOpacity>

              {/* Avatar with gold ring + online badge */}
              <View>
                <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, borderColor: C.primary, overflow: 'hidden', backgroundColor: C.primarySoft }}>
                  <Image source={require('../../assets/images/flute.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
                <View style={{ position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 6.5, backgroundColor: isTyping ? C.turmeric : '#34C759', borderWidth: 2, borderColor: C.bgPrimary }} />
              </View>

              <View>
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.2 }}>Ask Krishna</Text>
                <Text style={{ fontSize: 11, color: isTyping ? C.turmeric : C.primary, fontWeight: '600', marginTop: 1 }}>
                  {isTyping ? 'Reflecting on Gita...' : 'Bhagavad Gita AI Guide'}
                </Text>
                {memory && memory.visitCount > 1 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <MaterialCommunityIcons name="brain" size={10} color={C.primary} style={{ opacity: 0.7 }} />
                    <Text style={{ fontSize: 9, color: C.primary, opacity: 0.8, fontWeight: '600' }}>
                      Remembers your journey
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Right: actions */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ChatHistory')}
                style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.glassBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.glassBorder }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="history" size={18} color={C.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNewChat}
                style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="chat-plus-outline" size={18} color={C.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ─── Messages ─── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => (
          <MessageBubble
            item={item} C={C} tr={tr}
            isLatest={item.type === 'ai' && index === messages.length - 1}
          />
        )}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={showSuggestions ? <WelcomeHero onTopicPress={sendMessage} greeting={greeting} /> : null}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      {/* ─── Input Bar ─── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 110 : 96 }}>

          {/* Paywall banner */}
          {showPaywall && (
            <View style={{ marginBottom: 10 }}>
              <PremiumBanner
                title="Daily Wisdom Reached"
                subtitle="Upgrade to Premium for unlimited conversations with Krishna."
                icon="chat-alert"
              />
            </View>
          )}

          {/* Message counter */}
          {!isPremium && !showPaywall && (
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                backgroundColor: chatRemaining <= 2 ? 'rgba(214,59,47,0.10)' : C.glassBg,
                borderWidth: 1, borderColor: chatRemaining <= 2 ? 'rgba(214,59,47,0.30)' : C.glassBorder,
                borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5,
              }}>
                <MaterialCommunityIcons name="chat-outline" size={11} color={chatRemaining <= 2 ? C.vermillion : C.textMuted} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: chatRemaining <= 2 ? C.vermillion : C.textMuted }}>
                  {chatRemaining} free {chatRemaining === 1 ? 'message' : 'messages'} left today
                </Text>
              </View>
            </View>
          )}

          {/* Input pill */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : C.glassBgStrong,
            borderRadius: 32,
            borderWidth: inputFocused ? 2 : 1.5,
            borderColor: inputFocused ? C.borderGoldStrong : C.glassBorderGold,
            paddingLeft: 6, paddingRight: 6, paddingVertical: 3,
            ...(inputFocused ? C.glassShadow : {}),
          }}>
            <TextInput
              style={{
                flex: 1, fontSize: FontSizes.md, color: C.textPrimary,
                paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
                maxHeight: 90, minHeight: 36, lineHeight: 20,
                outlineStyle: 'none', // Remove blue focus outline on web
              }}
              placeholder={tr('askAnything') || 'Ask Krishna anything...'}
              placeholderTextColor={C.textMuted}
              value={inputText}
              onChangeText={(t) => { setInputText(t); if (showPaywall) setShowPaywall(false); }}
              multiline maxLength={500} editable={!isTyping}
              selectionColor={C.primary}
              underlineColorAndroid="transparent"
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              blurOnSubmit={false}
              returnKeyType="default"
              keyboardType="default"
              autoCapitalize="sentences"
              autoCorrect={true}
              textAlignVertical="center"
            />
            {/* Character counter near limit */}
            {inputText.length > 400 && (
              <Text style={{ fontSize: 10, color: C.textMuted, paddingHorizontal: 4 }}>{inputText.length}/500</Text>
            )}
            {/* Voice + Send row with proper spacing */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 2 }}>
              {!inputText.trim() && (
                <VoiceInput
                  onResult={(t) => setInputText(t)}
                  onAutoSend={sendMessage}
                  disabled={isTyping}
                />
              )}
              {/* Send button — arrow-up like ChatGPT */}
              <TouchableOpacity
                onPress={() => { tapMedium(); sendMessage(); }}
                disabled={!inputText.trim() || isTyping}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={inputText.trim() && !isTyping ? C.gradientGold : [C.glassBg, C.glassBg]}
                  style={{ width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: inputText.trim() ? 0 : 1, borderColor: C.glassBorder }}
                >
                  <MaterialCommunityIcons
                    name="arrow-up"
                    size={20}
                    color={inputText.trim() && !isTyping ? C.textOnPrimary : C.textMuted}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
