// src/screens/LearningPathsScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useLearningPath, LEARNING_PATHS } from '../theme/LearningPathContext';
import { usePremium } from '../theme/PremiumContext';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from '../components/SpiritualBackground';

export default function LearningPathsScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { currentPath, startPath, completedPaths } = useLearningPath();
  const { isPremium } = usePremium();

  const handlePathPress = (pathId) => {
    if (!isPremium) {
      navigation.navigate('Premium');
      return;
    }
    startPath(pathId);
    navigation.navigate('LearningPathDetail', { pathId });
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <StarfieldBackground />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>Learning Paths</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>Personalized journeys based on your life</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {!isPremium && (
          <GlassCard variant="strong" style={{ marginBottom: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name="crown" size={24} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.textPrimary }}>Premium Feature</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted }}>Unlock personalized learning paths</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Premium')} activeOpacity={0.8}>
              <LinearGradient colors={[C.primary, C.primaryDark]} style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: '#FFFFFF' }}>Upgrade to Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        )}

        {Object.values(LEARNING_PATHS).map((path) => {
          const isCompleted = completedPaths.includes(path.id);
          const isCurrent = currentPath === path.id;

          return (
            <TouchableOpacity key={path.id} onPress={() => handlePathPress(path.id)} activeOpacity={0.9} style={{ marginBottom: 16 }}>
              <GlassCard noPadding variant={isCurrent ? 'strong' : 'default'} style={{ padding: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: path.color + '20', borderWidth: 2, borderColor: path.color, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name={path.icon} size={26} color={path.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.textPrimary, marginBottom: 4 }}>{path.name}</Text>
                    <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary }}>{path.description}</Text>
                  </View>
                  {isCompleted && <MaterialCommunityIcons name="check-circle" size={24} color={C.success} />}
                  {isCurrent && !isCompleted && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: path.color }} />}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: C.primarySoft }}>
                    <Text style={{ fontSize: FontSizes.xs, color: C.primary, fontWeight: '600' }}>{path.duration}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: C.peacockBlue + '15' }}>
                    <Text style={{ fontSize: FontSizes.xs, color: C.peacockBlue, fontWeight: '600' }}>{path.verses.length} Verses</Text>
                  </View>
                </View>

                <View style={{ backgroundColor: C.glassBg, borderRadius: 12, padding: 12 }}>
                  <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textMuted, marginBottom: 6 }}>PRACTICES INCLUDED:</Text>
                  {path.practices.map((practice, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: path.color }} />
                      <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary }}>{practice}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}
