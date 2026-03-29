// src/theme/ChatHistoryContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../utils/firebase';
import { onSyncComplete } from '../utils/userDataSync';

const ChatHistoryContext = createContext();
const HISTORY_KEY = '@gitasaar_chat_history';

export function ChatHistoryProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load();

    // Re-read after cloud restore so chat history syncs across devices
    const unsubSync = onSyncComplete(() => load());

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) setConversations([]);
    });

    return () => { unsubSync(); unsubAuth(); };
  }, []);

  const load = async () => {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) setConversations(JSON.parse(data));
    } catch (e) {
      console.error('ChatHistory load error:', e);
    }
    setLoaded(true);
  };

  const save = async (updated) => {
    try { await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch (e) { console.error('ChatHistory save error:', e); }
  };

  // Save a conversation (array of messages)
  const saveConversation = (messages) => {
    if (!messages || messages.length <= 1) return; // Don't save empty/welcome-only
    const userMsgs = messages.filter(m => m.type === 'user');
    if (userMsgs.length === 0) return;

    const convo = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      preview: userMsgs[0].text.substring(0, 60),
      messageCount: messages.length,
      messages: messages.slice(-20), // Keep last 20 messages max
    };
    const updated = [convo, ...conversations].slice(0, 30); // Max 30 conversations
    setConversations(updated);
    save(updated);
  };

  const deleteConversation = (id) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    save(updated);
  };

  const clearAll = async () => {
    setConversations([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  };

  return (
    <ChatHistoryContext.Provider value={{ conversations, saveConversation, deleteConversation, clearAll, loaded }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  return useContext(ChatHistoryContext);
}