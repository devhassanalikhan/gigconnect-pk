const path = require('path');
const dotenv = require('dotenv');
const appJson = require('./app.json');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Ensure we strip any accidental string quotes that can cause native Android crash
const rawKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
const GOOGLE_MAPS_API_KEY = rawKey.replace(/"/g, '').replace(/'/g, '');

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('[KaamGraph] WARNING: Google Maps API key is not set in .env. Map features may crash on native builds.');
}

const expoConfig = {
  ...appJson.expo,
  ios: {
    ...appJson.expo.ios,
    config: {
      ...appJson.expo.ios?.config,
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    ...appJson.expo.android,
    config: {
      ...appJson.expo.android?.config,
      googleMaps: {
        ...(appJson.expo.android?.config?.googleMaps || {}),
        apiKey: GOOGLE_MAPS_API_KEY,
      },
    },
  },
};

module.exports = {
  expo: expoConfig,
};
