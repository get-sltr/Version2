'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

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

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const colors = useMemo(() => darkMode ? {
    // Dark mode - light text on dark background
    background: '#000000',
    surface: '#1C1C1E',
    surfaceHover: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#A3A3A3',  // WCAG AA compliant
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
  } : {
    // Light mode - dark text on light background
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceHover: '#EBEBEB',
    text: '#000000',
    textSecondary: '#555555',  // Good contrast on white
    textMuted: '#888888',
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    accent: '#FF6B35',
    accentHover: '#E55A2B',
    buttonText: '#FFFFFF',
    inputBg: '#FFFFFF',
    inputBorder: '#DDDDDD',
    inputText: '#000000',
    inputPlaceholder: '#999999',
  }, [darkMode]);

  const value = useMemo(() => ({ darkMode, toggleDarkMode, colors }), [darkMode, colors]);

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
