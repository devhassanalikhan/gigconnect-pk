import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  const webUrl = process.env.EXPO_PUBLIC_API_BASE_URL_WEB;
  const mobileUrl = process.env.EXPO_PUBLIC_API_BASE_URL_MOBILE;

  const fallback = Platform.select({
    web: 'http://localhost:8000',
    android: 'http://192.168.100.5:8000',
    ios: 'http://192.168.100.5:8000',
    default: 'http://192.168.100.5:8000',
  });

  if (Platform.OS === 'web') {
    return webUrl || fallback;
  }
  return mobileUrl || fallback;
};

const getGoogleMapsApiKey = (): string => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  return key.replace(/"/g, '');
};

export const API_BASE_URL = getApiBaseUrl();
export const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

console.log('[KaamGraph] API_BASE_URL configured as:', API_BASE_URL);

/**
 * Robust fetch wrapper with an integrated timeout to prevent infinite loader hangs.
 */
export async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 10000) {
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

