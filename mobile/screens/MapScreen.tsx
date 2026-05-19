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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';
import { GOOGLE_MAPS_API_KEY, API_BASE_URL, fetchWithTimeout } from '../config';
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

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default || Maps.MapView;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
  } catch (err) {
    console.warn('[KaamGraph] Maps not available:', err);
  }
}

interface MapProvider {
  id: string;
  name: string;
  address: string;
  distance: string;
  distanceVal: number;
  rating: number;
  category: string;
  lat: number;
  lng: number;
  base_cost: number;
}

const LOCAL_SEED_PROVIDERS = [
  { id: 'p1', name: 'Khan Plumbing', category: 'Plumber', rating: 4.7, lat: 33.6350, lng: 72.9810, address: 'G-13 Sector, Islamabad', base_cost: 1500 },
  { id: 'p2', name: 'G13 Leak Fixers', category: 'Plumber', rating: 4.3, lat: 33.6420, lng: 72.9700, address: 'G-13 Markaz, Islamabad', base_cost: 1200 },
  { id: 'p3', name: 'City Plumbers', category: 'Plumber', rating: 4.5, lat: 33.6480, lng: 72.9750, address: 'F-11 Markaz, Islamabad', base_cost: 1400 },
  { id: 'p4', name: 'Ahmed Electric', category: 'Electrician', rating: 4.8, lat: 33.6411, lng: 72.9723, address: 'G-13 Sector, Islamabad', base_cost: 1800 },
  { id: 'p5', name: 'FastFix Electric', category: 'Electrician', rating: 4.6, lat: 33.6290, lng: 72.9650, address: 'G-13 Main Rd, Islamabad', base_cost: 1600 },
  { id: 'p6', name: 'Power Solutions', category: 'Electrician', rating: 4.4, lat: 33.6500, lng: 72.9900, address: 'F-11 Sector, Islamabad', base_cost: 1700 },
  { id: 'p7', name: 'Ali AC Services', category: 'AC Technician', rating: 4.9, lat: 33.6380, lng: 72.9680, address: 'G-13/4 Sector, Islamabad', base_cost: 2000 },
  { id: 'p8', name: 'CoolTech AC', category: 'AC Technician', rating: 4.4, lat: 33.6440, lng: 72.9760, address: 'G-13 Markaz, Islamabad', base_cost: 1800 },
  { id: 'p9', name: 'Arctic Cool', category: 'AC Technician', rating: 4.6, lat: 33.6350, lng: 72.9810, address: 'F-11 Sector, Islamabad', base_cost: 2200 },
  { id: 'p10', name: 'HomeGlow Painters', category: 'Painter', rating: 4.8, lat: 33.6411, lng: 72.9723, address: 'G-13 Sector, Islamabad', base_cost: 2500 },
  { id: 'p11', name: 'Islamabad Painters', category: 'Painter', rating: 4.2, lat: 33.6290, lng: 72.9650, address: 'I-8 Sector, Islamabad', base_cost: 2000 },
  { id: 'p12', name: 'ColorPro Painters', category: 'Painter', rating: 4.5, lat: 33.6500, lng: 72.9900, address: 'E-11 Sector, Islamabad', base_cost: 2300 },
];

export default function MapScreen({ navigation }: any) {
  const { colors, selectedLocationIndex, theme, language } = useTheme();
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
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/providers`, {}, 8000);
      const data = await response.json();

      let providerList = LOCAL_SEED_PROVIDERS;
      if (data && Array.isArray(data.providers) && data.providers.length > 0) {
        providerList = data.providers.map((p: any) => ({
          id: p.id || '',
          name: p.name || 'Unknown',
          category: p.service_type || p.category || 'Service',
          rating: Math.min(5, Math.max(0, Number(p.rating) || 0)),
          lat: Number(p.lat) || centerLat,
          lng: Number(p.lng) || centerLng,
          address: p.address || 'Islamabad',
          base_cost: Number(p.base_cost) || 0,
        }));
      }

      setRawProviders(providerList);
      filterAndSortProviders(centerLat, centerLng, filterQuery, providerList);
    } catch (error) {
      console.log('[KaamGraph] Backend offline, using local providers.');
      setRawProviders(LOCAL_SEED_PROVIDERS);
      filterAndSortProviders(centerLat, centerLng, filterQuery, LOCAL_SEED_PROVIDERS);
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
      .filter(p => isValidCoordinate(p.lat, p.lng))
      .map((p) => ({
        ...p,
        distanceVal: getHaversineDistance(centerLat, centerLng, p.lat, p.lng),
        distance: `${getHaversineDistance(centerLat, centerLng, p.lat, p.lng).toFixed(1)} km`,
      }))
      .sort((a, b) => a.distanceVal - b.distanceVal);

    setProviders(calculated);
    if (calculated.length > 0) {
      setSelectedProviderId(calculated[0].id);
    }
  };

  const handleSearchTextChange = (text: string) => {
    // FIXED: Allow spaces, don't strip input
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
            filterAndSortProviders(lat, lng, '', rawProviders);
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
          filterAndSortProviders(lat, lng, '', rawProviders);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load location details');
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
      <View style={[styles.searchBarWrapper, { zIndex: 999 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Ionicons name="location-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search city, area or service..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchTextChange}
            maxLength={150}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={[styles.suggestionsDropdown, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <ScrollView keyboardShouldPersistTaps="always" style={{ maxHeight: 200 }}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={[styles.suggestionRow, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Ionicons name="navigate-outline" size={16} color={colors.primary} style={{ marginRight: 10 }} />
                  <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>
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
            initialRegion={mapRegion}
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

            {providers.slice(0, 15).map((p) => (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.lat, longitude: p.lng }}
                title={p.name}
                onPress={() => setSelectedProviderId(p.id)}
              >
                <View style={styles.markerDot} />
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={50} color={colors.textMuted} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Map not available</Text>
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
            {isLoading ? 'Loading...' : `${providers.length} Providers Found`}
          </Text>
          {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {providers.length > 0 ? (
            providers.map((p) => {
              const isSelected = p.id === selectedProviderId;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.providerCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedProviderId(p.id)}
                >
                  <Text style={[styles.cardName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.cardCategory, { color: colors.textMuted }]}>{p.category}</Text>

                  <View style={styles.ratingRow}>
                    <Text style={styles.cardRating}>⭐ {p.rating.toFixed(1)}</Text>
                    <Text style={[styles.cardDistance, { color: colors.textMuted }]}>{p.distance}</Text>
                  </View>

                  <Text style={[styles.cardCost, { color: colors.primary }]}>₨{p.base_cost}</Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]}>
                      <Ionicons name="call" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary }]}>
                      <Ionicons name="chatbubble" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: colors.primary, flex: 1 }]}
                      onPress={() => navigation.navigate('Book', { provider: p })}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No providers found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 12,
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
    bottom: 90,
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
  bottomList: { borderTopWidth: 1, paddingVertical: 12, paddingHorizontal: 12 },
  listTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listHeader: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  carouselContainer: { paddingHorizontal: 4 },
  providerCard: {
    borderRadius: 14,
    padding: 14,
    width: 280,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  cardName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  cardCategory: { fontSize: 12, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardRating: { fontSize: 13, fontWeight: 'bold' },
  cardDistance: { fontSize: 12 },
  cardCost: { fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 6 },
  smallBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  emptyCard: {
    width: 280,
    height: 140,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  emptyText: { marginTop: 10, fontSize: 13 },
});
