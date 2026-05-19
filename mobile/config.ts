import { Platform } from 'react-native';

// This is the IP address of your machine on the local network.
// On web, we use localhost. On mobile, we use the local network IP.
const LOCAL_IP = '192.168.18.141'; 

export const API_BASE_URL = Platform.select({
  web: 'http://localhost:8000',
  android: `http://${LOCAL_IP}:8000`,
  ios: `http://${LOCAL_IP}:8000`,
  default: `http://${LOCAL_IP}:8000`,
});

console.log('[KaamGraph] API_BASE_URL configured as:', API_BASE_URL);
