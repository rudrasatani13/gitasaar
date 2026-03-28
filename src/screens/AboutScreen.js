// src/screens/AboutScreen.js
import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import AppLogo from '../components/AppLogo';
import GlassCard from '../components/GlassCard';

const APP_VERSION = '1.0.0';
const BUILD = '2026.03';

export default function AboutScreen({ navigation }) {
  const { colors: C } = useTheme();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const openLink = (url) => {
    if (typeof window !== 'undefined') window.open(url, '_blank');
    else Linking.openURL(url).catch(() => {});
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Logo + Name */}
        <Animated.View style={{ alignItems: 'center', marginTop: 20, marginBottom: 28, opacity: fadeIn }}>
          <Animated.View style={{ transform: [{ scale: logoScale }], marginBottom: 16 }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: C.glassBorderGold, ...C.glassShadow }}>
              <AppLogo size={70} />
            </View>
          </Animated.View>
          <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '800', color: C.textPrimary }}>GitaSaar</Text>
          <Text style={{ fontSize: FontSizes.lg, color: C.primary, fontWeight: '500', marginTop: 4 }}>{'गीता सार'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <View style={{ backgroundColor: C.glassBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorderGold }}>
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary }}>v{APP_VERSION}</Text>
            </View>
            <View style={{ backgroundColor: C.glassBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: C.glassBorder }}>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Build {BUILD}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Mission */}
        <Animated.View style={{ paddingHorizontal: 20, marginBottom: 24, opacity: fadeIn }}>
          <GlassCard noPadding style={{ borderRadius: 20, padding: 24 }} intensity={45}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MaterialCommunityIcons name="heart-outline" size={18} color={C.primary} />
              <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary }}>Our Mission</Text>
            </View>
            <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22 }}>
              GitaSaar brings the timeless wisdom of the Bhagavad Gita to your fingertips. Our goal is to make this sacred scripture accessible, understandable, and applicable to modern life — in a way that's personal, beautiful, and deeply meaningful.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.glassBorder }}>
              <Text style={{ fontSize: 20 }}>{'\u0950'}</Text>
              <Text style={{ fontSize: FontSizes.sm, color: C.primary, fontStyle: 'italic', flex: 1 }}>
                "Whenever there is a decline in righteousness, I manifest myself." — Gita 4.7
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* App Stats */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { num: '700', label: 'Sacred Verses', icon: 'book-open-variant', color: C.primary },
              { num: '18', label: 'Chapters', icon: 'layers-outline', color: C.peacockBlue },
              { num: '3', label: 'Languages', icon: 'translate', color: C.saffron },
            ].map((s) => (
              <GlassCard key={s.label} noPadding style={{ flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' }} intensity={35}>
                <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
                <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.textPrimary, marginTop: 6 }}>{s.num}</Text>
                <Text style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>POWERED BY</Text>
          <GlassCard noPadding style={{ borderRadius: 20, overflow: 'hidden' }} intensity={40}>
            {[
              { icon: 'robot-outline', title: 'Google Gemini AI', desc: 'Intelligent spiritual guidance', color: '#4285F4' },
              { icon: 'headphones', title: 'ElevenLabs', desc: 'Premium audio recitation', color: '#E8793A' },
              { icon: 'firebase', title: 'Firebase', desc: 'Secure authentication & sync', color: '#FFCA28' },
              { icon: 'language-javascript', title: 'React Native + Expo', desc: 'Cross-platform experience', color: '#61DAFB' },
            ].map((item, i) => (
              <View key={item.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: C.glassBorder }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: item.color + '12', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                </View>
                <View>
                  <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>{item.title}</Text>
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>

        {/* Developer */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 12 }}>MADE WITH DEVOTION BY</Text>
          <GlassCard noPadding style={{ borderRadius: 20, padding: 20 }} intensity={45}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: C.glassBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: C.glassBorderGold }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: C.primary }}>R</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary }}>Rudra</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>Creator & Developer</Text>
              </View>
            </View>
            <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 20, marginTop: 14 }}>
              Built with love and devotion for all who walk the path of dharma. This app is my offering to Lord Krishna and all who seek His wisdom.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={() => openLink('https://instagram.com/')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}>
                <MaterialCommunityIcons name="instagram" size={16} color="#E1306C" />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textPrimary }}>Instagram</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink('mailto:support@gitasaar.app')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder }}>
                <MaterialCommunityIcons name="email-outline" size={16} color={C.primary} />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textPrimary }}>Email</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* Legal links */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, alignItems: 'center' }}>
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy', { tab: 'terms' })} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, alignItems: 'center' }}>
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingBottom: 40 }}>
          <AppLogo size={28} />
          <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 8 }}>GitaSaar v{APP_VERSION}</Text>
          <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>© 2026 GitaSaar. All rights reserved.</Text>
          <Text style={{ fontSize: FontSizes.sm, color: C.primary, marginTop: 10 }}>{'श्रीकृष्णार्पणमस्तु 🙏'}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}