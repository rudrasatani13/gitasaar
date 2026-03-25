// src/navigation/AppNavigator.js
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Animated, Platform, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../theme/useTranslation';
import { onAuthChange } from '../utils/firebase';
import { restoreFromCloud, onUserLogout } from '../utils/userDataSync';
import { BlurView } from 'expo-blur';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import VerseLibraryScreen from '../screens/VerseLibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import JournalScreen from '../screens/JournalScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import LanguageScreen from "../screens/LanguageScreen";
import VerseOfDayScreen from "../screens/VerseOfDayScreen";
import StreakScreen from "../screens/StreakScreen";
import MoodTrackerScreen from "../screens/MoodTrackerScreen";
import VerseReminderScreen from "../screens/VerseReminderScreen";
import CommunityScreen from "../screens/CommunityScreen";
import AboutScreen from "../screens/AboutScreen";
import PremiumScreen from "../screens/PremiumScreen";
import QuizScreen from "../screens/QuizScreen";
import ChatHistoryScreen from "../screens/ChatHistoryScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: 'Home', icon: 'om', tKey: 'home' },
  { name: 'Journal', icon: 'notebook-edit-outline', tKey: 'journal' },
  { name: 'Verses', icon: 'book-open-page-variant-outline', tKey: 'verses' },
  { name: 'Chat', icon: 'chat-processing-outline', tKey: 'chat' },
  { name: 'Settings', icon: 'cog-outline', tKey: 'settings' },
];

function TabButton({ route, focused, onPress, C, isDark }) {
  const { tr } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(iconScale, { toValue: focused ? 1.1 : 1, friction: 8, tension: 60, useNativeDriver: true }).start();
  }, [focused]);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.82, friction: 5, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  const tabConfig = TAB_CONFIG.find(t => t.name === route.name);
  const label = tr(tabConfig?.tKey || 'home');

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}
        style={{ alignItems: 'center', paddingVertical: 10, gap: 3 }}>
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <AnimatedTabIcon name={route.name} focused={focused} color={focused ? C.primary : isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.30)'} size={22} />
        </Animated.View>
        <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '500', color: focused ? C.primary : isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.35)', letterSpacing: 0.2 }}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const { colors: C, isDark } = useTheme();
  return (
    // Floating pill wrapper — sits above the screen
    <View style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? 28 : 16, left: 20, right: 20, zIndex: 100 }}>
      {/* Glass pill — clean solid dark background to prevent BlurView grey glow in pure black mode */}
      <View style={{
        borderRadius: 36,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(194,136,64,0.20)',
        backgroundColor: isDark ? C.bgCardElevated : 'transparent',
      }}>
        {Platform.OS !== 'web' && !isDark && (
          <BlurView
            intensity={70}
            tint="light"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
        )}
        <View style={{
          flexDirection: 'row',
          backgroundColor: Platform.OS === 'web' && !isDark
            ? 'rgba(255,252,245,0.88)'
            : 'transparent',
          paddingHorizontal: 4,
          paddingVertical: 2,
        }}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <View key={route.key} style={{ flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: focused ? (isDark ? 'rgba(224,168,80,0.15)' : 'rgba(194,136,64,0.12)') : 'transparent' }}>
                <TabButton route={route} focused={focused} onPress={onPress} C={C} isDark={isDark} />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Remove the default tab bar space — our tab bar is floating/absolute
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Verses" component={VerseLibraryScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  const { colors: C } = useTheme();
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bgPrimary }}><ActivityIndicator size="large" color={C.primary} /></View>;
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupDone, setSetupDone] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const unsub = onAuthChange(async (u) => {
      if (!isMounted) return;
      setLoading(true);
      if (u) {
        // Pura cloud data pehle download/restore hone do
        await restoreFromCloud(u.uid);
        
        const localDone = await AsyncStorage.getItem('@gitasaar_setup_done');
        const localOnboarded = await AsyncStorage.getItem('@gitasaar_onboarded');
        if (isMounted) {
          setSetupDone(localDone === 'true');
          setOnboarded(localOnboarded === 'true');
          setUser(u);
        }
      } else {
        // Logout karne pe data clear hone do aur usko null set karo
        await onUserLogout();
        if (isMounted) {
          setSetupDone(false);
          setOnboarded(false);
          setUser(null);
        }
      }
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  const extras = (
    <>
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="VerseOfDay" component={VerseOfDayScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Streak" component={StreakScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="VerseReminder" component={VerseReminderScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ animation: "slide_from_bottom", animationDuration: 300 }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Language" component={LanguageScreen} options={{ animation: 'slide_from_right' }} />
    </>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom', animationDuration: 250 }}>
        {user ? (
          setupDone ? (
            <><Stack.Screen name="Main" component={MainTabs} />{extras}</>
          ) : !onboarded ? (
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
              {extras}
            </>
          ) : (
            <>
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
              {extras}
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            {extras}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}