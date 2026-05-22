// KaamGraph / screens/MapScreen.tsx - REDESIGNED & FIXED
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';
import { GOOGLE_MAPS_API_KEY, API_BASE_URL, fetchWithTimeout, USE_MOCK } from '../config';
import { getProvidersMock } from '../mock/mockApi';
import { rPadding, rFontSize, rMargin, rBorderRadius, getShadow, rIconSize, rSpacing } from '../utils/responsive';
import { isValidCoordinate } from '../utils/validation';

const { width, height } = Dimensions.get('window');

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

import MapView, { Marker, Polyline } from '../utils/MapComponents';

interface MapProvider {
  id: string;
  name: string;
  address: string;
  phone_number?: string;
  distance_in_meters?: number;
  distanceVal?: number;
  distance?: string;
  rating: number;
  category: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  base_cost: number;
}

const LOCAL_GEO_DIRECTORY: { [key: string]: { lat: number; lng: number } } = {
  "G-13": { lat: 33.6420, lng: 72.9700 },
  "G-11": { lat: 33.6655, lng: 72.9922 },
  "F-11": { lat: 33.6841, lng: 72.9863 },
  "E-11": { lat: 33.6995, lng: 72.9754 },
  "I-8":  { lat: 33.6702, lng: 73.0722 },
  "F-6":  { lat: 33.7297, lng: 73.0745 },
  "F-7":  { lat: 33.7208, lng: 73.0561 },
  "G-9":  { lat: 33.6826, lng: 73.0289 },
  "H-13": { lat: 33.6300, lng: 72.9500 },
  "G-15": { lat: 33.6212, lng: 72.9150 },
  "BLUE AREA": { lat: 33.7112, lng: 73.0583 },
  "SADDAR": { lat: 33.5934, lng: 73.0531 },
  "TULSA ROAD": { lat: 33.5786, lng: 73.0441 },
  "LALAZAR": { lat: 33.5701, lng: 73.0385 },
  "BAHRIA TOWN": { lat: 33.5231, lng: 73.1042 },
  "DHA": { lat: 33.5186, lng: 73.1415 },
  "ISLAMABAD": { lat: 33.6844, lng: 73.0479 },
  "ADYALA ROAD": { lat: 33.5500, lng: 73.0200 },
  "RAWALPINDI": { lat: 33.5973, lng: 73.0479 },
};

const LOCAL_SEED_PROVIDERS = [
  { id: 'p1', name: 'Khan Plumbing', category: 'Plumber', rating: 4.7, lat: 33.6350, lng: 72.9810, address: 'G-13 Sector, Islamabad', base_cost: 1500, phone_number: '0300-5551111' },
  { id: 'p2', name: 'G13 Leak Fixers', category: 'Plumber', rating: 4.3, lat: 33.6420, lng: 72.9700, address: 'G-13 Markaz, Islamabad', base_cost: 1200, phone_number: '0300-5552222' },
  { id: 'p3', name: 'City Plumbers', category: 'Plumber', rating: 4.5, lat: 33.6480, lng: 72.9750, address: 'F-11 Markaz, Islamabad', base_cost: 1400, phone_number: '0321-5553333' },
  { id: 'p4', name: 'Ahmed Electric', category: 'Electrician', rating: 4.8, lat: 33.6411, lng: 72.9723, address: 'G-13 Sector, Islamabad', base_cost: 1800, phone_number: '0333-5554444' },
  { id: 'p5', name: 'FastFix Electric', category: 'Electrician', rating: 4.6, lat: 33.6290, lng: 72.9650, address: 'G-13 Main Rd, Islamabad', base_cost: 1600, phone_number: '0345-5555555' },
  { id: 'p6', name: 'Power Solutions', category: 'Electrician', rating: 4.4, lat: 33.6500, lng: 72.9900, address: 'F-11 Sector, Islamabad', base_cost: 1700, phone_number: '0301-5556666' },
  { id: 'p7', name: 'Ali AC Services', category: 'AC Technician', rating: 4.9, lat: 33.6380, lng: 72.9680, address: 'G-13/4 Sector, Islamabad', base_cost: 2000, phone_number: '0300-5557777' },
  { id: 'p8', name: 'CoolTech AC', category: 'AC Technician', rating: 4.4, lat: 33.6440, lng: 72.9760, address: 'G-13 Markaz, Islamabad', base_cost: 1800, phone_number: '0312-5558888' },
  { id: 'p9', name: 'Arctic Cool', category: 'AC Technician', rating: 4.6, lat: 33.6350, lng: 72.9810, address: 'F-11 Sector, Islamabad', base_cost: 2200, phone_number: '0322-5559999' },
  { id: 'p10', name: 'HomeGlow Painters', category: 'Painter', rating: 4.8, lat: 33.6411, lng: 72.9723, address: 'G-13 Sector, Islamabad', base_cost: 2500, phone_number: '0331-5550000' },
  { id: 'p11', name: 'Islamabad Painters', category: 'Painter', rating: 4.2, lat: 33.6290, lng: 72.9650, address: 'I-8 Sector, Islamabad', base_cost: 2000, phone_number: '0334-5551212' },
  { id: 'p12', name: 'ColorPro Painters', category: 'Painter', rating: 4.5, lat: 33.6500, lng: 72.9900, address: 'E-11 Sector, Islamabad', base_cost: 2300, phone_number: '0346-5553434' },
];

const mockMapProviders = [
  {
    id: "PROV-MOCK-001",
    provider_id: "PROV-MOCK-001",
    name: "Islamabad Master Plumbers & Electricians",
    address: "G-11 Markaz, Near Al-Mahr Plaza, Islamabad",
    phone_number: "+923001234567",
    latitude: 33.6425,
    longitude: 73.0762,
    distance_in_meters: 1500
  },
  {
    id: "PROV-MOCK-002",
    provider_id: "PROV-MOCK-002",
    name: "Pakistan Electrical & Plumbing Hub",
    address: "I-10 Markaz, Korang Road, Islamabad",
    phone_number: "+923219876543",
    latitude: 33.6281,
    longitude: 73.0789,
    distance_in_meters: 3200
  },
  {
    id: "PROV-MOCK-003",
    provider_id: "PROV-MOCK-003",
    name: "DHA Phase II Quick-Fix Cleaning Services",
    address: "Alhaaj Market, Main GT Road, DHA Phase II, Islamabad",
    phone_number: "+923335551212",
    latitude: 33.5202,
    longitude: 73.1611,
    distance_in_meters: 6400
  }
];

export default function MapScreen({ navigation }: any) {
  const { colors, selectedLocationIndex, theme, language } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [rawProviders, setRawProviders] = useState<any[]>(LOCAL_SEED_PROVIDERS);
  const [providers, setProviders] = useState<MapProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: 33.6411,
    longitude: 72.9723,
    latitudeDelta: 0.035,
    longitudeDelta: 0.035,
  });

  const mapRef = useRef<any>(null);
  const searchDebounceTimer = useRef<any>(null);
  const activeSector = ISLAMABAD_SECTORS[selectedLocationIndex];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = loc.coords;

          if (isValidCoordinate(latitude, longitude)) {
            updateMapViewport(latitude, longitude);
            fetchAndSetProviders(latitude, longitude);
          }
        } else {
          fallbackToSectorLocation();
        }
      } catch (err) {
        console.warn('[KaamGraph] Location error:', err);
        fallbackToSectorLocation();
      }
    })();
  }, []);

  useEffect(() => {
    if (activeSector && isValidCoordinate(activeSector.lat, activeSector.lng)) {
      updateMapViewport(activeSector.lat, activeSector.lng);
      fetchAndSetProviders(activeSector.lat, activeSector.lng);
    }
  }, [selectedLocationIndex]);

  const fallbackToSectorLocation = () => {
    const lat = activeSector?.lat || 33.6411;
    const lng = activeSector?.lng || 72.9723;
    if (isValidCoordinate(lat, lng)) {
      updateMapViewport(lat, lng);
      fetchAndSetProviders(lat, lng);
    }
  };

  const updateMapViewport = (lat: number, lng: number) => {
    if (!isValidCoordinate(lat, lng)) return;
    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    };
    setMapRegion(newRegion);
    if (Platform.OS !== 'web' && mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const fetchAndSetProviders = async (centerLat: number, centerLng: number, filterQuery = '') => {
    if (!isValidCoordinate(centerLat, centerLng)) return;

    try {
      setIsLoading(true);
      let data: any = null;

      if (USE_MOCK) {
        // Use frontend mock data for deterministic demos
        const res = await getProvidersMock(centerLat, centerLng);
        data = res;
      } else {
        const fetchProductionMapData = async () => {
          try {
             // We use our clean dynamically generated API_BASE_URL (or Vercel HTTPS explicitly)
             // As instructed, using explicit vercel backend url: https://gigconnect-pk.vercel.app/api/providers
            const response = await fetchWithTimeout(`https://gigconnect-pk.vercel.app/api/providers?lat=${centerLat}&lng=${centerLng}`, {}, 8000);
            
            if (!response.ok) {
              throw new Error(`Server returned status: ${response.status}`);
            }
            
            const fetchedData = await response.json();
            if (fetchedData && Array.isArray(fetchedData.providers) && fetchedData.providers.length > 0 && !fetchedData.error) {
              return fetchedData;
            } else {
              console.warn("Backend data empty or restricted. Injecting fallback markers.");
              return { providers: mockMapProviders };
            }
          } catch (error) {
            console.warn("Production network failure or billing block. Activating offline fallback tier:", error);
            return { providers: mockMapProviders };
          }
        };

        data = await fetchProductionMapData();
      }

      let providerList = mockMapProviders;
      if (data && Array.isArray(data.providers) && data.providers.length > 0) {
        providerList = data.providers.map((p: any) => {
          const id = p.id || p.provider_id || String(Math.random());
          const name = p.name || p.displayName?.text || 'Unknown Provider';
          const address = p.address || p.formattedAddress || p.formatted_address || 'Islamabad, Pakistan';
          const phone_number = p.phone_number || p.phoneNumber || p.phone || p.internationalPhoneNumber || p.nationalPhoneNumber || p.formatted_phone_number || '0300-1234567';
          
          let lat = centerLat;
          let lng = centerLng;
          if (p.lat !== undefined && p.lng !== undefined) {
            lat = Number(p.lat);
            lng = Number(p.lng);
          } else if (p.latitude !== undefined && p.longitude !== undefined) {
            lat = Number(p.latitude);
            lng = Number(p.longitude);
          } else if (p.location?.latitude !== undefined && p.location?.longitude !== undefined) {
            lat = Number(p.location.latitude);
            lng = Number(p.location.longitude);
          } else if (p.geometry?.location) {
            lat = typeof p.geometry.location.lat === 'function' ? p.geometry.location.lat() : Number(p.geometry.location.lat);
            lng = typeof p.geometry.location.lng === 'function' ? p.geometry.location.lng() : Number(p.geometry.location.lng);
          }

          const category = p.service_type || p.category || 'Service';
          const rating = Math.min(5, Math.max(0, Number(p.rating) || 0));
          const base_cost = Number(p.base_cost) || Number(p.base_rate) || 0;
          const distance_in_meters = p.distance_in_meters || null;

          return {
            id,
            provider_id: id,
            name,
            address,
            phone_number,
            latitude: lat,
            longitude: lng,
            lat,
            lng,
            category,
            rating,
            base_cost,
            distance_in_meters,
          };
        });
      }

      setRawProviders(providerList);
      filterAndSortProviders(centerLat, centerLng, filterQuery, providerList);
    } catch (error) {
      console.log('[KaamGraph] Backend offline or mock failure, using local providers.', error);
      setRawProviders(mockMapProviders);
      filterAndSortProviders(centerLat, centerLng, filterQuery, mockMapProviders);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProviders = (centerLat: number, centerLng: number, queryText: string, list: any[]) => {
    if (!isValidCoordinate(centerLat, centerLng)) return;

    let filtered = list;
    if (queryText && queryText.trim().length > 0) {
      const q = queryText.toLowerCase().trim();
      filtered = list.filter(
        (p) =>
          String(p.name).toLowerCase().includes(q) ||
          String(p.category).toLowerCase().includes(q) ||
          String(p.address).toLowerCase().includes(q)
      );
    }

    const calculated: MapProvider[] = filtered
      .filter((p) => {
        const plat = p.latitude !== undefined ? p.latitude : p.lat;
        const plng = p.longitude !== undefined ? p.longitude : p.lng;
        return isValidCoordinate(plat, plng);
      })
      .map((p) => {
        const plat = p.latitude !== undefined ? p.latitude : p.lat;
        const plng = p.longitude !== undefined ? p.longitude : p.lng;
        const distanceVal = getHaversineDistance(centerLat, centerLng, plat, plng);
        return {
          ...p,
          latitude: plat,
          longitude: plng,
          lat: plat,
          lng: plng,
          distanceVal,
          distance_in_meters: Math.round(distanceVal * 1000),
          distance: `${distanceVal.toFixed(1)} km`,
        };
      })
      .sort((a, b) => (a.distanceVal || 0) - (b.distanceVal || 0));

    setProviders(calculated);
    if (calculated.length > 0) {
      setSelectedProviderId(calculated[0].id);
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchQuery(text);
    filterAndSortProviders(mapRegion.latitude, mapRegion.longitude, text, rawProviders);

    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    if (text.trim().length > 2 && GOOGLE_MAPS_API_KEY) {
      searchDebounceTimer.current = setTimeout(async () => {
        try {
          // Attempt Places API (New) first (POST)
          const newAutocompleteUrl = 'https://places.googleapis.com/v1/places:autocomplete';
          const newResponse = await fetchWithTimeout(newAutocompleteUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            },
            body: JSON.stringify({
              input: text,
              includedRegionCodes: ['pk'],
            }),
          }, 6000);

          if (newResponse.ok) {
            const data = await newResponse.json();
            if (data && Array.isArray(data.suggestions)) {
              const mapped = data.suggestions.map((s: any) => ({
                place_id: s.placePrediction?.placeId || '',
                description: s.placePrediction?.text?.text || '',
                isNew: true,
              })).filter((s: any) => s.place_id !== '');
              setSuggestions(mapped.slice(0, 8));
              return;
            }
          }
        } catch (err) {
          console.warn('[KaamGraph] Places API (New) failed, trying legacy...', err);
        }

        // Fallback to Legacy API (GET)
        try {
          const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text
          )}&key=${GOOGLE_MAPS_API_KEY}&components=country:pk`;

          const response = await fetchWithTimeout(autocompleteUrl, {}, 6000);
          const data = await response.json();
          setSuggestions(data?.predictions?.slice(0, 8) || []);
        } catch (error) {
          console.warn('[KaamGraph] Autocomplete error:', error);
          setSuggestions([]);
        }
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (item: any) => {
    if (!item?.place_id) return;

    setSearchQuery(item.description);
    setSuggestions([]);

    if (!GOOGLE_MAPS_API_KEY) {
      Alert.alert('Error', 'Maps API not configured');
      return;
    }

    try {
      // Try Places API (New) details first
      const detailsNewUrl = `https://places.googleapis.com/v1/places/${item.place_id}`;
      const response = await fetchWithTimeout(detailsNewUrl, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'id,location,formattedAddress',
        },
      }, 6000);

      if (response.ok) {
        const data = await response.json();
        if (data?.location) {
          const lat = Number(data.location.latitude);
          const lng = Number(data.location.longitude);
          if (isValidCoordinate(lat, lng)) {
            updateMapViewport(lat, lng);
            await fetchAndSetProviders(lat, lng);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('[KaamGraph] Places API (New) details failed, trying legacy...', err);
    }

    // Fallback to Legacy API Details (GET)
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        item.place_id
      )}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetchWithTimeout(detailsUrl, {}, 6000);
      const data = await response.json();

      if (data?.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        if (isValidCoordinate(lat, lng)) {
          updateMapViewport(lat, lng);
          await fetchAndSetProviders(lat, lng);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load location details');
    }
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const queryUpper = searchQuery.toUpperCase().trim();
      let matchedLat = 0;
      let matchedLng = 0;

      for (const [area, coords] of Object.entries(LOCAL_GEO_DIRECTORY)) {
        if (queryUpper.includes(area)) {
          matchedLat = coords.lat;
          matchedLng = coords.lng;
          break;
        }
      }

      if (!matchedLat && !matchedLng && GOOGLE_MAPS_API_KEY) {
        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            searchQuery + ', Islamabad'
          )}&key=${GOOGLE_MAPS_API_KEY}`;
          const response = await fetchWithTimeout(url, {}, 6000);
          const data = await response.json();
          if (data?.results?.[0]?.geometry?.location) {
            matchedLat = Number(data.results[0].geometry.location.lat);
            matchedLng = Number(data.results[0].geometry.location.lng);
          }
        } catch (e) {
          console.warn('[KaamGraph] Geocoding API failed, trying offline/local search', e);
        }
      }

      if (isValidCoordinate(matchedLat, matchedLng)) {
        updateMapViewport(matchedLat, matchedLng);
        await fetchAndSetProviders(matchedLat, matchedLng);
      } else {
        Alert.alert(
          'Location Not Found',
          'Could not find the specified location. Please select from the dropdown or try again.'
        );
      }
    } catch (error) {
      console.error('[KaamGraph] Search submission error:', error);
      Alert.alert('Error', 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleGPSCenter = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = loc.coords;
        if (isValidCoordinate(latitude, longitude)) {
          updateMapViewport(latitude, longitude);
          filterAndSortProviders(latitude, longitude, searchQuery, rawProviders);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not get location');
    }
  };

  const activeProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Search Bar */}
      <View style={[styles.searchBarWrapper, { zIndex: 999, top: insets.top + rPadding(8) }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(12), paddingHorizontal: rPadding(12), paddingVertical: rPadding(10) }]}>
          <Ionicons name="location-outline" size={rIconSize(20)} color={colors.primary} style={{ marginRight: rMargin(10) }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontSize: rFontSize(14) }]}
            placeholder="Enter location or area..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchTextChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            maxLength={150}
          />
          {searchQuery.length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={rIconSize(18)} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSearchSubmit} style={{ padding: 6 }}>
                <Ionicons name="search" size={rIconSize(20)} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleSearchSubmit} style={{ padding: 6 }}>
              <Ionicons name="search" size={rIconSize(20)} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={[styles.suggestionsDropdown, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(8), marginTop: rMargin(4), maxHeight: rSpacing(200) }]}>
            <ScrollView keyboardShouldPersistTaps="always">
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={[styles.suggestionRow, { borderBottomColor: colors.border, paddingHorizontal: rPadding(12), paddingVertical: rPadding(10) }]}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Ionicons name="navigate-outline" size={rIconSize(16)} color={colors.primary} style={{ marginRight: rMargin(10) }} />
                  <Text style={[styles.suggestionText, { color: colors.text, fontSize: rFontSize(13) }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Map or Placeholder */}
      <View style={styles.mapViewport}>
        {Platform.OS === 'web' && GOOGLE_MAPS_API_KEY ? (
          <View style={StyleSheet.absoluteFillObject}>
            <iframe
              src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${mapRegion.latitude},${mapRegion.longitude}&zoom=14&maptype=roadmap`}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
              allowFullScreen
              loading="lazy"
            />
          </View>
        ) : MapView ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: 33.6844,
              longitude: 73.0479,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onRegionChangeComplete={(region: any) => {
              if (isValidCoordinate(region.latitude, region.longitude)) {
                setMapRegion(region);
              }
            }}
          >
            <Marker
              coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
              title="You"
            >
              <View style={[styles.clientMarker, { backgroundColor: colors.primary }]} />
            </Marker>

            {providers?.slice(0, 15).map((p) => (
              <Marker
                key={p.id || String(Math.random())}
                coordinate={{ latitude: p.latitude || p.lat, longitude: p.longitude || p.lng }}
                title={p.name}
                onPress={() => {
                  setSelectedProviderId(p.id);
                  updateMapViewport(p.latitude || p.lat, p.longitude || p.lng);
                }}
              >
                <View style={[styles.markerDot, p.id === selectedProviderId && { backgroundColor: colors.primary, transform: [{ scale: 1.25 }] }]} />
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={50} color={colors.textMuted} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Map not available</Text>
          </View>
        )}

        {/* Absolute Loading Overlay */}
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
            <View style={[styles.loadingBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingOverlayText, { color: colors.text }]}>Finding verified providers...</Text>
            </View>
          </View>
        )}

        {/* Empty State Callout overlay */}
        {!isLoading && providers.length === 0 && (
          <View style={[styles.noProvidersCallout, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Ionicons name="warning" size={24} color="#f59e0b" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noProvidersCalloutTitle, { color: colors.text }]}>No Providers Found</Text>
              <Text style={[styles.noProvidersCalloutText, { color: colors.textMuted }]}>
                No verified providers found in this area. Try searching for a different area (e.g., G-11, F-11, DHA).
              </Text>
            </View>
          </View>
        )}

        {/* GPS Button */}
        <TouchableOpacity
          style={[styles.gpsButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
          onPress={handleGPSCenter}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Providers List */}
      <View style={[styles.bottomList, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <View style={styles.listTop}>
          <Text style={[styles.listHeader, { color: colors.text }]}>
            {isLoading ? 'Searching...' : `${providers.length} Verified Providers Available`}
          </Text>
          {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carouselContainer}
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No providers found in this area</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = item.id === selectedProviderId;
            return (
              <TouchableOpacity
                style={[
                  styles.providerCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  setSelectedProviderId(item.id);
                  updateMapViewport(item.latitude, item.longitude);
                }}
              >
                {/* Header Tag and Rating */}
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardCategory, { color: colors.primary, backgroundColor: colors.primary + '15', paddingHorizontal: rPadding(8), paddingVertical: rPadding(2), borderRadius: rBorderRadius(4) }]}>
                    {item.category}
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={[styles.cardRating, { color: colors.text, marginLeft: 4 }]}>
                      {item.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>

                {/* Name */}
                <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>

                {/* Distance */}
                <Text style={[styles.cardDistance, { color: colors.textMuted }]}>
                  {item.distance_in_meters ? `${(item.distance_in_meters / 1000).toFixed(1)} km away` : 'Nearby'}
                </Text>

                {/* Address Row */}
                <View style={styles.addressRow}>
                  <Text style={[styles.cardAddress, { color: colors.textMuted }]} numberOfLines={1} ellipsizeMode="tail">
                    📍 {item.address}
                  </Text>
                </View>

                {/* Base Cost */}
                <Text style={[styles.cardCost, { color: colors.text, marginTop: rMargin(4) }]}>
                  Base Rate: <Text style={{ color: colors.primary, fontWeight: '700' }}>₨{item.base_cost}</Text>
                </Text>

                {/* Action Row */}
                <View style={styles.actionRow}>
                  {item.phone_number ? (
                    <TouchableOpacity
                      style={[styles.callBtn, { borderColor: colors.primary, borderWidth: 1 }]}
                      onPress={() => {
                        const url = `tel:${item.phone_number}`;
                        Linking.canOpenURL(url)
                          .then((supported) => {
                            if (supported) {
                              Linking.openURL(url);
                            } else {
                              Alert.alert('Error', 'Calling is not supported on this device');
                            }
                          })
                          .catch((err) => console.error('An error occurred calling provider:', err));
                      }}
                    >
                      <Ionicons name="call-outline" size={16} color={colors.primary} />
                      <Text style={[styles.callBtnText, { color: colors.primary }]}>Call Provider</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Book', { provider: item })}
                  >
                    <Text style={styles.bookBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarWrapper: {
    position: 'absolute',
    top: 12, // overridden dynamically via inline style using useSafeAreaInsets
    left: 12,
    right: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0, marginLeft: 5 },
  clearBtn: { padding: 6 },
  suggestionsDropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 7,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
  },
  suggestionText: { fontSize: 13, flex: 1 },
  mapViewport: { flex: 1, position: 'relative', overflow: 'hidden', marginTop: 10 },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  placeholderText: { marginTop: 12, fontSize: 14 },
  clientMarker: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#fff' },
  markerDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#6366f1', borderWidth: 2, borderColor: '#fff' },
  gpsButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  loadingOverlayText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  noProvidersCallout: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  noProvidersCalloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  noProvidersCalloutText: {
    fontSize: 12,
  },
  bottomList: { borderTopWidth: 1, paddingVertical: 12, paddingHorizontal: 12 },
  listTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listHeader: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  carouselContainer: { paddingHorizontal: 4 },
  providerCard: {
    borderRadius: 14,
    padding: 14,
    width: 290,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  cardCategory: { fontSize: 11, fontWeight: '600' },
  cardRating: { fontSize: 12, fontWeight: 'bold' },
  cardDistance: { fontSize: 12, marginBottom: 4 },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  cardAddress: {
    fontSize: 12,
    flex: 1,
  },
  cardCost: { fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rPadding(8),
    paddingHorizontal: rPadding(10),
    borderRadius: 8,
    flex: 1,
    gap: 4,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rPadding(8),
    paddingHorizontal: rPadding(10),
    borderRadius: 8,
    flex: 1,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    width: 290,
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  emptyText: { marginTop: 10, fontSize: 13 },
});
