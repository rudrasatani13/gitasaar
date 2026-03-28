// src/screens/ProfileEditScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { useProfile } from '../theme/ProfileContext';
import { FontSizes } from '../theme/colors';
import { auth } from '../utils/firebase';

export default function ProfileEditScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { profile, updateProfile, profilePhoto } = useProfile();
  const [name, setName] = useState(profile.name || '');
  const [tempPhoto, setTempPhoto] = useState(null); 
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const userEmail = auth.currentUser ? auth.currentUser.email : 'guest@gitasaar.app';

  const displayPhoto = tempPhoto !== null ? tempPhoto : profilePhoto;
  const isRealPhoto = displayPhoto && !displayPhoto.startsWith('avatar_');

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Gallery access is required to pick a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempPhoto(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    const opts = [
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Take a Photo', onPress: takePhoto },
    ];
    if (isRealPhoto) {
      opts.push({ text: 'Remove Photo', style: 'destructive', onPress: () => setTempPhoto('__remove__') });
    }
    opts.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Profile Photo', 'What would you like to do?', opts);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    const photoToSave = tempPhoto === '__remove__' ? null : (tempPhoto || undefined);

    if (photoToSave !== undefined) {
      await updateProfile({ name: name.trim(), photo: photoToSave });
    } else {
      await updateProfile({ name: name.trim() });
    }

    setTempPhoto(null);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectAvatar = (icon) => {
    setTempPhoto('avatar_' + icon);
  };

  const getInitials = () => {
    if (name.trim()) return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return userEmail[0].toUpperCase();
  };

  const renderPhoto = (size) => {
    const src = tempPhoto === '__remove__' ? null : (tempPhoto || profilePhoto);
    if (src && !src.startsWith('avatar_')) {
      return <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
    }
    if (src && src.startsWith('avatar_')) {
      return <MaterialCommunityIcons name={src.replace('avatar_', '')} size={size * 0.45} color={C.primary} />;
    }
    return <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: C.primary }}>{getInitials()}</Text>;
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <View style={{ paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Edit Profile</Text>
          </View>
          <TouchableOpacity onPress={handleSave} disabled={saving}
            style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: saved ? '#10B981' : C.primary, opacity: saving ? 0.7 : 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {saving && <ActivityIndicator size="small" color={C.textOnPrimary} />}
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.textOnPrimary }}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Photo Section */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={showPhotoOptions} activeOpacity={0.8}>
            <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: C.borderGoldStrong, overflow: 'hidden', backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              {renderPhoto(120)}
            </View>
            <View style={{ position: 'absolute', bottom: 2, right: 2, width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: C.bgPrimary }}>
              <MaterialCommunityIcons name="camera-outline" size={16} color={C.textOnPrimary} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity onPress={pickFromGallery}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border }}>
              <MaterialCommunityIcons name="image-outline" size={14} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.primary }}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePhoto}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border }}>
              <MaterialCommunityIcons name="camera-outline" size={14} color={C.primary} />
              <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: C.primary }}>Camera</Text>
            </TouchableOpacity>
            {isRealPhoto && (
              <TouchableOpacity onPress={() => setTempPhoto('__remove__')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(239,68,68,0.10)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' }}>
                <MaterialCommunityIcons name="trash-can-outline" size={14} color="#EF4444" />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: '#EF4444' }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Name Section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1, marginBottom: 8 }}>DISPLAY NAME</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1.5, borderColor: C.border }}>
            <MaterialCommunityIcons name="account-outline" size={20} color={C.textMuted} />
            <TextInput style={{ flex: 1, fontSize: FontSizes.lg, color: C.textPrimary, paddingVertical: 16, paddingHorizontal: 12, fontWeight: '500' }}
              placeholder="Enter your name..." placeholderTextColor={C.textMuted}
              value={name} onChangeText={setName} autoCapitalize="words" />
            {name.length > 0 && (
              <TouchableOpacity onPress={() => setName('')}><MaterialCommunityIcons name="close-circle" size={18} color={C.textMuted} /></TouchableOpacity>
            )}
          </View>
        </View>

        {/* Email Section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1, marginBottom: 8 }}>EMAIL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgSecondary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1, borderColor: C.border }}>
            <MaterialCommunityIcons name="email-outline" size={20} color={C.textMuted} />
            <Text style={{ flex: 1, fontSize: FontSizes.md, color: C.textMuted, paddingHorizontal: 12 }}>{userEmail}</Text>
            <MaterialCommunityIcons name="lock-outline" size={16} color={C.textMuted} />
          </View>
        </View>

        {/* Avatars */}
        {!isRealPhoto && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '700', color: C.primary, letterSpacing: 1, marginBottom: 12 }}>OR CHOOSE AN AVATAR</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {[
                { icon: 'om', bg: '#C28840' },
                { icon: 'meditation', bg: '#14918E' },
                { icon: 'hands-pray', bg: '#7B1830' },
                { icon: 'account-circle', bg: '#D4962A' },
                { icon: 'flower-tulip-outline', bg: '#C95A6A' },
                { icon: 'star-four-points', bg: '#9E6B2C' },
              ].map((a, i) => {
                const sel = (tempPhoto || profilePhoto) === 'avatar_' + a.icon;
                return (
                  <TouchableOpacity key={i} onPress={() => selectAvatar(a.icon)}
                    style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: sel ? a.bg + '25' : a.bg + '12', justifyContent: 'center', alignItems: 'center', borderWidth: sel ? 2 : 1, borderColor: sel ? a.bg : a.bg + '25' }} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={a.icon} size={24} color={a.bg} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}