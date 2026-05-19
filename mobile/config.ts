import { Platform } from 'react-native';

// This is the IP address of your machine on the local network.
// On web, we use localhost. On mobile, we use the local network IP.
const LOCAL_IP = '192.168.100.5'; 

export const API_BASE_URL = Platform.select({
  web: 'http://localhost:8000',
  android: `http://${LOCAL_IP}:8000`,
  ios: `http://${LOCAL_IP}:8000`,
  default: `http://${LOCAL_IP}:8000`,
});

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

