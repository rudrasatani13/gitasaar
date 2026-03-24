// src/utils/haptics.js
import { Platform } from 'react-native';

let Haptics = null;

try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.log("Haptics module not found. Falling back to silent mode.");
}

// Helper function to safely execute haptics
const safeHaptic = (action) => {
  if (Platform.OS === 'web' || !Haptics) return;
  try {
    action();
  } catch (e) {
    // Ignore error if haptic fails on a specific device
  }
};

// Light tap - for normal button presses, toggles, typing
export function tapLight() {
  safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

// Medium tap - for important actions (bookmarking, sending message, opening modal)
export function tapMedium() {
  safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

// Heavy tap - for destructive or major actions (delete, logout, clear chat)
export function tapHeavy() {
  safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}

// Success notification - for completed actions (correct quiz answer, payment success)
export function notifySuccess() {
  safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

// Error notification - for failed actions (wrong quiz answer, limit reached, network error)
export function notifyError() {
  safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}

// Selection change - for scrolling through lists, changing tabs
export function selectionChange() {
  if (Platform.OS === 'web' || !Haptics) return;
  try {
    Haptics.selectionAsync();
  } catch (e) {}
}