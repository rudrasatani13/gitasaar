// src/screens/BookmarksScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { usePremium } from '../theme/PremiumContext';
import { useBookmarks } from '../theme/BookmarkContext';
import { FontSizes } from '../theme/colors';
import ShlokaCard from '../components/ShlokaCard';
import GlassCard from '../components/GlassCard';

export default function BookmarksScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { isPremium, canUseAllFolders } = usePremium();
  const { folders, getAllBookmarks, getBookmarksInFolder, getFolderCount, moveToFolder, addFolder, deleteFolder, bookmarkCount } = useBookmarks();
  const [activeFolder, setActiveFolder] = useState('all');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [movingVerse, setMovingVerse] = useState(null);

  const bookmarks = activeFolder === 'all' ? getAllBookmarks() : getBookmarksInFolder(activeFolder);

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim());
    setNewFolderName('');
    setShowAddFolder(false);
  };

  const handleDeleteFolder = (id) => {
    Alert.alert(
      'Delete Folder',
      'Delete this folder? Bookmarks will move to Favorites.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          deleteFolder(id);
          if (activeFolder === id) setActiveFolder('all');
        }},
      ]
    );
  };

  const handleMove = (verseId, folderId) => {
    moveToFolder(verseId, folderId);
    setMovingVerse(null);
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.glassBorder }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.glassBg, borderWidth: 1, borderColor: C.glassBorder, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Bookmarks</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{bookmarkCount} saved verses</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => { if (isPremium) setShowAddFolder(!showAddFolder); else { Alert.alert('Premium Feature', 'Custom folders are a Premium feature! Upgrade to unlock.'); } }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.glassBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.glassBorderGold }}>
            <MaterialCommunityIcons name="folder-plus-outline" size={18} color={C.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add folder input */}
      {showAddFolder && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: C.glassBg, borderBottomWidth: 1, borderBottomColor: C.glassBorder }}>
          <TextInput style={{ flex: 1, fontSize: FontSizes.md, color: C.textPrimary, backgroundColor: C.glassInputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.glassBorder }}
            placeholder="Folder name..." placeholderTextColor={C.textMuted}
            value={newFolderName} onChangeText={setNewFolderName} autoFocus />
          <TouchableOpacity onPress={handleAddFolder} style={{ backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: C.textOnPrimary }}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Folder tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52, borderBottomWidth: 1, borderBottomColor: C.glassBorder }}>
        <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingVertical: 10 }}>
          <TouchableOpacity onPress={() => setActiveFolder('all')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: activeFolder === 'all' ? C.glassBg : 'transparent', borderWidth: 1, borderColor: activeFolder === 'all' ? C.glassBorderGold : C.glassBorder }}>
            <MaterialCommunityIcons name="bookmark-multiple" size={14} color={activeFolder === 'all' ? C.primary : C.textMuted} />
            <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: activeFolder === 'all' ? C.primary : C.textMuted }}>All ({bookmarkCount})</Text>
          </TouchableOpacity>
          {folders.map((f) => {
            const count = getFolderCount(f.id);
            const active = activeFolder === f.id;
            return (
              <TouchableOpacity key={f.id} onPress={() => { if (f.id === 'favorites' || isPremium) setActiveFolder(f.id); else { Alert.alert('Premium Feature', 'Custom folders are a Premium feature! Upgrade to unlock.'); } }}
                onLongPress={() => f.id.startsWith('custom_') ? handleDeleteFolder(f.id) : null}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: active ? f.color + '15' : 'transparent', borderWidth: 1, borderColor: active ? f.color : C.glassBorder }}>
                <MaterialCommunityIcons name={f.icon} size={14} color={active ? f.color : C.textMuted} />
                <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: active ? f.color : C.textMuted }}>{f.name} ({count})</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bookmarks list */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {bookmarks.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: C.borderGold }}>
              <MaterialCommunityIcons name="bookmark-outline" size={32} color={C.primary} />
            </View>
            <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>No bookmarks yet</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, textAlign: 'center' }}>
              {activeFolder === 'all' ? 'Verses pe bookmark icon tap karo' : 'Move verses to this folder'}
            </Text>
          </View>
        ) : (
          bookmarks.map((bm) => (
            <View key={bm.id} style={{ marginBottom: 16 }}>
              <ShlokaCard verse={bm.verse} />
              {/* Folder indicator + move button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="folder-outline" size={12} color={C.textMuted} />
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>
                    {folders.find(f => f.id === bm.folderId)?.name || 'Favorites'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setMovingVerse(movingVerse === bm.id ? null : bm.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: C.bgSecondary, borderWidth: 1, borderColor: C.border }}>
                  <MaterialCommunityIcons name="folder-move-outline" size={12} color={C.primary} />
                  <Text style={{ fontSize: 10, fontWeight: '600', color: C.primary }}>Move</Text>
                </TouchableOpacity>
              </View>
              {/* Move to folder options */}
              {movingVerse === bm.id && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingHorizontal: 8 }}>
                  {folders.filter(f => f.id !== bm.folderId).map((f) => (
                    <TouchableOpacity key={f.id} onPress={() => handleMove(bm.id, f.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: f.color + '12', borderWidth: 1, borderColor: f.color + '30' }}>
                      <MaterialCommunityIcons name={f.icon} size={12} color={f.color} />
                      <Text style={{ fontSize: 10, fontWeight: '600', color: f.color }}>{f.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </LinearGradient>
  );
}