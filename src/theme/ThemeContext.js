// src/theme/ThemeContext.js
import React, { createContext, useContext } from 'react';
import { SpaceColors } from './colors';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Space theme is always active — no toggle needed
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ isDark: true, toggleTheme, colors: SpaceColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}