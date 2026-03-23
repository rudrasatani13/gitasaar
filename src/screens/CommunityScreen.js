// src/screens/CommunityScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { sanitizeInput } from '../utils/security';
import { useProfile } from '../theme/ProfileContext';
import { FontSizes } from '../theme/colors';

let firestore = null;
try {
  const { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, updateDoc, doc, increment } = require('firebase/firestore');
  const { initializeApp, getApps } = require('firebase/app');
  const app = getApps()[0];
  if (app) firestore = { db: getFirestore(app), collection, addDoc, getDocs, query, orderBy, limit, updateDoc, doc, increment };
} catch (e) {}

const TAGS = ['Karma', 'Bhakti', 'Dhyana', 'Wisdom', 'Peace', 'Strength', 'Gratitude', 'Surrender'];

export default function CommunityScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { displayName } = useProfile();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [verseRef, setVerseRef] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    if (!firestore) { setLoading(false); return; }
    try {
      const q = firestore.query(
        firestore.collection(firestore.db, 'community'),
        firestore.orderBy('createdAt', 'desc'),
        firestore.limit(50)
      );
      const snap = await firestore.getDocs(q);
      const data = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setPosts(data);
    } catch (e) { console.log('Fetch error:', e); }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !firestore) return;
    setPosting(true);
    try {
      await firestore.addDoc(firestore.collection(firestore.db, 'community'), {
        text: sanitizeInput(newPost.trim()),
        author: displayName || 'Anonymous',
        tag: selectedTag || 'Wisdom',
        verseRef: sanitizeInput(verseRef.trim()) || '',
        likes: 0,
        createdAt: new Date().toISOString(),
      });
      setNewPost('');
      setVerseRef('');
      setSelectedTag('');
      setShowCompose(false);
      await fetchPosts();
    } catch (e) { console.log('Post error:', e); }
    setPosting(false);
  };

  const handleLike = async (postId, currentLikes) => {
    if (!firestore) return;
    try {
      const ref = firestore.doc(firestore.db, 'community', postId);
      await firestore.updateDoc(ref, { likes: (currentLikes || 0) + 1 });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
    } catch (e) {}
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd ago';
    return new Date(dateStr).toLocaleDateString('en', { day: 'numeric', month: 'short' });
  };

  const tagColor = (tag) => {
    const colors = { Karma: '#C28840', Bhakti: '#C95A6A', Dhyana: '#14918E', Wisdom: '#7B1830', Peace: '#2E7D50', Strength: '#E8793A', Gratitude: '#DBA04E', Surrender: '#0E6B6B' };
    return colors[tag] || C.primary;
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Community</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{posts.length} reflections shared</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowCompose(!showCompose)}
            style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <LinearGradient colors={C.gradientGold} style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name={showCompose ? 'close' : 'plus'} size={20} color={C.textOnPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Compose */}
      {showCompose && (
        <View style={{ backgroundColor: C.bgCard, padding: 18, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <TextInput
            style={{ backgroundColor: C.bgInput, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: FontSizes.sm, color: C.textPrimary, borderWidth: 1, borderColor: C.border, minHeight: 80, textAlignVertical: 'top', outlineStyle: 'none', marginBottom: 10 }}
            placeholder="Share your reflection on a verse..."
            placeholderTextColor={C.textMuted}
            value={newPost} onChangeText={setNewPost}
            multiline numberOfLines={4}
          />
          <TextInput
            style={{ backgroundColor: C.bgInput, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: FontSizes.xs, color: C.textPrimary, borderWidth: 1, borderColor: C.border, marginBottom: 10, outlineStyle: 'none' }}
            placeholder="Verse reference (e.g. 2.47) — optional"
            placeholderTextColor={C.textMuted}
            value={verseRef} onChangeText={setVerseRef}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {TAGS.map(tag => (
                <TouchableOpacity key={tag} onPress={() => setSelectedTag(tag)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: selectedTag === tag ? tagColor(tag) + '15' : C.bgSecondary, borderWidth: 1, borderColor: selectedTag === tag ? tagColor(tag) : C.border }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: selectedTag === tag ? tagColor(tag) : C.textMuted }}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity onPress={handlePost} disabled={posting || !newPost.trim()} activeOpacity={0.85}>
            <LinearGradient colors={!newPost.trim() ? [C.border, C.border] : C.gradientGold}
              style={{ borderRadius: 14, paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="send" size={16} color={!newPost.trim() ? C.textMuted : C.textOnPrimary} />
              <Text style={{ fontSize: FontSizes.sm, fontWeight: '700', color: !newPost.trim() ? C.textMuted : C.textOnPrimary }}>
                {posting ? 'Sharing...' : 'Share Reflection'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Posts */}
      <ScrollView contentContainerStyle={{ padding: 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: FontSizes.md, color: C.textMuted }}>Loading reflections...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: C.borderGold }}>
              <MaterialCommunityIcons name="account-group-outline" size={32} color={C.primary} />
            </View>
            <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>Be the first!</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, textAlign: 'center' }}>Share your reflection on a Gita verse and inspire others</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={{ backgroundColor: C.bgCard, borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
              {/* Author + time */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.primary }}>{(post.author || 'A')[0].toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: C.textPrimary }}>{post.author || 'Anonymous'}</Text>
                    <Text style={{ fontSize: 10, color: C.textMuted }}>{getTimeAgo(post.createdAt)}</Text>
                  </View>
                </View>
                {post.tag && (
                  <View style={{ backgroundColor: tagColor(post.tag) + '12', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: tagColor(post.tag) }}>{post.tag}</Text>
                  </View>
                )}
              </View>

              {/* Verse ref */}
              {post.verseRef ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <MaterialCommunityIcons name="book-open-variant" size={12} color={C.primary} />
                  <Text style={{ fontSize: FontSizes.xs, color: C.primary, fontWeight: '600' }}>Gita {post.verseRef}</Text>
                </View>
              ) : null}

              {/* Text */}
              <Text style={{ fontSize: FontSizes.sm, color: C.textSecondary, lineHeight: 22, marginBottom: 12 }}>{post.text}</Text>

              {/* Like */}
              <TouchableOpacity onPress={() => handleLike(post.id, post.likes)} activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' }}>
                <MaterialCommunityIcons name="heart-outline" size={16} color={C.lotusRose} />
                <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{post.likes || 0}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}