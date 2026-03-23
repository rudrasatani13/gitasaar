// src/theme/BookmarkContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookmarkContext = createContext();
const BOOKMARKS_KEY = '@gitasaar_bookmarks_v2';
const FOLDERS_KEY = '@gitasaar_bm_folders';

const DEFAULT_FOLDERS = [
  { id: 'favorites', name: 'Favorites', icon: 'heart', color: '#E8793A' },
  { id: 'study', name: 'Study Later', icon: 'school-outline', color: '#0E6B6B' },
  { id: 'inspiration', name: 'Inspiration', icon: 'lightbulb-on-outline', color: '#C28840' },
  { id: 'share', name: 'To Share', icon: 'share-variant-outline', color: '#C95A6A' },
];

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState({});
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [bmData, folderData] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(FOLDERS_KEY),
      ]);
      if (bmData) setBookmarks(JSON.parse(bmData));
      if (folderData) setFolders(JSON.parse(folderData));
    } catch (e) {}
    setLoaded(true);
  };

  const saveBookmarks = async (updated) => {
    try { await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated)); } catch (e) {}
  };

  const saveFolders = async (updated) => {
    try { await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated)); } catch (e) {}
  };

  // Toggle bookmark (default folder = 'favorites')
  const toggleBookmark = (verse, folderId = 'favorites') => {
    const id = verse.chapter + '.' + verse.verse;
    const updated = { ...bookmarks };

    if (updated[id]) {
      delete updated[id];
    } else {
      updated[id] = {
        verse,
        folderId,
        date: new Date().toISOString(),
      };
    }

    setBookmarks(updated);
    saveBookmarks(updated);
  };

  // Move bookmark to different folder
  const moveToFolder = (verseId, folderId) => {
    if (!bookmarks[verseId]) return;
    const updated = { ...bookmarks, [verseId]: { ...bookmarks[verseId], folderId } };
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  // Add custom folder
  const addFolder = (name, icon = 'folder-outline', color = '#C28840') => {
    const id = 'custom_' + Date.now();
    const updated = [...folders, { id, name, icon, color }];
    setFolders(updated);
    saveFolders(updated);
    return id;
  };

  // Delete custom folder (move bookmarks to favorites)
  const deleteFolder = (folderId) => {
    if (['favorites', 'study', 'inspiration', 'share'].includes(folderId)) return;
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    saveFolders(updatedFolders);

    // Move bookmarks from deleted folder to favorites
    const updatedBm = { ...bookmarks };
    Object.keys(updatedBm).forEach(id => {
      if (updatedBm[id].folderId === folderId) {
        updatedBm[id].folderId = 'favorites';
      }
    });
    setBookmarks(updatedBm);
    saveBookmarks(updatedBm);
  };

  const isBookmarked = (verseId) => !!bookmarks[verseId];

  const getBookmarkFolder = (verseId) => bookmarks[verseId]?.folderId || null;

  const getBookmarksInFolder = (folderId) => {
    return Object.entries(bookmarks)
      .filter(([_, bm]) => bm.folderId === folderId)
      .map(([id, bm]) => ({ id, ...bm }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getAllBookmarks = () => {
    return Object.entries(bookmarks)
      .map(([id, bm]) => ({ id, ...bm }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const bookmarkCount = Object.keys(bookmarks).length;

  const getFolderCount = (folderId) => {
    return Object.values(bookmarks).filter(bm => bm.folderId === folderId).length;
  };

  return (
    <BookmarkContext.Provider value={{
      bookmarks, folders, bookmarkCount,
      toggleBookmark, moveToFolder, isBookmarked, getBookmarkFolder,
      getBookmarksInFolder, getAllBookmarks, getFolderCount,
      addFolder, deleteFolder, loaded,
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}