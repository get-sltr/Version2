'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    accent: string;
    accentHover: string;
    buttonText: string;
    inputBg: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Dark mode colors - always used
const darkColors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceHover: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#8A8A8A',
  border: '#333333',
  borderLight: '#1C1C1E',
  accent: '#FF6B35',
  accentHover: '#FF8555',
  buttonText: '#FFFFFF',
  inputBg: '#1C1C1E',
  inputBorder: '#333333',
  inputText: '#FFFFFF',
  inputPlaceholder: '#666666',
};

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  // App is dark mode only - no toggle needed
  const value = useMemo(() => ({
    darkMode: true,
    toggleDarkMode: () => {}, // No-op, dark mode is always on
    colors: darkColors,
  }), []);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
