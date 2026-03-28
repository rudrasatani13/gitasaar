// src/screens/PremiumScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { usePremium } from '../theme/PremiumContext';
import { FontSizes } from '../theme/colors';
import { startPayment, detectRegion, getPlans } from '../utils/payment';

// Free limits must match PremiumContext: chat 5/day, audio 3/day, quiz 1/day, folders 4, templates 2
const FEATURES = [
  { icon: 'chat-processing-outline', title: 'Unlimited AI Chat', free: '5/day', color: '#C28840' },
  { icon: 'card-multiple-outline', title: 'All Share Templates', free: '2 only', color: '#14918E' },
  { icon: 'headphones', title: 'Audio Recitation', free: '3/day', color: '#E8793A' },
  { icon: 'head-question-outline', title: 'Unlimited Quiz', free: '1/day', color: '#7B1830' },
  { icon: 'folder-multiple-outline', title: 'Bookmark Folders', free: '4 folders', color: '#C95A6A' },
  { icon: 'file-export-outline', title: 'Export Journal', free: 'Free', color: '#0E6B6B' },
  { icon: 'close-circle-outline', title: 'Ad-Free', free: 'With ads', color: '#D63B2F' },
];

export default function PremiumScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { displayName, email } = useProfile();
  const { isPremium, planType, expiryDate, cancelPremium } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [region, setRegion] = useState(null);
  const [plans, setPlans] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);

  const crownScale = useRef(new Animated.Value(0.5)).current;
  const crownY = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(crownScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(crownY, { toValue: -8, duration: 3000, useNativeDriver: true }),
        Animated.timing(crownY, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Detect region for pricing
    detectRegion()
      .then((r) => {
        setRegion(r);
        setPlans(getPlans(r));
      })
      .catch(() => {
        setRegion('international');
        setPlans(getPlans('international'));
      })
      .finally(() => setPlansLoading(false));
  }, []);

  const monthly = plans?.monthly;
  const yearly = plans?.yearly;

  const handlePurchase = () => {
    setProcessing(true);
    setError('');
    // Cloud Function verifies payment + writes premium to Firestore.
    // PremiumContext's onSnapshot listener picks up the change automatically.
    startPayment(
      selectedPlan, email, displayName,
      () => { setProcessing(false); },
      (errMsg) => { setError(errMsg); setProcessing(false); }
    );
  };

  // Already premium
  if (isPremium) {
    const expDate = expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    return (
      <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 56 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <LinearGradient colors={C.gradientGold} style={{ width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16, ...C.shadowGold }}>
              <MaterialCommunityIcons name="crown" size={44} color={C.textOnPrimary} />
            </LinearGradient>
            <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '800', color: C.textPrimary }}>You're Premium!</Text>
            <Text style={{ fontSize: FontSizes.md, color: C.primary, fontWeight: '600', marginTop: 6 }}>{planType === 'yearly' ? 'Yearly' : 'Monthly'} Plan</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 4 }}>Valid until {expDate}</Text>
          </View>
          <View style={{ backgroundColor: C.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, ...C.shadow }}>
            {FEATURES.map((f, i) => (
              <View key={f.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i < FEATURES.length - 1 ? 1 : 0, borderBottomColor: C.borderLight }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: f.color + '12', justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={f.icon} size={18} color={f.color} />
                </View>
                <Text style={{ flex: 1, fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>{f.title}</Text>
                <MaterialCommunityIcons name="check-circle" size={20} color={C.success} />
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={cancelPremium} style={{ alignItems: 'center', marginTop: 24, paddingVertical: 12 }}>
            <Text style={{ fontSize: FontSizes.sm, color: C.vermillion }}>Cancel Subscription</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingTop: 56, paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Animated.View style={{ alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 24, opacity: fadeIn }}>
          <Animated.View style={{ transform: [{ scale: crownScale }, { translateY: crownY }], marginBottom: 20 }}>
            <LinearGradient colors={C.gradientGold} style={{ width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', ...C.shadowGold }}>
              <MaterialCommunityIcons name="crown" size={44} color={C.textOnPrimary} />
            </LinearGradient>
          </Animated.View>
          <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '800', color: C.textPrimary, textAlign: 'center', letterSpacing: -0.5 }}>GitaSaar Premium</Text>
          <Text style={{ fontSize: FontSizes.md, color: C.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 24 }}>
            The complete Bhagavad Gita experience,{'\n'}unlimited and ad-free.
          </Text>
          {/* Region badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, backgroundColor: C.bgSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <MaterialCommunityIcons name="earth" size={12} color={C.textMuted} />
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{plansLoading ? 'Detecting region...' : region === 'india' ? 'Pricing in INR' : 'Pricing in USD'}</Text>
          </View>
        </Animated.View>

        {/* Plan Cards */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 }}>
          {plansLoading ? (
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator color={C.primary} size="large" />
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginTop: 10 }}>Loading pricing...</Text>
            </View>
          ) : (
            <>
              {/* Monthly */}
              <TouchableOpacity onPress={() => setSelectedPlan('monthly')} activeOpacity={0.8} style={{ flex: 1 }}>
                <View style={{
                  borderRadius: 20, padding: 20, alignItems: 'center',
                  backgroundColor: selectedPlan === 'monthly' ? C.bgCardElevated : C.bgCard,
                  borderWidth: 2, borderColor: selectedPlan === 'monthly' ? C.primary : C.border,
                  ...C.shadowLight,
                }}>
                  {selectedPlan === 'monthly' && (
                    <View style={{ position: 'absolute', top: 10, right: 10 }}>
                      <MaterialCommunityIcons name="check-circle" size={20} color={C.primary} />
                    </View>
                  )}
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.textMuted, letterSpacing: 1, marginBottom: 10 }}>MONTHLY</Text>
                  <Text style={{ fontSize: 36, fontWeight: '800', color: C.textPrimary }}>{monthly?.display}</Text>
                  <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>per month</Text>
                </View>
              </TouchableOpacity>

              {/* Yearly */}
              <TouchableOpacity onPress={() => setSelectedPlan('yearly')} activeOpacity={0.8} style={{ flex: 1 }}>
                <View style={{
                  borderRadius: 20, padding: 20, alignItems: 'center', overflow: 'hidden',
                  backgroundColor: selectedPlan === 'yearly' ? C.bgCardElevated : C.bgCard,
                  borderWidth: 2, borderColor: selectedPlan === 'yearly' ? C.primary : C.border,
                  ...C.shadowLight,
                }}>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: C.success, paddingVertical: 4, alignItems: 'center' }}>
                    <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: '#FFF', letterSpacing: 1 }}>BEST VALUE — SAVE {yearly?.save}</Text>
                  </View>
                  {selectedPlan === 'yearly' && (
                    <View style={{ position: 'absolute', top: 28, right: 10 }}>
                      <MaterialCommunityIcons name="check-circle" size={20} color={C.primary} />
                    </View>
                  )}
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.textMuted, letterSpacing: 1, marginTop: 14, marginBottom: 10 }}>YEARLY</Text>
                  <Text style={{ fontSize: 36, fontWeight: '800', color: C.textPrimary }}>{yearly?.display}</Text>
                  <Text style={{ fontSize: FontSizes.sm, color: C.success, fontWeight: '600', marginTop: 2 }}>Just {yearly?.perMonth}/month</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Error */}
        {error ? (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View style={{ backgroundColor: 'rgba(239,68,68,0.10)', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' }}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={C.error} />
              <Text style={{ fontSize: FontSizes.sm, color: C.error, flex: 1 }}>{error}</Text>
              <TouchableOpacity onPress={() => setError('')}>
                <MaterialCommunityIcons name="close" size={14} color={C.error} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Subscribe Button */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity onPress={handlePurchase} disabled={processing || plansLoading} activeOpacity={0.85}>
            <LinearGradient colors={processing ? [C.textMuted, C.textMuted] : C.gradientGold} style={{ borderRadius: 20, paddingVertical: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, ...C.shadowGold }}>
              <MaterialCommunityIcons name={processing ? 'loading' : 'crown'} size={20} color={processing ? '#FFF' : C.textOnPrimary} />
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: processing ? '#FFF' : C.textOnPrimary }}>
                {processing ? 'Processing...' : selectedPlan === 'yearly' ? `Get Premium — ${yearly?.label ?? ''}` : `Get Premium — ${monthly?.label ?? ''}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Trust badges */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="shield-check-outline" size={12} color={C.textMuted} />
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Secure payment</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="refresh" size={12} color={C.textMuted} />
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Cancel anytime</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name={region === 'india' ? 'currency-inr' : 'currency-usd'} size={12} color={C.textMuted} />
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{!region ? '...' : region === 'india' ? 'Razorpay' : 'Stripe'}</Text>
          </View>
        </View>

        {/* Features Comparison */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 16 }}>WHAT YOU GET</Text>
          <View style={{ backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.bgSecondary, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <Text style={{ flex: 2, fontSize: FontSizes.xs, fontWeight: '700', color: C.textMuted }}>FEATURE</Text>
              <Text style={{ flex: 1, fontSize: FontSizes.xs, fontWeight: '700', color: C.textMuted, textAlign: 'center' }}>FREE</Text>
              <Text style={{ flex: 1, fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, textAlign: 'center' }}>PREMIUM</Text>
            </View>
            {FEATURES.map((f, i) => (
              <View key={f.title} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: i < FEATURES.length - 1 ? 1 : 0, borderBottomColor: C.borderLight }}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <MaterialCommunityIcons name={f.icon} size={18} color={f.color} />
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textPrimary, flexShrink: 1 }}>{f.title}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: FontSizes.xs, color: C.textMuted, textAlign: 'center' }}>{f.free}</Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={C.success} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom */}
        <View style={{ paddingHorizontal: 16, marginBottom: 30 }}>
          <View style={{ backgroundColor: C.bgSecondary, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 28, marginBottom: 8 }}>{'\u0950'}</Text>
            <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary, textAlign: 'center' }}>Your daily companion for Gita wisdom</Text>
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}