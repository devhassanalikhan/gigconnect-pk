// KaamGraph / screens/MapScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';

const { width } = Dimensions.get('window');

interface MapProvider {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  category: string;
  x: number;
  y: number;
}

const ALL_PROVIDERS: MapProvider[] = [
  {
    id: 'p1',
    name: 'Madina Hardware Sanitary Store',
    address: 'Tulsa Rd, Lalazar, Rawalpindi',
    distance: '0.7 km',
    rating: 5.0,
    category: 'Plumber',
    x: 180,
    y: 200,
  },
  {
    id: 'p2',
    name: 'BTS Solar & Electrician Services',
    address: 'Morgah Main Bazar, Rawalpindi',
    distance: '1.4 km',
    rating: 4.8,
    category: 'Electrician',
    x: 240,
    y: 150,
  },
  {
    id: 'p3',
    name: 'Chaudhary AC Cooling Point',
    address: 'G-13 Sector Markaz, Islamabad',
    distance: '0.9 km',
    rating: 4.6,
    category: 'AC Technician',
    x: 120,
    y: 110,
  },
  {
    id: 'p4',
    name: 'Rawal Paint & Decorators House',
    address: 'Saddar Metro Station, Rawalpindi',
    distance: '2.1 km',
    rating: 4.4,
    category: 'Painter',
    x: 270,
    y: 240,
  }
];

export default function MapScreen({ navigation }: any) {
  const { colors, selectedLocationIndex, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<MapProvider[]>(ALL_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState('p1');

  const activeSector = ISLAMABAD_SECTORS[selectedLocationIndex];

  // Auto-shift coordinate offsets based on selected home location index
  const getCoordinatesForSector = () => {
    switch (selectedLocationIndex) {
      case 0: return { x: 100, y: 120 }; // G-13
      case 1: return { x: 130, y: 100 }; // G-11
      case 2: return { x: 140, y: 80 };  // F-11
      case 3: return { x: 150, y: 60 };  // E-11
      case 4: return { x: 180, y: 150 }; // I-8
      case 5: return { x: 200, y: 130 }; // Blue Area
      case 6: return { x: 220, y: 220 }; // Saddar RWP
      default: return { x: 140, y: 140 };
    }
  };

  const clientCoords = getCoordinatesForSector();

  // Filter providers in real-time when query changes or search button is tapped
  const filterProviders = (queryText: string) => {
    setSearchQuery(queryText);
    if (!queryText.trim()) {
      setProviders(ALL_PROVIDERS);
      return;
    }

    const filtered = ALL_PROVIDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(queryText.toLowerCase()) ||
        p.category.toLowerCase().includes(queryText.toLowerCase()) ||
        p.address.toLowerCase().includes(queryText.toLowerCase())
    );
    setProviders(filtered);

    if (filtered.length > 0) {
      setSelectedProviderId(filtered[0].id);
    }
  };

  const handleCall = (name: string) => {
    Alert.alert('Calling Provider', `Connecting to ${name}...`);
  };

  const handleWhatsApp = (name: string) => {
    Alert.alert('WhatsApp Connected', `Opening chat thread with ${name}...`);
  };

  const activeProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Dynamic Search header */}
      <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search e.g. Plumber, Electrician..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={filterProviders}
        />
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Grid Canvas Viewport */}
      <View style={[styles.mapViewport, { backgroundColor: colors.background }]}>
        <View style={styles.mapGrid} />

        {/* Dynamic Rivers and Roads */}
        <View style={styles.river} />
        <View style={styles.highway} />

        {/* Auto Selected Sector Marker tooltip */}
        <View style={[styles.clientPin, { top: clientCoords.y, left: clientCoords.x }]}>
          <View style={styles.clientPinOuterRing} />
          <View style={styles.clientPinInner} />
          <View style={styles.clientLabel}>
            <Text style={styles.clientLabelText}>{activeSector.name}</Text>
          </View>
        </View>

        {/* Available providers pin list */}
        {providers.map((p) => {
          const isSelected = p.id === selectedProviderId;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.providerPin, { top: p.y, left: p.x }]}
              onPress={() => setSelectedProviderId(p.id)}
            >
              <Text style={[styles.pinText, isSelected && styles.selectedPinText]}>
                📍
              </Text>
              {isSelected && (
                <View style={[styles.pinTooltip, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.pinTooltipText, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Draw Vector Path lines connecting client to active selection */}
        {activeProvider && (
          <View
            style={[
              styles.routeLine,
              {
                width: Math.max(2, Math.abs(activeProvider.x - clientCoords.x)),
                height: Math.max(2, Math.abs(activeProvider.y - clientCoords.y)),
                left: Math.min(clientCoords.x, activeProvider.x) + 5,
                top: Math.min(clientCoords.y, activeProvider.y) + 5,
              }
            ]}
          />
        )}
      </View>

      {/* Bottom Providers Carousel List */}
      <View style={[styles.bottomList, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <Text style={[styles.listHeader, { color: colors.text }]}>
          {providers.length} Providers Found near {activeSector.name}
        </Text>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {providers.map((p) => {
            const isSelected = p.id === selectedProviderId;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.providerCard,
                  { backgroundColor: colors.background, borderColor: isSelected ? colors.primary : colors.border, borderWidth: 1 }
                ]}
                onPress={() => setSelectedProviderId(p.id)}
              >
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[styles.cardAddress, { color: colors.textMuted }]} numberOfLines={1}>{p.address}</Text>
                
                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardRating}>★ {p.rating.toFixed(1)}</Text>
                  <Text style={[styles.cardDistance, { color: colors.textMuted }]}>{p.distance} away • {p.category}</Text>
                </View>

                {/* Direct Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.border }]}
                    onPress={() => handleCall(p.name)}
                  >
                    <Text style={[styles.actionBtnTxt, { color: colors.text }]}>📞 Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.border, marginLeft: 8 }]}
                    onPress={() => handleWhatsApp(p.name)}
                  >
                    <Text style={[styles.actionBtnTxt, { color: colors.text }]}>💬 Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary, marginLeft: 8 }]}
                    onPress={() => navigation.navigate('Book', { provider: p, serviceType: p.category })}
                  >
                    <Text style={styles.actionBtnTxt}>Book</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          {providers.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={{ color: colors.textMuted }}>No providers found matching query.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 14,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  mapViewport: {
    flex: 1,
    backgroundColor: '#0c0f17',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    borderWidth: 0.5,
    borderColor: '#94a3b8',
  },
  river: {
    position: 'absolute',
    width: 30,
    height: 600,
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    left: 90,
    top: -50,
    transform: [{ rotate: '30deg' }],
  },
  highway: {
    position: 'absolute',
    width: 6,
    height: 800,
    backgroundColor: '#1e293b',
    left: 200,
    top: -100,
    transform: [{ rotate: '-40deg' }],
  },
  clientPin: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
    marginTop: -12,
    zIndex: 10,
  },
  clientPinOuterRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  clientPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  clientLabel: {
    position: 'absolute',
    top: 24,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#334155',
  },
  clientLabelText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  providerPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16,
    marginTop: -16,
    zIndex: 5,
  },
  pinText: {
    fontSize: 24,
  },
  selectedPinText: {
    fontSize: 30,
  },
  pinTooltip: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    width: 130,
    alignItems: 'center',
  },
  pinTooltipText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  routeLine: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 100,
    opacity: 0.5,
  },
  bottomList: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 16,
  },
  listHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  carouselContainer: {
    paddingHorizontal: 14,
  },
  providerCard: {
    backgroundColor: '#090d16',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    width: 290,
    marginHorizontal: 6,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardAddress: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cardRating: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  cardDistance: {
    color: '#94a3b8',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCard: {
    width: 290,
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
});
