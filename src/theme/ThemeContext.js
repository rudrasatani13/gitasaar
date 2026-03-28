// src/theme/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { LightColors, DarkColors } from './colors';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false); // default = light (warm spiritual)

  const toggleTheme = () => setIsDark(prev => !prev);
  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}