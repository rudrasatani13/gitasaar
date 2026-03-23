// src/utils/haptics.js
import { Platform } from 'react-native';

let Haptics = null;

try {
  Haptics = require('expo-haptics');
} catch (e) {}

// Light tap - for button presses, toggles
export function tapLight() {
  if (Platform.OS === 'web' || !Haptics) return;
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
}

// Medium tap - for important actions (bookmark, send)
export function tapMedium() {
  if (Platform.OS === 'web' || !Haptics) return;
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
}

// Heavy tap - for destructive actions (delete, logout)
export function tapHeavy() {
  if (Platform.OS === 'web' || !Haptics) return;
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}
}

// Success notification - for completed actions
export function notifySuccess() {
  if (Platform.OS === 'web' || !Haptics) return;
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
}

// Error notification
export function notifyError() {
  if (Platform.OS === 'web' || !Haptics) return;
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (e) {}
}

// Selection change - for picker/scroll selection
export function selectionTap() {
  if (Platform.OS === 'web' || !Haptics) return;
  try { Haptics.selectionAsync(); } catch (e) {}
}