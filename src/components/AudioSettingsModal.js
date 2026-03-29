// src/components/AudioSettingsModal.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import GlassCard from './GlassCard';
import { useTheme } from '../theme/ThemeContext';
import { AUDIO_LIBRARY } from '../utils/meditationAudio';
import { FontSizes } from '../theme/colors';
import { StarfieldBackground } from './SpiritualBackground';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function AudioSettingsModal({
  visible,
  onClose,
  isMuted,
  toggleMute,
  selectedAmbient,
  changeAmbient,
  volume,
  setVolume,
  adjustVolume,
}) {
  const { colors: C, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
          <StarfieldBackground />

          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.xxl, fontWeight: '800', color: C.textPrimary }}>Audio Settings</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 4 }}>Customize your meditation audio</Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, justifyContent: 'center', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="close" size={24} color={C.textPrimary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            
            {/* Sound Toggle Card */}
            <GlassCard variant="strong" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
              <TouchableOpacity onPress={toggleMute} activeOpacity={0.8}>
                <LinearGradient
                  colors={isMuted ? [C.glassBg, C.glassBg] : [C.primarySoft, C.primarySoft]}
                  style={{ padding: 20 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isMuted ? C.glassBg : C.primary + '20', borderWidth: 2, borderColor: isMuted ? C.glassBorder : C.primary, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name={isMuted ? 'volume-off' : 'volume-high'} size={28} color={isMuted ? C.textMuted : C.primary} />
                      </View>
                      <View>
                        <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: isMuted ? C.textMuted : C.textPrimary, marginBottom: 4 }}>Sound</Text>
                        <Text style={{ fontSize: FontSizes.sm, color: isMuted ? C.textMuted : C.textSecondary }}>{isMuted ? 'Tap to enable audio' : 'Audio is playing'}</Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, backgroundColor: isMuted ? C.glassBg : C.primary }}>
                      <Text style={{ fontSize: FontSizes.md, fontWeight: '800', color: isMuted ? C.textMuted : '#FFFFFF' }}>{isMuted ? 'OFF' : 'ON'}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>

            {/* Background Sound Selection */}
            {!isMuted && (
              <>
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 1.5, marginBottom: 16 }}>BACKGROUND SOUND</Text>
                <View style={{ marginBottom: 32 }}>
                  {Object.values(AUDIO_LIBRARY.ambient).map((ambient, index) => (
                    <TouchableOpacity
                      key={ambient.id}
                      onPress={() => {
                        changeAmbient(ambient.id);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      activeOpacity={0.8}
                      style={{ marginBottom: 12 }}
                    >
                      <GlassCard noPadding variant={selectedAmbient === ambient.id ? 'strong' : 'default'} style={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                          <View style={{
                            width: 52,
                            height: 52,
                            borderRadius: 26,
                            backgroundColor: selectedAmbient === ambient.id ? C.primary + '20' : C.glassBg,
                            borderWidth: 2,
                            borderColor: selectedAmbient === ambient.id ? C.primary : C.glassBorder,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <MaterialCommunityIcons
                              name={
                                ambient.category === 'Nature' ? 'water' :
                                ambient.category === 'Spiritual' ? 'om' : 'music'
                              }
                              size={24}
                              color={selectedAmbient === ambient.id ? C.primary : C.textMuted}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: FontSizes.md, fontWeight: '700', color: C.textPrimary, marginBottom: 4 }}>{ambient.name}</Text>
                            <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary }}>{ambient.description || ambient.category}</Text>
                          </View>
                          {selectedAmbient === ambient.id && (
                            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center' }}>
                              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                      </GlassCard>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Volume Control */}
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '800', color: C.primary, letterSpacing: 1.5, marginBottom: 16 }}>VOLUME CONTROL</Text>
                <GlassCard variant="strong" style={{ marginBottom: 24, padding: 20 }}>
                  {/* Volume Display */}
                  <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ fontSize: 64, fontWeight: '800', color: C.primary, lineHeight: 64 }}>{Math.round(volume * 100)}%</Text>
                    <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, marginTop: 8 }}>Audio Volume</Text>
                  </View>

                  {/* Slider */}
                  <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <MaterialCommunityIcons name="volume-low" size={24} color={C.textMuted} />
                      <Slider
                        style={{ flex: 1, height: 50 }}
                        minimumValue={0}
                        maximumValue={1}
                        value={volume}
                        onValueChange={(value) => {
                          setVolume(value);
                          adjustVolume(value);
                        }}
                        onSlidingComplete={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }}
                        minimumTrackTintColor={C.primary}
                        maximumTrackTintColor={C.glassBg}
                        thumbTintColor={C.primary}
                      />
                      <MaterialCommunityIcons name="volume-high" size={24} color={C.textMuted} />
                    </View>
                  </View>

                  {/* Quick Presets */}
                  <View>
                    <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.textMuted, marginBottom: 12, textAlign: 'center' }}>Quick Presets</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[0.3, 0.5, 0.7, 1.0].map((vol) => (
                        <TouchableOpacity
                          key={vol}
                          onPress={() => {
                            setVolume(vol);
                            adjustVolume(vol);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          activeOpacity={0.8}
                          style={{ flex: 1 }}
                        >
                          <View style={{
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: 'center',
                            backgroundColor: Math.abs(volume - vol) < 0.05 ? C.primary : C.glassBg,
                            borderWidth: 1.5,
                            borderColor: Math.abs(volume - vol) < 0.05 ? C.primary : C.glassBorder,
                          }}>
                            <Text style={{
                              fontSize: FontSizes.md,
                              fontWeight: Math.abs(volume - vol) < 0.05 ? '800' : '600',
                              color: Math.abs(volume - vol) < 0.05 ? '#FFFFFF' : C.textSecondary,
                            }}>{Math.round(vol * 100)}%</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </GlassCard>

                {/* Info Card */}
                <GlassCard style={{ padding: 16, backgroundColor: C.peacockBlue + '10', borderColor: C.peacockBlue + '30' }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <MaterialCommunityIcons name="information" size={20} color={C.peacockBlue} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: FontSizes.xs, color: C.textSecondary, lineHeight: 18 }}>
                        Background sounds will loop throughout your meditation. You can change settings anytime without interrupting your session.
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </>
            )}

            {/* Muted State Info */}
            {isMuted && (
              <GlassCard style={{ padding: 24, alignItems: 'center' }}>
                <MaterialCommunityIcons name="volume-off" size={48} color={C.textMuted} style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textMuted, marginBottom: 8 }}>Sound is Off</Text>
                <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, textAlign: 'center', lineHeight: 20 }}>
                  Enable sound to enjoy background music and voice guidance during your meditation
                </Text>
              </GlassCard>
            )}
          </ScrollView>

          {/* Done Button */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 }}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <LinearGradient colors={[C.peacockBlue, C.primary]} style={{ paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: FontSizes.lg, fontWeight: '800', color: '#FFFFFF' }}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
