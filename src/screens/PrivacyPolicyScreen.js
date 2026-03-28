// src/screens/PrivacyPolicyScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { FontSizes } from '../theme/colors';

const LAST_UPDATED = 'March 22, 2026';
const CONTACT_EMAIL = 'rudrasatani@gmail.com';

function Section({ title, children, C }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}

function PrivacyContent({ C }) {
  return (
    <View>
      <Section title="1. Information We Collect" C={C}>
        {`GitaSaar collects the following information to provide and improve our services:

• Account Information: Name, email address, and profile photo when you create an account using Google, Apple, or Phone authentication.

• Usage Data: App interactions such as verses read, journal entries, quiz scores, and chat history. This data is stored locally on your device and optionally synced to Firebase for cross-device access.

• Device Information: Device type, operating system, timezone, and language preferences for optimizing your experience.

• Payment Information: When you subscribe to GitaSaar Premium, payment is processed securely through Razorpay (India) or Stripe (International). We do not store your card details — all payment data is handled directly by these PCI-compliant processors.`}
      </Section>

      <Section title="2. How We Use Your Information" C={C}>
        {`We use your information to:

• Provide personalized spiritual guidance through AI-powered chat (powered by Google Gemini).
• Save your reading progress, bookmarks, and journal entries.
• Generate personalized quiz questions based on your learning.
• Process Premium subscription payments.
• Send daily verse notifications (if enabled).
• Improve app performance and fix bugs.

We do NOT sell, rent, or share your personal information with third parties for marketing purposes.`}
      </Section>

      <Section title="3. AI Chat & Data Processing" C={C}>
        {`GitaSaar uses Google Gemini AI to provide spiritual guidance based on the Bhagavad Gita. When you use the "Ask Krishna" chat feature:

• Your messages are sent to Google's Gemini API for processing.
• Conversations are stored locally on your device and optionally in Firebase.
• Google may process your messages according to their own privacy policy.
• We do not use your chat data to train AI models.
• You can delete your chat history at any time from the app.`}
      </Section>

      <Section title="4. Data Storage & Security" C={C}>
        {`• Local Storage: Most app data (journal, bookmarks, settings) is stored on your device using AsyncStorage.
• Cloud Sync: If you sign in, profile data and preferences sync via Google Firebase (Firestore) hosted in Asia-South1 region.
• Encryption: All data in transit is encrypted using TLS/SSL.
• Authentication: Handled securely by Firebase Authentication.
• We implement industry-standard security measures to protect your data.`}
      </Section>

      <Section title="5. Third-Party Services" C={C}>
        {`GitaSaar uses the following third-party services:

• Firebase (Google) — Authentication, data sync, analytics
• Google Gemini AI — AI-powered chat responses
• ElevenLabs — Audio recitation (Premium feature)
• Razorpay — Payment processing (India)
• Stripe — Payment processing (International)
• Expo — App framework and notifications

Each service has its own privacy policy. We recommend reviewing them.`}
      </Section>

      <Section title="6. Your Rights" C={C}>
        {`You have the right to:

• Access your personal data stored in the app.
• Delete your account and all associated data.
• Export your journal entries.
• Opt out of notifications.
• Request data deletion by emailing ${CONTACT_EMAIL}.

To delete your account, go to Settings > Delete Account or contact us.`}
      </Section>

      <Section title="7. Children's Privacy" C={C}>
        {`GitaSaar is a spiritual education app suitable for all ages. We do not knowingly collect personal information from children under 13. If you believe we have collected data from a child under 13, please contact us at ${CONTACT_EMAIL}.`}
      </Section>

      <Section title="8. Changes to This Policy" C={C}>
        {`We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email. Continued use of the app after changes constitutes acceptance of the updated policy.`}
      </Section>
    </View>
  );
}

function TermsContent({ C }) {
  return (
    <View>
      <Section title="1. Acceptance of Terms" C={C}>
        {`By downloading, installing, or using GitaSaar ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.`}
      </Section>

      <Section title="2. Description of Service" C={C}>
        {`GitaSaar is a spiritual companion app that provides:

• Access to all 700 verses of the Bhagavad Gita with Sanskrit text, Hindi meaning, and English translations.
• AI-powered spiritual guidance chat (powered by Google Gemini).
• Daily verse recommendations and reading tracking.
• Personal journal for spiritual reflections.
• Quiz feature for testing Gita knowledge.
• Audio recitation of verses (Premium).
• Shareable verse cards for social media.`}
      </Section>

      <Section title="3. User Accounts" C={C}>
        {`• You must create an account to access certain features.
• You are responsible for maintaining the confidentiality of your account.
• You must provide accurate and complete information.
• You may not share your account with others.
• We reserve the right to suspend or terminate accounts that violate these terms.`}
      </Section>

      <Section title="4. Free & Premium Plans" C={C}>
        {`GitaSaar offers both free and premium tiers:

Free Plan includes:
• 5 AI chat messages per day
• 3 audio recitations per day
• 1 quiz play per day
• 2 share card templates
• 4 bookmark folders
• Full verse library access

Premium Plan (₹149/month or ₹999/year for India; $5.99/month or $49.99/year internationally) includes:
• Unlimited AI chat messages
• Unlimited quiz plays
• All 6 share card templates
• All bookmark folders + custom folders
• Audio recitation
• Journal export as PDF
• Ad-free experience`}
      </Section>

      <Section title="5. Payments & Subscriptions" C={C}>
        {`• Premium subscriptions are processed through Razorpay (India) or Stripe (International).
• Subscriptions auto-renew unless cancelled before the renewal date.
• You can cancel your subscription at any time from Settings.
• Refunds are subject to the refund policies of Razorpay/Stripe and applicable app store policies.
• Prices may change with 30 days prior notice.`}
      </Section>

      <Section title="6. Content & Intellectual Property" C={C}>
        {`• The Bhagavad Gita text is a public domain scripture. Translations used in this app are sourced from publicly available commentaries.
• App design, code, branding, logo, and original content are the intellectual property of GitaSaar.
• User-generated content (journal entries, chat messages) remains the property of the user.
• You may share verse cards on social media with GitaSaar branding.
• You may not reproduce, distribute, or create derivative works from the App without permission.`}
      </Section>

      <Section title="7. AI Disclaimer" C={C}>
        {`• The AI chat feature provides spiritual guidance based on the Bhagavad Gita. It is NOT a substitute for professional medical, psychological, or legal advice.
• AI responses are generated by Google Gemini and may occasionally contain inaccuracies.
• We do not guarantee the accuracy, completeness, or suitability of AI-generated responses.
• Use AI guidance at your own discretion.`}
      </Section>

      <Section title="8. Prohibited Use" C={C}>
        {`You agree NOT to:

• Use the App for any illegal or unauthorized purpose.
• Attempt to hack, reverse-engineer, or interfere with the App.
• Upload harmful, offensive, or inappropriate content.
• Abuse the AI chat system with harmful or manipulative prompts.
• Share or resell your Premium subscription.
• Scrape or automated collection of App content.`}
      </Section>

      <Section title="9. Limitation of Liability" C={C}>
        {`GitaSaar is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from use of the App. Our total liability shall not exceed the amount paid by you for Premium subscription in the last 12 months.`}
      </Section>

      <Section title="10. Governing Law" C={C}>
        {`These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Gujarat, India.`}
      </Section>

      <Section title="11. Changes to Terms" C={C}>
        {`We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the updated terms.`}
      </Section>
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation, route }) {
  const { colors: C } = useTheme();
  const [activeTab, setActiveTab] = useState(route?.params?.tab || 'privacy');

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Legal</Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setActiveTab('privacy')} style={{
            flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
            backgroundColor: activeTab === 'privacy' ? C.primary : C.bgCard,
            borderWidth: 1, borderColor: activeTab === 'privacy' ? C.primary : C.border,
          }}>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: activeTab === 'privacy' ? C.textOnPrimary : C.textMuted }}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('terms')} style={{
            flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
            backgroundColor: activeTab === 'terms' ? C.primary : C.bgCard,
            borderWidth: 1, borderColor: activeTab === 'terms' ? C.primary : C.border,
          }}>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: activeTab === 'terms' ? C.textOnPrimary : C.textMuted }}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, backgroundColor: C.bgSecondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' }}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={C.textMuted} />
          <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Last updated: {LAST_UPDATED}</Text>
        </View>

        {/* Content */}
        {activeTab === 'privacy' ? <PrivacyContent C={C} /> : <TermsContent C={C} />}

        {/* Contact */}
        <View style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border, alignItems: 'center', marginTop: 10 }}>
          <MaterialCommunityIcons name="email-outline" size={24} color={C.primary} />
          <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginTop: 8 }}>Questions?</Text>
          <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 4, textAlign: 'center' }}>
            Contact us at {CONTACT_EMAIL}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}