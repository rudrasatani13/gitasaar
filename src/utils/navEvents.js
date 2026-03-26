// src/utils/navEvents.js
// Lightweight bridge — lets screens signal AppNavigator to re-read nav state
// from AsyncStorage without creating a circular import.
let _handler = null;
export const registerNavRefresh = (fn) => { _handler = fn; };
export const unregisterNavRefresh = () => { _handler = null; };
export const notifyNavStateChanged = () => { if (_handler) _handler(); };
