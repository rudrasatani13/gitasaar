// src/screens/LanguageScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { FontSizes } from '../theme/colors';

const LANGUAGES = [
  { id: 'hinglish', label: 'Hinglish', native: 'हिंग्लिश', desc: 'Hindi + English mix', icon: 'message-text-outline', popular: true },
  { id: 'hindi', label: 'Hindi', native: 'हिन्दी', desc: 'शुद्ध हिंदी में', icon: 'abjad-hindi', popular: true },
  { id: 'english', label: 'English', native: 'English', desc: 'Pure English', icon: 'alphabetical-variant', popular: true },
  { id: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી', desc: 'Gujarat ni bhasha', icon: 'translate' },
  { id: 'marathi', label: 'Marathi', native: 'मराठी', desc: 'Maharashtra chi bhasha', icon: 'translate' },
  { id: 'tamil', label: 'Tamil', native: 'தமிழ்', desc: 'Tamizh mozhiyil', icon: 'translate' },
  { id: 'telugu', label: 'Telugu', native: 'తెలుగు', desc: 'Telugu lo', icon: 'translate' },
  { id: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ', desc: 'Kannada dalli', icon: 'translate' },
  { id: 'bengali', label: 'Bengali', native: 'বাংলা', desc: 'Bangla bhasay', icon: 'translate' },
  { id: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', desc: 'Punjabi vich', icon: 'translate' },
  { id: 'malayalam', label: 'Malayalam', native: 'മലയാളം', desc: 'Malayalathil', icon: 'translate' },
  { id: 'odia', label: 'Odia', native: 'ଓଡ଼ିଆ', desc: 'Odia re', icon: 'translate' },
];

function LanguageCard({ lang, isSelected, onSelect, C }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, friction: 8, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          backgroundColor: isSelected ? C.primarySoft : C.bgCard,
          borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16,
          borderWidth: 1.5, borderColor: isSelected ? C.primary : C.border,
          marginBottom: 10,
          ...(isSelected ? C.shadowGold : C.shadowLight),
        }}
      >
        <View style={{
          width: 44, height: 44, borderRadius: 22,
          backgroundColor: isSelected ? C.primary + '18' : C.bgSecondary,
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: isSelected ? C.primary + '40' : C.border,
        }}>
          <MaterialCommunityIcons name={lang.icon} size={20} color={isSelected ? C.primary : C.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: FontSizes.lg, fontWeight: '600', color: C.textPrimary }}>{lang.label}</Text>
            <Text style={{ fontSize: FontSizes.md, color: C.textSecondary }}>{lang.native}</Text>
            {lang.popular && (
              <View style={{ backgroundColor: C.saffronSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: C.saffron }}>POPULAR</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>{lang.desc}</Text>
        </View>
        {isSelected ? (
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="check" size={14} color={C.textOnPrimary} />
          </View>
        ) : (
          <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: C.border }} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LanguageScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { profile, updateProfile } = useProfile();
  const [selected, setSelected] = useState(profile.language || 'hinglish');
  const [saved, setSaved] = useState(false);

  const handleSelect = (langId) => {
    setSelected(langId);
    updateProfile({ language: langId });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Language</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{'भाषा चुनें'}</Text>
            </View>
          </View>
          {saved && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
              <MaterialCommunityIcons name="check-circle" size={14} color="#2E7D50" />
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: '#2E7D50' }}>Saved!</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Info card */}
        <View style={{ backgroundColor: C.bgSecondary, borderRadius: 12, padding: 14, marginBottom: 20, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: C.border }}>
          <MaterialCommunityIcons name="information-outline" size={18} color={C.primary} />
          <Text style={{ flex: 1, fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 20 }}>
            Ye language AI chat responses aur app content ke liye use hogi. Sanskrit shlokas hamesha original mein dikhenge.
          </Text>
        </View>

        {/* Popular */}
        <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>POPULAR</Text>
        {LANGUAGES.filter(l => l.popular).map((lang) => (
          <LanguageCard key={lang.id} lang={lang} isSelected={selected === lang.id} onSelect={() => handleSelect(lang.id)} C={C} />
        ))}

        {/* All Languages */}
        <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12, marginTop: 8 }}>ALL LANGUAGES</Text>
        {LANGUAGES.filter(l => !l.popular).map((lang) => (
          <LanguageCard key={lang.id} lang={lang} isSelected={selected === lang.id} onSelect={() => handleSelect(lang.id)} C={C} />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}