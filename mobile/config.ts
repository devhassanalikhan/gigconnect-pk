import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiBaseUrl = (): string => {
  // ─── Web Target ────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_BASE_URL_WEB || 'http://localhost:8000';
  }

  // ─── Local Host IP Auto-Resolution ──────────────────────────────────────
  // Since physical mobile devices running Expo Go connect to your laptop's Wi-Fi,
  // we can read your computer's IP directly from Expo's dev server packager configuration.
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  // ─── Environment Override ───────────────────────────────────────────────
  const mobileUrl = process.env.EXPO_PUBLIC_API_BASE_URL_MOBILE;
  if (mobileUrl && !mobileUrl.includes('localhost') && !mobileUrl.includes('127.0.0.1')) {
    return mobileUrl;
  }

  // ─── Robust Fallback ───────────────────────────────────────────────────
  return 'http://localhost:8000';
};

const getGoogleMapsApiKey = (): string => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  return key.replace(/"/g, '');
};

export const API_BASE_URL = getApiBaseUrl();
export const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

console.log('[KaamGraph] API_BASE_URL configured as:', API_BASE_URL);

// Enable mock/demo mode for offline demos and deterministic recordings.
export const USE_MOCK = (process.env.EXPO_PUBLIC_USE_MOCK === 'true') || false;
export const MOCK_DELAY_MS = Number(process.env.EXPO_PUBLIC_MOCK_DELAY_MS) || 700;

/**
 * Robust fetch wrapper with an integrated timeout to prevent infinite loader hangs.
 */
export async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check if your backend API is running and accessible.');
    }
    throw error;
  }
}

