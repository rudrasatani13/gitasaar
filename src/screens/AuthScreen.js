import AppLogo from "../components/AppLogo";
// src/screens/AuthScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isValidEmail, sanitizeInput } from '../utils/security';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';
import { login, signup, loginWithGoogle, loginWithApple, sendPhoneOTP, verifyPhoneOTP } from '../utils/firebase';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';

export default function AuthScreen({ navigation }) {
  const { colors: C } = useTheme();
  const [mode, setMode] = useState('login'); // login, signup, phone, otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState('');

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerY, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(formY, { toValue: 0, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const animateSwitch = (callback) => {
    Animated.timing(formOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(formOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  // Email login/signup
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert('Error', 'Please enter your email and password.');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');
    setLoading(true);
    try {
      const result = isLogin ? await login(email.trim(), password) : await signup(email.trim(), password);
      setLoading(false);
      if (!result.success) {
        let msg = result.error;
        if (msg.includes('user-not-found')) msg = 'Account not found. Please sign up first.';
        else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) msg = 'Incorrect password.';
        else if (msg.includes('email-already-in-use')) msg = 'Email is already registered. Please login.';
        else if (msg.includes('invalid-email')) msg = 'Invalid email format.';
        else if (msg.includes('too-many-requests')) msg = 'Too many attempts. Please reset password or try again later.';
        Alert.alert('Error', msg);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    }
  };

  // Google
  const handleGoogle = async () => {
    setLoadingProvider('google');
    const result = await loginWithGoogle();
    setLoadingProvider('');
    if (!result.success) Alert.alert('Google Login', result.error);
  };

  // Apple
  const handleApple = async () => {
    setLoadingProvider('apple');
    const result = await loginWithApple();
    setLoadingProvider('');
    if (!result.success) Alert.alert('Apple Login', result.error);
  };

  // Phone - Send OTP
  const handleSendOTP = async () => {
    if (!phone.trim() || phone.trim().length < 10) return Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
    setLoading(true);
    try {
      const result = await sendPhoneOTP(phone.trim());
      setLoading(false);
      if (result.success) {
        animateSwitch(() => setMode('otp'));
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  // Phone - Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.trim().length < 6) return Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
    setLoading(true);
    try {
      const result = await verifyPhoneOTP(otp.trim());
      setLoading(false);
      if (!result.success) Alert.alert('Error', result.error);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isPhone = mode === 'phone';
  const isOtp = mode === 'otp';
  const isEmailMode = isLogin || isSignup;

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      {/* Invisible recaptcha container for phone auth */}
      {Platform.OS === 'web' && <View nativeID="recaptcha-container" />}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <Animated.View style={{ alignItems: 'center', marginBottom: 32, opacity: headerOpacity, transform: [{ translateY: headerY }] }}>
            <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: C.glassBg, borderWidth: 2, borderColor: C.glassBorderGold, justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
              <AppLogo size={50} />
            </View>
            <Text style={{ fontSize: FontSizes.xxxl, fontWeight: '700', color: C.textPrimary }}>GitaSaar</Text>
            <Text style={{ fontSize: FontSizes.lg, color: C.primary, marginTop: 2 }}>{'गीता सार'}</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 8 }}>
              {isOtp ? 'Verify OTP' : isPhone ? 'Login with Phone' : isLogin ? 'Welcome back' : 'Begin your spiritual journey'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formY }] }}>
            <GlassCard style={{ marginBottom: 8 }} intensity={50}>

            {/* ===== EMAIL MODE ===== */}
            {isEmailMode && (
              <>
                {/* Toggle Login/Signup */}
                <View style={{ flexDirection: 'row', backgroundColor: C.glassBg, borderRadius: 14, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: C.glassBorder }}>
                  <TouchableOpacity onPress={() => !isLogin && animateSwitch(() => setMode('login'))}
                    style={{ flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: isLogin ? C.bgCard : 'transparent', alignItems: 'center', ...(isLogin ? C.shadowLight : {}) }}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: isLogin ? '700' : '500', color: isLogin ? C.primary : C.textMuted }}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => !isSignup && animateSwitch(() => setMode('signup'))}
                    style={{ flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: isSignup ? C.bgCard : 'transparent', alignItems: 'center', ...(isSignup ? C.shadowLight : {}) }}>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: isSignup ? '700' : '500', color: isSignup ? C.primary : C.textMuted }}>Sign Up</Text>
                  </TouchableOpacity>
                </View>

                {/* Email */}
                <GlassInput
                  leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color={C.textMuted} />}
                  placeholder="Email address"
                  value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none"
                  style={{ marginBottom: 4 }}
                />

                {/* Password */}
                <GlassInput
                  leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color={C.textMuted} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textMuted} />
                    </TouchableOpacity>
                  }
                  placeholder="Password (min 6 chars)"
                  value={password} onChangeText={setPassword}
                  secureTextEntry={!showPassword} autoCapitalize="none"
                  style={{ marginBottom: 4 }}
                />
                {!isLogin && (
                  <GlassInput
                    leftIcon={<MaterialCommunityIcons name="lock-check-outline" size={18} color={C.textMuted} />}
                    placeholder="Confirm Password"
                    value={confirmPassword} onChangeText={setConfirmPassword}
                    secureTextEntry autoCapitalize="none"
                    style={{ marginBottom: 4 }}
                  />
                )}

                {/* Submit */}
                <TouchableOpacity onPress={handleEmailAuth} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, paddingVertical: 15, alignItems: 'center', opacity: loading ? 0.7 : 1, flexDirection: 'row', justifyContent: 'center' }}>
                    {loading && <ActivityIndicator color={C.textOnPrimary} style={{ marginRight: 8 }} />}
                    <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>
                      {loading ? (isLogin ? 'Logging in...' : 'Creating Account...') : isLogin ? 'Login' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* ===== PHONE MODE ===== */}
            {isPhone && (
              <>
                <GlassInput
                  leftIcon={<>
                    <Text style={{ fontSize: FontSizes.md, color: C.textMuted, marginRight: 4 }}>+91</Text>
                    <View style={{ width: 1, height: 24, backgroundColor: C.glassBorder, marginRight: 8 }} />
                  </>}
                  placeholder="Phone number"
                  value={phone} onChangeText={setPhone}
                  keyboardType="phone-pad" maxLength={10}
                  inputStyle={{ fontSize: FontSizes.lg, letterSpacing: 1 }}
                  style={{ marginBottom: 4 }}
                />

                <TouchableOpacity onPress={handleSendOTP} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, paddingVertical: 15, alignItems: 'center', opacity: loading ? 0.7 : 1, flexDirection: 'row', justifyContent: 'center' }}>
                    {loading && <ActivityIndicator color={C.textOnPrimary} style={{ marginRight: 8 }} />}
                    <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => animateSwitch(() => setMode('login'))} style={{ alignItems: 'center', marginTop: 16 }}>
                  <Text style={{ fontSize: FontSizes.sm, color: C.primary, fontWeight: '600' }}>Login with Email</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ===== OTP MODE ===== */}
            {isOtp && (
              <>
                <GlassCard style={{ marginBottom: 14 }} noPadding intensity={35}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 14 }}>
                    <MaterialCommunityIcons name="message-text-outline" size={18} color={C.peacockBlue} />
                    <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, flex: 1 }}>OTP has been sent to +91{phone}</Text>
                  </View>
                </GlassCard>

                <GlassInput
                  leftIcon={<MaterialCommunityIcons name="shield-key-outline" size={20} color={C.textMuted} />}
                  placeholder="------"
                  value={otp} onChangeText={setOtp}
                  keyboardType="number-pad" maxLength={6} autoFocus
                  inputStyle={{ fontSize: FontSizes.xl, textAlign: 'center', letterSpacing: 8 }}
                  style={{ marginBottom: 4 }}
                />

                <TouchableOpacity onPress={handleVerifyOTP} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient colors={C.gradientGold} style={{ borderRadius: 16, paddingVertical: 15, alignItems: 'center', opacity: loading ? 0.7 : 1, flexDirection: 'row', justifyContent: 'center' }}>
                    {loading && <ActivityIndicator color={C.textOnPrimary} style={{ marginRight: 8 }} />}
                    <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textOnPrimary }}>
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                  <TouchableOpacity onPress={() => { setOtp(''); handleSendOTP(); }}>
                    <Text style={{ fontSize: FontSizes.sm, color: C.primary, fontWeight: '600' }}>Resend OTP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => animateSwitch(() => { setMode('phone'); setOtp(''); })}>
                    <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>Change Number</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ===== DIVIDER + SOCIAL ===== */}
            {isEmailMode && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 12 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>or continue with</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: C.divider }} />
                </View>

                {/* Social buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  {/* Google */}
                  <TouchableOpacity onPress={handleGoogle} disabled={!!loadingProvider} activeOpacity={0.8}
                    style={{ flex: 1, opacity: loadingProvider === 'google' ? 0.7 : 1 }}>
                    <GlassCard noPadding style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }} intensity={35}>
                      <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                      <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>
                        {loadingProvider === 'google' ? 'Wait...' : 'Google'}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>

                  {/* Apple */}
                  <TouchableOpacity onPress={handleApple} disabled={!!loadingProvider} activeOpacity={0.8}
                    style={{ flex: 1, opacity: loadingProvider === 'apple' ? 0.7 : 1 }}>
                    <GlassCard noPadding style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }} intensity={35}>
                      <MaterialCommunityIcons name="apple" size={20} color={C.textPrimary} />
                      <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>
                        {loadingProvider === 'apple' ? 'Wait...' : 'Apple'}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>

                  {/* Phone */}
                  <TouchableOpacity onPress={() => animateSwitch(() => setMode('phone'))} activeOpacity={0.8} style={{ flex: 1 }}>
                    <GlassCard noPadding style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }} intensity={35}>
                      <MaterialCommunityIcons name="phone-outline" size={20} color={C.peacockBlue} />
                      <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>Phone</Text>
                    </GlassCard>
                  </TouchableOpacity>
                </View>

                {/* Switch mode */}
                <TouchableOpacity onPress={() => animateSwitch(() => setMode(isLogin ? 'signup' : 'login'))} style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Text style={{ color: C.primary, fontWeight: '700' }}>{isLogin ? 'Sign Up' : 'Login'}</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
            </GlassCard>
          </Animated.View>

          {/* Bottom ornament */}
          <View style={{ alignItems: 'center', marginTop: 30, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 20, height: 1, backgroundColor: C.primary, opacity: 0.3 }} />
              <View style={{ width: 5, height: 5, backgroundColor: C.primary, opacity: 0.3, transform: [{ rotate: '45deg' }] }} />
              <View style={{ width: 20, height: 1, backgroundColor: C.primary, opacity: 0.3 }} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}