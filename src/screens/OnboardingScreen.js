// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, FlatList, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { FontSizes } from '../theme/colors';
import AppLogo from '../components/AppLogo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notifyNavStateChanged } from '../utils/navEvents';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'book-open-page-variant',
    title: 'All 700 Sacred Verses',
    subtitle: 'Complete Bhagavad Gita with Sanskrit, Hindi meaning, and English translation',
    color: '#C28840',
    gradient: ['#FDF8EF', '#F5E0BE'],
  },
  {
    id: '2',
    icon: 'chat-processing-outline',
    title: 'Ask Krishna Anything',
    subtitle: 'AI-powered spiritual guide that understands your problems and shares Gita wisdom',
    color: '#14918E',
    gradient: ['#EBF8F8', '#D0F0EF'],
  },
  {
    id: '3',
    icon: 'notebook-edit-outline',
    title: 'Your Spiritual Journal',
    subtitle: 'Write daily reflections, track your mood, and grow on your spiritual path',
    color: '#7B1830',
    gradient: ['#FDF0F2', '#F5D5DA'],
  },
  {
    id: '4',
    icon: 'fire',
    title: 'Build Daily Streak',
    subtitle: 'Read verses daily, earn badges, and track your journey through the Gita',
    color: '#E8793A',
    gradient: ['#FFF5EE', '#FFE0CC'],
  },
  {
    id: '5',
    icon: 'account-group-outline',
    title: 'Join the Community',
    subtitle: 'Share reflections, inspire others, and walk the path of dharma together',
    color: '#2E7D50',
    gradient: ['#EEF8F2', '#D0F0DC'],
  },
];

const LANGUAGES = [
  { id: 'english', label: 'English', native: 'English' },
  { id: 'hinglish', label: 'Hinglish', native: 'हिंग्लिश' },
  { id: 'hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી' },
  { id: 'marathi', label: 'Marathi', native: 'मराठी' },
  { id: 'tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'bengali', label: 'Bengali', native: 'বাংলা' },
  { id: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { id: 'malayalam', label: 'Malayalam', native: 'മലയാളം' },
];

export default function OnboardingScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { updateProfile } = useProfile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [selectedLang, setSelectedLang] = useState('english');
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const goNext = () => {
    if (isLastSlide) {
      setShowLangPicker(true);
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const goSkip = () => {
    setShowLangPicker(true);
  };

  const finishOnboarding = async () => {
    await updateProfile({ language: selectedLang, onboarded: true });
    await AsyncStorage.setItem('@gitasaar_onboarded', 'true');
    notifyNavStateChanged(); // issue 6: update AppNavigator state reactively
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      navigation.replace('ProfileSetup');
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const renderSlide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const iconScale = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });
    const iconOpacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
    const textY = scrollX.interpolate({ inputRange, outputRange: [30, 0, 30], extrapolate: 'clamp' });
    const textOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });

    return (
      <View style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        {/* Icon */}
        <Animated.View style={{ transform: [{ scale: iconScale }], opacity: iconOpacity, marginBottom: 30 }}>
          <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: item.color + '12', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: item.color + '25' }}>
            <MaterialCommunityIcons name={item.icon} size={48} color={item.color} />
          </View>
        </Animated.View>

        {/* Text */}
        <Animated.View style={{ transform: [{ translateY: textY }], opacity: textOpacity, alignItems: 'center' }}>
          <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginBottom: 12 }}>{item.title}</Text>
          <Text style={{ fontSize: FontSizes.md, color: C.textMuted, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 }}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    );
  };

  // Language picker
  if (showLangPicker) {
    return (
      <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: 80, paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <AppLogo size={60} />
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary, marginTop: 16 }}>Choose Language</Text>
            <Text style={{ fontSize: FontSizes.md, color: C.textMuted, marginTop: 6 }}>You can change this anytime in Settings</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 30 }}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity key={lang.id} onPress={() => setSelectedLang(lang.id)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
                  backgroundColor: selectedLang === lang.id ? C.primarySoft : C.bgCard,
                  borderWidth: 1.5, borderColor: selectedLang === lang.id ? C.primary : C.border,
                  minWidth: 90, alignItems: 'center',
                }}>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: selectedLang === lang.id ? C.primary : C.textPrimary }}>{lang.label}</Text>
                <Text style={{ fontSize: FontSizes.xs, color: selectedLang === lang.id ? C.primary : C.textMuted, marginTop: 2 }}>{lang.native}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={finishOnboarding} activeOpacity={0.85}>
            <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.textOnPrimary }}>Begin Your Journey</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={C.textOnPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
        {/* Skip */}
        <View style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppLogo size={36} />
          <TouchableOpacity onPress={goSkip} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textMuted }}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          style={{ flex: 1 }}
        />

        {/* Bottom */}
        <View style={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 50 : 30 }}>
          {/* Dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {SLIDES.map((_, i) => {
              // width is not supported by the native animated driver — use scaleX instead
              const dotScale = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [1 / 3, 1, 1 / 3],
                extrapolate: 'clamp',
              });
              const dotOpacity = scrollX.interpolate({
                inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View key={i} style={{
                  width: 24, height: 8, borderRadius: 4,
                  backgroundColor: C.primary, opacity: dotOpacity,
                  transform: [{ scaleX: dotScale }],
                }} />
              );
            })}
          </View>

          {/* Next button */}
          <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
            <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.textOnPrimary }}>
                {isLastSlide ? 'Get Started' : 'Next'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={C.textOnPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}