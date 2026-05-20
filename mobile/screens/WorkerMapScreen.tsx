// KaamGraph / screens/WorkerMapScreen.tsx
// Worker-exclusive: Shows active job coverage zone, client pins, and navigation
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';
import { isValidCoordinate } from '../utils/validation';

const { width, height } = Dimensions.get('window');

interface JobPin {
  id: string;
  clientName: string;
  service: string;
  status: 'pending' | 'accepted' | 'en_route' | 'completed';
  latitude: number;
  longitude: number;
  // Fallback vector positions
  x: number;
  y: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#6366f1',
  en_route: '#10b981',
  completed: '#64748b',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  en_route: 'En Route',
  completed: 'Done',
};

import MapView, { Marker, Circle, Polyline } from '../utils/MapComponents';

export default function WorkerMapScreen() {
  const { language, selectedLocationIndex, activeBooking, colors, theme } = useTheme();
  const [selectedPin, setSelectedPin] = useState<JobPin | null>(null);
  const [zoneRadius, setZoneRadius] = useState(2); // km
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  
  const [workerLocation, setWorkerLocation] = useState({
    latitude: 33.6411,
    longitude: 72.9723,
    latitudeDelta: 0.035,
    longitudeDelta: 0.035,
  });

  const [jobPins, setJobPins] = useState<JobPin[]>([]);
  const mapRef = useRef<any>(null);
  const activeSector = ISLAMABAD_SECTORS[selectedLocationIndex];

  // Request system permission and fetch current physical coordinates for the Worker
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let lat = activeSector ? activeSector.lat : 33.6411;
        let lng = activeSector ? activeSector.lng : 72.9723;

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
          console.log('[KaamGraph] Worker panel GPS permission GRANTED. Lat:', lat, 'Lng:', lng);
        } else {
          console.log('[KaamGraph] Worker panel GPS permission DENIED. Centering on active sector.');
        }

        const newCoords = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        };
        setWorkerLocation(newCoords);
        generateDynamicJobPins(lat, lng);

        if (Platform.OS !== 'web' && mapRef.current) {
          mapRef.current.animateToRegion(newCoords, 1000);
        }
      } catch (err) {
        console.warn('[KaamGraph] Error requesting worker location:', err);
        const lat = activeSector ? activeSector.lat : 33.6411;
        const lng = activeSector ? activeSector.lng : 72.9723;
        generateDynamicJobPins(lat, lng);
      }
    })();
  }, [selectedLocationIndex]);

  // Generate real geographical offsets near the worker's coordinates
  const generateDynamicJobPins = (workerLat: number, workerLng: number) => {
    if (!isValidCoordinate(workerLat, workerLng)) return;

    const pins: JobPin[] = [
      {
        id: 'j1',
        clientName: 'Hassan Ali',
        service: 'AC Tech',
        status: 'accepted',
        latitude: workerLat + 0.004,
        longitude: workerLng - 0.005,
        x: 130,
        y: 110,
      },
      {
        id: 'j2',
        clientName: 'Zainab M.',
        service: 'Electrician',
        status: 'pending',
        latitude: workerLat - 0.003,
        longitude: workerLng + 0.006,
        x: 220,
        y: 170,
      },
      {
        id: 'j3',
        clientName: 'Bilal Khan',
        service: 'Plumber',
        status: 'pending',
        latitude: workerLat + 0.007,
        longitude: workerLng + 0.003,
        x: 170,
        y: 240,
      },
    ];
    setJobPins(pins);
    setSelectedPin(pins[0]);
  };

  const handleMarkerPress = (pin: JobPin) => {
    setSelectedPin(pin);
    if (Platform.OS !== 'web' && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: pin.latitude,
        longitude: pin.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      }, 800);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <View style={[styles.privacyNotice, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.privacyText, { color: colors.text }]}>
            📍 Your location is encrypted and only visible to assigned clients.
          </Text>
          <TouchableOpacity onPress={() => setShowPrivacyNotice(false)}>
            <Ionicons name="close" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'MY COVERAGE ZONE' : 'میرا کوریج زون'}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{activeSector.name}</Text>
        </View>
        <View style={[styles.radiusSelector, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setZoneRadius((r) => Math.max(1, r - 1))}
            style={[styles.radiusBtn, { backgroundColor: colors.border }]}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.radiusText, { color: colors.text }]}>{zoneRadius} km</Text>
          <TouchableOpacity
            onPress={() => setZoneRadius((r) => Math.min(5, r + 1))}
            style={[styles.radiusBtn, { backgroundColor: colors.border }]}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone Map Viewport */}
      <View style={[styles.mapViewport, { backgroundColor: colors.background }]}>
        {Platform.OS === 'web' ? (
          // Elegant vector layout simulation on Web target compile to ensure zero native crashes
          <View style={StyleSheet.absoluteFillObject}>
            <View style={styles.mapGrid} />
            <View style={[styles.road1, { backgroundColor: colors.border }]} />
            <View style={[styles.road2, { backgroundColor: colors.border }]} />

            {/* Simulated active coverage radius circle on web */}
            <View style={[
              styles.coverageCircle,
              {
                width: zoneRadius * 100,
                height: zoneRadius * 100,
                borderRadius: zoneRadius * 50,
                left: 160 - (zoneRadius * 50),
                top: 160 - (zoneRadius * 50),
              }
            ]} />

            {/* Worker central pin */}
            <View style={[styles.workerPin, { top: 160, left: 160 }]}>
              <View style={styles.workerPinOuter} />
              <View style={styles.workerPinInner}>
                <Ionicons name="construct" size={10} color="#fff" />
              </View>
              <View style={styles.workerLabel}>
                <Text style={styles.workerLabelText}>
                  {language === 'en' ? 'YOU' : 'آپ'}
                </Text>
              </View>
            </View>

            {/* Job request pins (Vector fallback on web) */}
            {jobPins.map((pin) => {
              const isSelected = selectedPin?.id === pin.id;
              const color = STATUS_COLORS[pin.status];
              return (
                <TouchableOpacity
                  key={pin.id}
                  style={[styles.jobPin, { top: pin.y, left: pin.x }]}
                  onPress={() => setSelectedPin(pin)}
                >
                  <View style={[styles.jobPinDot, { backgroundColor: color, borderColor: color }]}>
                    <Ionicons name="person" size={10} color="#fff" />
                  </View>
                  {isSelected && (
                    <View style={[styles.jobTooltip, { backgroundColor: colors.cardBackground, borderColor: color }]}>
                      <Text style={[styles.jobTooltipName, { color: colors.text }]}>{pin.clientName}</Text>
                      <Text style={[styles.jobTooltipStatus, { color }]}>
                        {STATUS_LABELS[pin.status]}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          // Native Hardware-accelerated MapView
          MapView && (
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              initialRegion={workerLocation}
              onRegionChangeComplete={(region: any) => setWorkerLocation(region)}
            >
              {/* Coverage Zone overlay Circle */}
              <Circle
                center={{ latitude: workerLocation.latitude, longitude: workerLocation.longitude }}
                radius={zoneRadius * 1000} // meters
                strokeColor="rgba(16, 185, 129, 0.4)"
                fillColor="rgba(16, 185, 129, 0.08)"
                strokeWidth={2}
                lineDashPattern={[6, 6]}
              />

              {/* Worker active location pin */}
              <Marker
                coordinate={{ latitude: workerLocation.latitude, longitude: workerLocation.longitude }}
                title={language === 'en' ? 'Your Location' : 'آپ کا مقام'}
                description={language === 'en' ? 'Active Coverage Center' : 'کوریج سینٹر'}
              >
                <View style={styles.nativeWorkerMarker}>
                  <View style={styles.workerPinOuter} />
                  <View style={styles.workerPinInner}>
                    <Ionicons name="construct" size={11} color="#fff" />
                  </View>
                </View>
              </Marker>

              {/* Geographical Client Lead pins */}
              {jobPins.map((pin) => {
                const isSelected = selectedPin?.id === pin.id;
                const color = STATUS_COLORS[pin.status];
                return (
                  <Marker
                    key={pin.id}
                    coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                    onPress={() => handleMarkerPress(pin)}
                  >
                    <View style={[styles.nativeJobMarker, isSelected && { transform: [{ scale: 1.15 }] }]}>
                      <View style={[styles.jobPinDot, { backgroundColor: color, borderColor: '#fff', borderWidth: 1.5 }]}>
                        <Ionicons name="person" size={10} color="#fff" />
                      </View>
                    </View>
                  </Marker>
                );
              })}

              {/* Active routing line */}
              {selectedPin && (
                <Polyline
                  coordinates={[
                    { latitude: workerLocation.latitude, longitude: workerLocation.longitude },
                    { latitude: selectedPin.latitude, longitude: selectedPin.longitude },
                  ]}
                  strokeColor={STATUS_COLORS[selectedPin.status]}
                  strokeWidth={2.5}
                  lineDashPattern={[5, 5]}
                />
              )}
            </MapView>
          )
        )}

        {/* Dynamic color code legend */}
        <View style={[styles.mapLegend, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>{language === 'en' ? 'Pending' : 'زیر غور'}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>{language === 'en' ? 'Accepted' : 'قبول شدہ'}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>{language === 'en' ? 'En Route' : 'جاری'}</Text>
          </View>
        </View>
      </View>

      {/* Selected lead detail action sheet */}
      {selectedPin && (
        <View style={[styles.detailPanel, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <View style={styles.detailTop}>
            <View>
              <Text style={[styles.detailClient, { color: colors.text }]}>{selectedPin.clientName}</Text>
              <Text style={[styles.detailService, { color: colors.textMuted }]}>{selectedPin.service}</Text>
            </View>
            <View style={[styles.statusPill, { borderColor: STATUS_COLORS[selectedPin.status] }]}>
              <Text style={[styles.statusPillText, { color: STATUS_COLORS[selectedPin.status] }]}>
                {STATUS_LABELS[selectedPin.status]}
              </Text>
            </View>
          </View>

          <View style={styles.detailActions}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => Alert.alert('Navigation', `Routing path opened to ${selectedPin.clientName}...`)}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.navBtnText}>
                {language === 'en' ? 'Navigate' : 'راستہ'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: colors.border }]}
              onPress={() => Alert.alert('Call', `Connecting call thread to client: ${selectedPin.clientName}...`)}
            >
              <Ionicons name="call-outline" size={16} color={colors.text} />
              <Text style={[styles.callBtnText, { color: colors.text }]}>
                {language === 'en' ? 'Call Client' : 'کال کریں'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => Alert.alert('Job Completed', 'Mark as complete? AI Escrow will release payment to your wallet.')}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
              <Text style={styles.doneBtnText}>
                {language === 'en' ? 'Mark Done' : 'مکمل'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  privacyText: { flex: 1, fontSize: 11, marginRight: 8 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  headerSub: { color: '#10b981', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  radiusSelector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f172a', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e293b',
    paddingHorizontal: 4, paddingVertical: 4,
  },
  radiusBtn: {
    width: 28, height: 28, borderRadius: 6,
    backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center',
  },
  radiusText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginHorizontal: 10 },
  mapViewport: {
    flex: 1, backgroundColor: '#0c0f17',
    position: 'relative', overflow: 'hidden',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04, borderWidth: 0.5, borderColor: '#94a3b8',
  },
  road1: {
    position: 'absolute', width: 6, height: 800,
    backgroundColor: '#1e293b', left: 200, top: -100,
    transform: [{ rotate: '-40deg' }],
  },
  road2: {
    position: 'absolute', width: 5, height: 800,
    backgroundColor: '#1e293b', left: 80, top: -80,
    transform: [{ rotate: '20deg' }],
  },
  coverageCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(16,185,129,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.25)',
    borderStyle: 'dashed',
  },
  workerPin: {
    position: 'absolute', alignItems: 'center',
    marginLeft: -16, marginTop: -16, zIndex: 10,
  },
  workerPinOuter: {
    position: 'absolute', width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.2)',
  },
  workerPinInner: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  workerLabel: {
    position: 'absolute', top: 26,
    backgroundColor: '#10b981', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  workerLabelText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  jobPin: {
    position: 'absolute', alignItems: 'center',
    marginLeft: -14, marginTop: -14, zIndex: 5,
  },
  jobPinDot: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  jobTooltip: {
    position: 'absolute', top: -42,
    backgroundColor: '#0f172a', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, minWidth: 90, alignItems: 'center',
  },
  jobTooltipName: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  jobTooltipStatus: { fontSize: 9, fontWeight: 'bold', marginTop: 1 },
  nativeWorkerMarker: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeJobMarker: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLegend: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 10, borderWidth: 1, borderColor: '#1e293b',
    padding: 10,
    zIndex: 10,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { color: '#94a3b8', fontSize: 10 },
  detailPanel: {
    backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', padding: 20,
  },
  detailTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  detailClient: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  detailService: { color: '#64748b', fontSize: 13, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  statusPillText: { fontSize: 11, fontWeight: 'bold' },
  detailActions: { flexDirection: 'row' },
  navBtn: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', height: 44, borderRadius: 10,
    backgroundColor: '#6366f1', marginRight: 8,
  },
  navBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  callBtn: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', height: 44, borderRadius: 10,
    backgroundColor: '#1e293b', marginRight: 8,
  },
  callBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  doneBtn: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', height: 44, borderRadius: 10,
    backgroundColor: '#10b981',
  },
  doneBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
});
