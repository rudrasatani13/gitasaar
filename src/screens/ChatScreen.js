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
import { tapMedium, tapError } from '../utils/haptics'; // Added tapError for limits
import { usePremium } from '../theme/PremiumContext'; // NAYA: Premium limits ke liye
import { PremiumBanner } from '../components/PremiumGate'; // NAYA: Limit banner dikhane ke liye

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
        {item.time && <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 4, marginRight: 4, opacity: 0.6 }}>{item.time}</Text>}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.primarySoft, borderWidth: 1, borderColor: C.borderGold, justifyContent: 'center', alignItems: 'center', marginTop: 2, overflow: 'hidden' }}>
        <Image source={require('../../assets/images/flute.png')} style={{ width: 24, height: 24, borderRadius: 12 }} resizeMode='cover' />
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ backgroundColor: C.bgCard, borderRadius: 20, borderTopLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: C.borderLight, ...C.shadowLight }}>
          {isLatest ? (
            <TypeWriter text={item.text} style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 23 }} speed={25} />
          ) : (
            <Text style={{ fontSize: FontSizes.md, color: C.textPrimary, lineHeight: 23 }}>{item.text}</Text>
          )}
        </View>

        {/* Spiritual Image */}
        {item.verse && <ResponseImage theme={item.verse.theme} />}

        {/* Verse Card */}
        {item.verse && (
          <View style={{ backgroundColor: C.bgCardElevated, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...C.shadow }}>
            <View style={{ height: 3, backgroundColor: C.primary }} />
            <View style={{ padding: 16 }}>
              <View style={{ position: 'absolute', top: 7, left: 7, width: 12, height: 12, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderColor: C.borderGold, borderTopLeftRadius: 3, opacity: 0.3 }} />
              <View style={{ position: 'absolute', bottom: 7, right: 7, width: 12, height: 12, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: C.borderGold, borderBottomRightRadius: 3, opacity: 0.3 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: C.borderGold }}>
                  <MaterialCommunityIcons name="book-open-variant" size={10} color={C.primary} />
                  <Text style={{ fontSize: 10, fontWeight: '800', color: C.primary }}>Gita {item.verse.chapter}.{item.verse.verse}</Text>
                </View>
                {item.verse.theme ? <Text style={{ fontSize: 10, color: C.textMuted, fontStyle: 'italic' }}>{item.verse.theme}</Text> : null}
              </View>

              <View style={{ backgroundColor: C.bgSecondary, borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row' }}>
                <View style={{ width: 3, backgroundColor: C.primary, borderRadius: 2, marginRight: 12, opacity: 0.6 }} />
                <Text style={{ flex: 1, fontSize: FontSizes.md, color: C.textSanskrit, lineHeight: 26 }}>{item.verse.sanskrit}</Text>
              </View>

              {item.verse.transliteration ? <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontStyle: 'italic', textAlign: 'center', marginBottom: 10, lineHeight: 18 }}>{item.verse.transliteration}</Text> : null}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
                <View style={{ width: 4, height: 4, backgroundColor: C.primary, opacity: 0.3, transform: [{ rotate: '45deg' }] }} />
                <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
              </View>

              {item.verse.hindi ? <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 21, marginBottom: 6 }}>{item.verse.hindi}</Text> : null}
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, lineHeight: 21, fontStyle: 'italic' }}>"{item.verse.english}"</Text>
            </View>
          </View>
        )}

        {/* Advice */}
        {item.advice && (
          <View style={{ backgroundColor: C.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.borderLight }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.saffronSoft, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={12} color={C.turmeric} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '800', color: C.turmeric, letterSpacing: 0.5 }}>{tr('practicalTakeaway')}</Text>
            </View>
            <Text style={{ fontSize: FontSizes.sm, color: C.textPrimary, lineHeight: 22 }}>{item.advice}</Text>
          </View>
        )}

        {item.time && <Text style={{ fontSize: 10, color: C.textMuted, marginLeft: 4, opacity: 0.6 }}>{item.time}</Text>}
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { colors: C } = useTheme();
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
    Alert.alert('New Chat', 'Naya chat start karna hai? Purana chat clear ho jayega.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New Chat', onPress: () => { resetChat(); setMessages([WELCOME]); setShowSuggestions(true); setShowPaywall(false); } },
    ]);
  };

  const sendMessage = async (text) => {
    const msg = text || inputText.trim();
    if (!msg || isTyping) return;

    // --- LIMIT CHECK KARO ---
    const canChat = useChatMessage();
    if (!canChat) {
      tapError();
      setShowPaywall(true); // Limit khatam, banner dikhao
      return;
    }
    // ------------------------

    setShowPaywall(false);
    setShowSuggestions(false);
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setMessages((p) => [...p, { id: Date.now().toString(), type: 'user', text: msg, time: now }]);
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const result = await sendMessageToGemini(msg, currentLang);
    const aiTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    if (result.success) {
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), type: 'ai', text: result.data.text, verse: result.data.verse, advice: result.data.advice, time: aiTime }]);
    } else {
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), type: 'ai', text: result.error || 'Kuch gadbad ho gayi.', verse: null, advice: null, time: aiTime }]);
    }
    setIsTyping(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={<>
          {showSuggestions && (
            <View style={{ marginTop: 6, marginBottom: 14 }}>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 }}>Try asking about...</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bgCard, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border }} onPress={() => sendMessage(s.text)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={s.icon} size={14} color={C.primary} />
                    <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, fontWeight: '500' }}>{s.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {isTyping && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <Image source={require('../../assets/images/flute.png')} style={{ width: 18, height: 18, borderRadius: 9 }} resizeMode='cover' />
              </View>
              <View style={{ backgroundColor: C.bgCard, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: C.borderLight }}>
                <TypingDots />
              </View>
            </View>
          )}
        </>}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <View style={{ backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.borderLight, paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 12 }}>
          
          {/* NAYA PAYWALL BANNER: Jab limit hit ho */}
          {showPaywall && (
            <View style={{ marginBottom: 12 }}>
               <PremiumBanner 
                 title="Daily Wisdom Reached" 
                 subtitle="Upgrade to Premium for unlimited deep conversations with Krishna." 
                 icon="chat-alert" 
               />
            </View>
          )}

          {/* FREE USER CHAT COUNTER */}
          {!isPremium && !showPaywall && (
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
               <Text style={{ fontSize: 11, color: chatRemaining <= 2 ? '#D63B2F' : C.textMuted, fontWeight: '600' }}>
                 {chatRemaining} free messages left today
               </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput style={{ flex: 1, fontSize: FontSizes.md, color: C.textPrimary, backgroundColor: C.bgInput, borderRadius: 24, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 18, paddingVertical: 12, maxHeight: 100, minHeight: 44, outlineStyle: 'none', outlineWidth: 0 }}
              placeholder={tr('askAnything')} placeholderTextColor={C.textMuted}
              value={inputText} 
              onChangeText={(text) => {
                 setInputText(text);
                 if (showPaywall) setShowPaywall(false); // Type karte hi banner hide karo
              }} 
              multiline maxLength={500} editable={!isTyping} />
            {!inputText.trim() && (
              <VoiceInput onResult={(text) => { setInputText(text); }} onAutoSend={(text) => { sendMessage(text); }} disabled={isTyping} />
            )}
            <TouchableOpacity onPress={() => { tapMedium(); sendMessage(); }} disabled={!inputText.trim() || isTyping} activeOpacity={0.8}>
              <LinearGradient colors={inputText.trim() && !isTyping ? C.gradientGold : [C.border, C.borderLight]}
                style={{ width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="send" size={17} color={inputText.trim() && !isTyping ? C.textOnPrimary : C.textMuted} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}