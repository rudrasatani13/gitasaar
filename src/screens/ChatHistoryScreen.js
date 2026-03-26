// src/screens/ChatHistoryScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useChatHistory } from '../theme/ChatHistoryContext';
import { FontSizes } from '../theme/colors';

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatHistoryScreen({ navigation }) {
  const { colors: C } = useTheme();
  const { conversations, deleteConversation, clearAll } = useChatHistory();

  const handleDelete = (id) => {
    Alert.alert('Delete Chat', 'Are you sure you want to delete this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(id) },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Delete all chat history? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: clearAll },
    ]);
  };

  return (
    <LinearGradient colors={C.gradientWarm} style={{ flex: 1 }}>
      <View style={{ paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={C.primary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary }}>Chat History</Text>
              <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{conversations.length} conversations</Text>
            </View>
          </View>
          {conversations.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={{ padding: 8 }}>
              <MaterialCommunityIcons name="delete-sweep-outline" size={20} color={C.vermillion} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {conversations.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: C.borderGold }}>
              <MaterialCommunityIcons name="chat-outline" size={32} color={C.primary} />
            </View>
            <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: C.textPrimary, marginBottom: 6 }}>No conversations yet</Text>
            <Text style={{ fontSize: FontSizes.sm, color: C.textMuted, textAlign: 'center' }}>Start a conversation with Krishna in the Chat tab — it will be saved here.</Text>
          </View>
        ) : (
          conversations.map((convo) => (
            <TouchableOpacity key={convo.id}
              style={{ backgroundColor: C.bgCard, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border, ...C.shadowLight, flexDirection: 'row', gap: 12, alignItems: 'center' }}
              activeOpacity={0.8}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold }}>
                <MaterialCommunityIcons name="chat-processing-outline" size={20} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: FontSizes.md, fontWeight: '600', color: C.textPrimary }} numberOfLines={1}>{convo.preview}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{formatDate(convo.date)}</Text>
                  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.textMuted }} />
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{formatTime(convo.date)}</Text>
                  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.textMuted }} />
                  <Text style={{ fontSize: FontSizes.xs, color: C.textMuted }}>{convo.messageCount} messages</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(convo.id)} style={{ padding: 6 }}>
                <MaterialCommunityIcons name="trash-can-outline" size={16} color={C.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}