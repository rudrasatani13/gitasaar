// App.js
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info?.componentStack);
  }
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || String(this.state.error) || 'Unknown error';
      const errStack = this.state.error?.stack ? '\n\n' + this.state.error.stack.slice(0, 600) : '';
      return (
        <View style={{ flex: 1, backgroundColor: '#000D1A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 32, marginBottom: 16 }}>{'\u0950'}</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#F0F0FF', marginBottom: 8 }}>Something went wrong</Text>
          {/* [AUTH DEBUG] show real error so it's visible on device/APK — remove before production */}
          <Text selectable style={{ fontSize: 11, color: '#F87171', backgroundColor: 'rgba(239,68,68,0.12)', padding: 10, borderRadius: 8, marginBottom: 14, fontFamily: 'monospace', textAlign: 'left', width: '100%' }}>
            {errMsg}{errStack}
          </Text>
          <Text onPress={this.handleRetry} style={{ fontSize: 16, fontWeight: '700', color: '#E0A850', paddingVertical: 12, paddingHorizontal: 28, borderWidth: 1.5, borderColor: '#E0A850', borderRadius: 12, overflow: 'hidden' }}>Try Again</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
import { useFonts, NotoSans_400Regular, NotoSans_500Medium, NotoSans_700Bold } from '@expo-google-fonts/noto-sans';
import { NotoSerifDevanagari_400Regular, NotoSerifDevanagari_700Bold } from '@expo-google-fonts/noto-serif-devanagari';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ProfileProvider } from './src/theme/ProfileContext';
import { BookmarkProvider } from './src/theme/BookmarkContext';
import { TrackerProvider } from './src/theme/TrackerContext';
import { JournalProvider } from './src/theme/JournalContext';
import { ChatHistoryProvider } from "./src/theme/ChatHistoryContext";
import { ReadingGoalProvider } from "./src/theme/ReadingGoalContext";
import { OfflineProvider } from './src/theme/OfflineContext';
import { PremiumProvider } from './src/theme/PremiumContext';
import { initSecurity } from './src/utils/security';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  React.useEffect(() => { try { initSecurity(); } catch(e) {} }, []);
  React.useEffect(() => { if (typeof document !== "undefined") { document.body.style.margin="0"; document.body.style.padding="0"; document.body.style.overflow="hidden"; document.body.style.background="#000D1A"; document.documentElement.style.height="100%"; document.body.style.height="100%"; const root=document.getElementById("root"); if(root){root.style.height="100%";root.style.width="100%"} } }, []);
  const { colors } = useTheme();
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response.notification.request.content.data);
    });
    return () => sub.remove();
  }, []);
  return (
    <>
      <StatusBar style={colors.statusBar} />
      <AppNavigator />
    </>
  );
}

export default function App() {

  const [fontsLoaded] = useFonts({
    NotoSans_400Regular, NotoSans_500Medium, NotoSans_700Bold,
    NotoSerifDevanagari_400Regular, NotoSerifDevanagari_700Bold,
  });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#000D1A' }} />;

  return (
    <ErrorBoundary>
    <ThemeProvider>
    <OfflineProvider>
      <ProfileProvider>
        <BookmarkProvider>
          <TrackerProvider>
            <JournalProvider>
              <ReadingGoalProvider>
              <PremiumProvider>
              <ChatHistoryProvider>
                <AppContent />
              </ChatHistoryProvider>
              </PremiumProvider>
              </ReadingGoalProvider>
            </JournalProvider>
          </TrackerProvider>
        </BookmarkProvider>
      </ProfileProvider>
    </OfflineProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}