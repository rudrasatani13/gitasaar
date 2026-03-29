// src/screens/MeditationLibraryScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useMeditation, MEDITATION_LIBRARY } from '../theme/MeditationContext';
import { usePremium } from '../theme/PremiumContext';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from '../components/SpiritualBackground';
import PremiumGate from '../components/PremiumGate';

const { width } = Dimensions.get('window');

export default function MeditationLibraryScreen({ navigation }) {
  const { colors: C, isDark } = useTheme();
  const { favoritesMed, toggleFavorite, totalMinutes, sessionCount } = useMeditation();
  const { isPremium } = usePremium();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'beginner', 'intermediate', 'advanced', 'sleep', 'focus'];

  const getMeditations = () => {
    if (selectedCategory === 'all') {
      return Object.values(MEDITATION_LIBRARY).flat();
    }
    return MEDITATION_LIBRARY[selectedCategory] || [];
  };

  const meditations = getMeditations();

  const handleMeditationPress = (meditation) => {
    if (meditation.isPremium && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    // Navigate to meditation player
    navigation.navigate('MeditationPlayer', { meditation });
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <StarfieldBackground />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>Meditation Library</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>Guided sessions for mind & soul</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 8 }}>
          <GlassCard noPadding variant="subtle" style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.primary }}>{sessionCount}</Text>
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Sessions</Text>
          </GlassCard>
          <GlassCard noPadding variant="subtle" style={{ flex: 1, paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.peacockBlue }}>{totalMinutes}</Text>
            <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Minutes</Text>
          </GlassCard>
        </View>
      </View>

      {/* Category Filter */}
      <View style={{ marginBottom: 20 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <View style={{
                  paddingHorizontal: 16,
                  paddingVertical: 7,
                  borderRadius: 18,
                  backgroundColor: selectedCategory === cat ? C.primary : C.glassBg,
                  borderWidth: 1,
                  borderColor: selectedCategory === cat ? C.primary : C.glassBorder,
                  minWidth: cat === 'all' ? 50 : cat === 'beginner' ? 90 : cat === 'intermediate' ? 115 : cat === 'advanced' ? 95 : cat === 'sleep' ? 65 : 70,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    fontSize: FontSizes.sm - 1,
                    fontWeight: selectedCategory === cat ? '700' : '500',
                    color: selectedCategory === cat ? '#FFFFFF' : C.textSecondary,
                    textTransform: 'capitalize',
                  }}>{cat}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Meditation List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {meditations.map((meditation, index) => {
          const isFavorite = favoritesMed.includes(meditation.id);
          const isLocked = meditation.isPremium && !isPremium;

          return (
            <TouchableOpacity
              key={meditation.id}
              onPress={() => handleMeditationPress(meditation)}
              activeOpacity={0.9}
              style={{ marginBottom: 12 }}
            >
              <GlassCard noPadding variant={isFavorite ? 'strong' : 'default'} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  {/* Duration Circle */}
                  <View style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: C.primarySoft,
                    borderWidth: 1.5,
                    borderColor: C.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: C.primary }}>{meditation.duration}</Text>
                    <Text style={{ fontSize: FontSizes.xs, color: C.primary, fontWeight: '600' }}>min</Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary }} numberOfLines={1}>{meditation.title}</Text>
                      {isLocked && <MaterialCommunityIcons name="lock" size={14} color={C.primary} />}
                    </View>
                    <Text style={{ fontSize: FontSizes.xs, color: C.textMuted, marginBottom: 6 }} numberOfLines={2}>{meditation.description}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.peacockBlue + '18' }}>
                        <Text style={{ fontSize: FontSizes.xs - 2, color: C.peacockBlue, fontWeight: '600' }}>{meditation.category}</Text>
                      </View>
                      {meditation.isPremium && (
                        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.primary + '18' }}>
                          <Text style={{ fontSize: FontSizes.xs - 2, color: C.primary, fontWeight: '600' }}>Premium</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Favorite */}
                  <TouchableOpacity onPress={() => toggleFavorite(meditation.id)} activeOpacity={0.7}>
                    <MaterialCommunityIcons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={24}
                      color={isFavorite ? '#E8793A' : C.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        })}

        {!isPremium && (
          <View style={{ marginTop: 24 }}>
            <PremiumGate
              featureName="Full Meditation Library"
              description="Unlock 30+ guided meditations, sleep stories, and exclusive sessions"
              onUpgradePress={() => navigation.navigate('Premium')}
            />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
