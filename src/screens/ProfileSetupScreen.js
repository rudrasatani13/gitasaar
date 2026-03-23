// src/screens/ProfileSetupScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { FontSizes } from '../theme/colors';

const REFERRAL_OPTIONS = [
  { label: 'Instagram', icon: 'instagram', value: 'instagram' },
  { label: 'YouTube', icon: 'youtube', value: 'youtube' },
  { label: 'Friend / Family', icon: 'account-group-outline', value: 'friend' },
  { label: 'Play Store / App Store', icon: 'storefront-outline', value: 'store' },
  { label: 'Twitter / X', icon: 'twitter', value: 'twitter' },
  { label: 'Other', icon: 'dots-horizontal', value: 'other' },
];

export default function ProfileSetupScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0); // 0=name, 1=birthdate, 2=referral
  const [name, setName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [referral, setReferral] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateNext = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = async () => {
    if (step === 0 && !name.trim()) return;

    if (step < 2) {
      animateNext(() => setStep(step + 1));
    } else {
      // Save everything
      const birthdate = (birthDay && birthMonth && birthYear)
        ? birthYear + '-' + birthMonth.padStart(2, '0') + '-' + birthDay.padStart(2, '0')
        : '';

      await updateProfile({
        name: name.trim(),
        birthdate,
        referral,
        setupComplete: true,
      });
      await AsyncStorage.setItem('@gitasaar_setup_done', 'true');
      navigation.replace('Main');
    }
  };

  const handleSkip = async () => {
    await updateProfile({ setupComplete: true });
    await AsyncStorage.setItem('@gitasaar_setup_done', 'true');
    navigation.replace('Main');
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 80 }} keyboardShouldPersistTaps="handled">

          {/* Skip */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 }}>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ height: 4, borderRadius: 2, width: i === step ? 32 : 12, backgroundColor: i <= step ? C.primary : C.border }} />
            ))}
          </View>
          <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, textAlign: 'center', letterSpacing: 1, marginBottom: 32 }}>
            STEP {step + 1} OF 3
          </Text>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>

            {/* ===== STEP 0: NAME ===== */}
            {step === 0 && (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primarySoft, borderWidth: 1.5, borderColor: C.borderGold, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <MaterialCommunityIcons name="account-heart-outline" size={30} color={C.primary} />
                </View>
                <Text style={{ fontSize: FontSizes.xxl, fontWeight: '700', color: C.textPrimary, textAlign: 'center', marginBottom: 6 }}>Welcome to GitaSaar!</Text>
                <Text style={{ fontSize: FontSizes.md, color: C.textMuted, textAlign: 'center', marginBottom: 32 }}>{'हम आपको क्या बुलाएँ?'}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1.5, borderColor: C.border, width: '100%', marginBottom: 20 }}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={C.textMuted} />
                  <TextInput style={{ flex: 1, fontSize: FontSizes.lg, color: C.textPrimary, paddingVertical: 18, paddingHorizontal: 12, textAlign: 'center', outlineStyle: 'none', outlineWidth: 0 }}
                    placeholder="Apna naam daalein..." placeholderTextColor={C.textMuted}
                    value={name} onChangeText={setName} autoFocus autoCapitalize="words" />
                </View>

                <TouchableOpacity onPress={handleNext} disabled={!name.trim()} activeOpacity={0.85} style={{ width: '100%' }}>
                  <LinearGradient colors={name.trim() ? C.gradientGold : [C.border, C.borderLight]}
                    style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: name.trim() ? C.textOnPrimary : C.textMuted }}>Continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color={name.trim() ? C.textOnPrimary : C.textMuted} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* ===== STEP 1: BIRTHDATE ===== */}
            {step === 1 && (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primarySoft, borderWidth: 1.5, borderColor: C.borderGold, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <MaterialCommunityIcons name="cake-variant-outline" size={30} color={C.primary} />
                </View>
                <Text style={{ fontSize: FontSizes.xxl, fontWeight: '700', color: C.textPrimary, textAlign: 'center', marginBottom: 6 }}>Your Birthday</Text>
                <Text style={{ fontSize: FontSizes.md, color: C.textMuted, textAlign: 'center', marginBottom: 32 }}>{'आपकी जन्मतिथि (optional)'}</Text>

                <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 }}>
                  <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 16, paddingHorizontal: 12, borderWidth: 1.5, borderColor: C.border }}>
                    <TextInput style={{ fontSize: FontSizes.lg, color: C.textPrimary, paddingVertical: 18, textAlign: 'center', outlineStyle: 'none', outlineWidth: 0 }}
                      placeholder="DD" placeholderTextColor={C.textMuted}
                      value={birthDay} onChangeText={(t) => { if (t.length <= 2) setBirthDay(t.replace(/[^0-9]/g, '')); }}
                      keyboardType="number-pad" maxLength={2} />
                  </View>
                  <View style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: 16, paddingHorizontal: 12, borderWidth: 1.5, borderColor: C.border }}>
                    <TextInput style={{ fontSize: FontSizes.lg, color: C.textPrimary, paddingVertical: 18, textAlign: 'center', outlineStyle: 'none', outlineWidth: 0 }}
                      placeholder="MM" placeholderTextColor={C.textMuted}
                      value={birthMonth} onChangeText={(t) => { if (t.length <= 2) setBirthMonth(t.replace(/[^0-9]/g, '')); }}
                      keyboardType="number-pad" maxLength={2} />
                  </View>
                  <View style={{ flex: 1.5, backgroundColor: C.bgCard, borderRadius: 16, paddingHorizontal: 12, borderWidth: 1.5, borderColor: C.border }}>
                    <TextInput style={{ fontSize: FontSizes.lg, color: C.textPrimary, paddingVertical: 18, textAlign: 'center', outlineStyle: 'none', outlineWidth: 0 }}
                      placeholder="YYYY" placeholderTextColor={C.textMuted}
                      value={birthYear} onChangeText={(t) => { if (t.length <= 4) setBirthYear(t.replace(/[^0-9]/g, '')); }}
                      keyboardType="number-pad" maxLength={4} />
                  </View>
                </View>

                <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={{ width: '100%' }}>
                  <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>
                      {birthDay && birthMonth && birthYear ? 'Continue' : 'Skip this'}
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color={C.textOnPrimary} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* ===== STEP 2: REFERRAL ===== */}
            {step === 2 && (
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primarySoft, borderWidth: 1.5, borderColor: C.borderGold, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                  <MaterialCommunityIcons name="account-search-outline" size={30} color={C.primary} />
                </View>
                <Text style={{ fontSize: FontSizes.xxl, fontWeight: '700', color: C.textPrimary, textAlign: 'center', marginBottom: 6 }}>How did you find us?</Text>
                <Text style={{ fontSize: FontSizes.md, color: C.textMuted, textAlign: 'center', marginBottom: 28 }}>{'आपने हमारे बारे में कहाँ सुना?'}</Text>

                <View style={{ gap: 10, width: '100%', marginBottom: 20 }}>
                  {REFERRAL_OPTIONS.map((opt) => {
                    const sel = referral === opt.value;
                    return (
                      <TouchableOpacity key={opt.value} onPress={() => setReferral(opt.value)}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 14,
                          backgroundColor: sel ? C.primarySoft : C.bgCard,
                          borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
                          borderWidth: 1.5, borderColor: sel ? C.primary : C.border,
                        }} activeOpacity={0.8}>
                        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: sel ? C.primary + '15' : C.bgSecondary, justifyContent: 'center', alignItems: 'center' }}>
                          <MaterialCommunityIcons name={opt.icon} size={18} color={sel ? C.primary : C.textMuted} />
                        </View>
                        <Text style={{ flex: 1, fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }}>{opt.label}</Text>
                        {sel ? (
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="check" size={13} color={C.textOnPrimary} />
                          </View>
                        ) : (
                          <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: C.border }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={{ width: '100%' }}>
                  <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>
                      {'Let\u2019s Start!'}
                    </Text>
                    <MaterialCommunityIcons name="om" size={18} color={C.textOnPrimary} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Bottom */}
          <View style={{ alignItems: 'center', marginTop: 'auto', paddingVertical: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 20, height: 1, backgroundColor: C.primary, opacity: 0.2 }} />
              <MaterialCommunityIcons name="om" size={14} color={C.primary} style={{ opacity: 0.3 }} />
              <View style={{ width: 20, height: 1, backgroundColor: C.primary, opacity: 0.2 }} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}