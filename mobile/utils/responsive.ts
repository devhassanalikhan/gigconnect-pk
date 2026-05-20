// Responsive Design Utilities for KaamGraph
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen size breakpoints
export const SCREEN_SIZE = {
  SMALL: width < 375,      // Small phones (iPhone SE, etc.)
  MEDIUM: width < 768,     // Phones
  LARGE: width < 1024,     // Tablets
  XLARGE: width >= 1024,   // Large tablets, desktops
};

// Responsive scale factor based on screen width
export const SCALE_FACTOR = width / 375;

// Base dimensions
export const BASE_WIDTH = width;
export const BASE_HEIGHT = height;
export const SAFE_AREA_HORIZONTAL = Platform.OS === 'ios' ? 20 : 16;
export const SAFE_AREA_VERTICAL = Platform.OS === 'ios' ? 12 : 8;

// Responsive spacing scale
export const rSpacing = (value: number): number => {
  return Math.round(value * SCALE_FACTOR);
};

// Responsive font size
export const rFontSize = (size: number): number => {
  return Math.round(size * SCALE_FACTOR);
};

// Responsive margin/padding
export const rMargin = (value: number): number => rSpacing(value);
export const rPadding = (value: number): number => rSpacing(value);

// Responsive width
export const rWidth = (percentage: number): number => {
  return (width * percentage) / 100;
};

// Responsive height
export const rHeight = (percentage: number): number => {
  return (height * percentage) / 100;
};

// Get grid column width for multi-column layouts
export const getGridColumnWidth = (columns: number, gap: number = 12): number => {
  const totalGap = (columns - 1) * gap;
  const availableWidth = width - SAFE_AREA_HORIZONTAL * 2 - totalGap;
  return availableWidth / columns;
};

// Responsive card height
export const rCardHeight = (baseHeight: number = 200): number => {
  return Math.max(baseHeight * SCALE_FACTOR, 140);
};

// Get dynamic columns based on screen width
export const getDynamicColumns = (): number => {
  if (SCREEN_SIZE.SMALL) return 1;
  if (SCREEN_SIZE.MEDIUM) return 2;
  if (SCREEN_SIZE.LARGE) return 3;
  return 4;
};

// Shadow styling responsive
export const rShadow = (elevation: number = 3) => ({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: 0.15,
    shadowRadius: elevation * 1.5,
  },
  android: {
    elevation: elevation,
  },
  web: {
    boxShadow: `0px ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.15)`,
  },
});

// Get platform-specific shadow
export const getShadow = (elevation: number = 3) => {
  if (Platform.OS === 'ios') return rShadow(elevation).ios;
  if (Platform.OS === 'android') return rShadow(elevation).android;
  return rShadow(elevation).web;
};

// Responsive border radius
export const rBorderRadius = (size: number): number => {
  return Math.round(size * SCALE_FACTOR);
};

// Get responsive card dimensions
export const getCardDimensions = () => ({
  width: getGridColumnWidth(SCREEN_SIZE.SMALL ? 1 : SCREEN_SIZE.MEDIUM ? 2 : 3, rPadding(12)),
  height: rCardHeight(),
  padding: rPadding(16),
  borderRadius: rBorderRadius(16),
  gap: rPadding(12),
});

// Responsive line height
export const rLineHeight = (size: number, multiplier: number = 1.5): number => {
  return Math.round(size * multiplier * SCALE_FACTOR);
};

// Responsive icon size
export const rIconSize = (baseSize: number = 24): number => {
  return Math.round(baseSize * SCALE_FACTOR);
};

// Responsive image width based on column count
export const rImageWidth = (columns: number = 2): number => {
  return getGridColumnWidth(columns, rPadding(12));
};
