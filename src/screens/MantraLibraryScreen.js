// src/screens/MantraLibraryScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { useMantras, MANTRA_LIBRARY } from '../theme/MantraContext';
import { usePremium } from '../theme/PremiumContext';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from '../components/SpiritualBackground';

export default function MantraLibraryScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { favoriteMantras, toggleMantraFavorite, totalChants } = useMantras();
  const { isPremium } = usePremium();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Vedic', 'Healing', 'Success', 'Devotion', 'Strength', 'Peace'];

  const getMantras = () => {
    if (selectedCategory === 'all') return MANTRA_LIBRARY;
    return MANTRA_LIBRARY.filter(m => m.category === selectedCategory);
  };

  const mantras = getMantras();

  const handleMantraPress = (mantra) => {
    if (mantra.isPremium && !isPremium) {
      navigation.navigate('Premium');
      return;
    }
    navigation.navigate('MantraPlayer', { mantra });
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <StarfieldBackground />

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>Mantra Library</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 2 }}>Sacred sounds for transformation</Text>
          </View>
        </View>

        {/* Stats */}
        <GlassCard noPadding variant="subtle" style={{ paddingVertical: 12, alignItems: 'center', marginTop: 16 }}>
          <Text style={{ fontSize: FontSizes.xl, fontWeight: '800', color: C.primary }}>{totalChants}</Text>
          <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>Total Chants</Text>
        </GlassCard>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 16 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} activeOpacity={0.8}>
              <View style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedCategory === cat ? C.primary : C.glassBg,
                borderWidth: 1, borderColor: selectedCategory === cat ? C.primary : C.glassBorder,
              }}>
                <Text style={{
                  fontSize: FontSizes.sm, fontWeight: selectedCategory === cat ? '700' : '500',
                  color: selectedCategory === cat ? '#FFFFFF' : C.textSecondary,
                }}>{cat}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Mantra List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {mantras.map((mantra) => {
          const isFavorite = favoriteMantras.includes(mantra.id);
          const isLocked = mantra.isPremium && !isPremium;

          return (
            <TouchableOpacity key={mantra.id} onPress={() => handleMantraPress(mantra)} activeOpacity={0.9} style={{ marginBottom: 12 }}>
              <GlassCard noPadding variant={isFavorite ? 'strong' : 'default'} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary }}>{mantra.name}</Text>
                      {isLocked && <MaterialCommunityIcons name="lock" size={14} color={C.primary} />}
                    </View>
                    <Text style={{ fontSize: FontSizes.sm, fontFamily: 'NotoSerifDevanagari_400Regular', color: C.textSanskrit, marginBottom: 8 }}>{mantra.sanskrit}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleMantraFavorite(mantra.id)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#E8793A' : C.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: FontSizes.xs, fontStyle: 'italic', color: C.textMuted, marginBottom: 8 }}>{mantra.transliteration}</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 20, marginBottom: 10 }}>{mantra.meaning}</Text>

                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.peacockBlue + '18' }}>
                    <Text style={{ fontSize: FontSizes.xs - 2, color: C.peacockBlue, fontWeight: '600' }}>{mantra.category}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: C.saffronSoft }}>
                    <Text style={{ fontSize: FontSizes.xs - 2, color: C.saffron, fontWeight: '600' }}>{mantra.bestTime}</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}
