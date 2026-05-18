import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark';
export type UserRole = 'client' | 'provider';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  terminalBackground: string;
  terminalHeader: string;
  inputBackground: string;
  statusBar: 'light' | 'dark';
}

const darkColors: ThemeColors = {
  background: '#0f0f0f',
  cardBackground: '#16161a',
  text: '#ffffff',
  textMuted: '#94a3b8',
  border: '#262629',
  primary: '#6366f1', // Premium Indigo
  primaryLight: 'rgba(99, 102, 241, 0.12)',
  success: '#10b981', // Emerald
  successLight: 'rgba(16, 185, 129, 0.12)',
  warning: '#f59e0b', // Amber
  warningLight: 'rgba(245, 158, 11, 0.12)',
  danger: '#e11d48', // Rose
  dangerLight: 'rgba(225, 29, 72, 0.12)',
  terminalBackground: '#0c0c0e',
  terminalHeader: '#16181c',
  inputBackground: '#0d1117',
  statusBar: 'light',
};

const lightColors: ThemeColors = {
  background: '#f8fafc', // Slate 50
  cardBackground: '#ffffff',
  text: '#0f172a', // Slate 900
  textMuted: '#64748b', // Slate 500
  border: '#e2e8f0', // Slate 200
  primary: '#4f46e5', // Deep Indigo
  primaryLight: 'rgba(79, 70, 229, 0.08)',
  success: '#059669', // Stronger Emerald
  successLight: 'rgba(5, 150, 105, 0.08)',
  warning: '#d97706', // Stronger Amber
  warningLight: 'rgba(217, 119, 6, 0.08)',
  danger: '#dc2626', // Stronger Red
  dangerLight: 'rgba(220, 38, 38, 0.08)',
  terminalBackground: '#0f172a', // Keeps high-tech terminal dark even in light mode for maximum legibility and wow factor!
  terminalHeader: '#1e293b',
  inputBackground: '#f1f5f9', // Slate 100
  statusBar: 'dark',
};

interface ThemeContextProps {
  theme: ThemeType;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  userRole: UserRole;
  toggleUserRole: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('dark'); // Default to dark premium for wow factor
  const [userRole, setUserRole] = useState<UserRole>('client'); // Default to client persona

  useEffect(() => {
    if (systemScheme) {
      setTheme(systemScheme as ThemeType);
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleUserRole = () => {
    setUserRole((prev) => (prev === 'client' ? 'provider' : 'client'));
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, toggleTheme, userRole, toggleUserRole }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
