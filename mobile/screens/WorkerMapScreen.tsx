// KaamGraph / screens/WorkerMapScreen.tsx
// Worker-exclusive: Shows active job coverage zone, client pins, and navigation
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';

const { width } = Dimensions.get('window');

interface JobPin {
  id: string;
  clientName: string;
  service: string;
  status: 'pending' | 'accepted' | 'en_route' | 'completed';
  x: number;
  y: number;
}

const JOB_PINS: JobPin[] = [
  { id: 'j1', clientName: 'Hassan Ali', service: 'AC Tech', status: 'accepted', x: 130, y: 110 },
  { id: 'j2', clientName: 'Zainab M.', service: 'Electrician', status: 'pending', x: 220, y: 170 },
  { id: 'j3', clientName: 'Bilal Khan', service: 'Plumber', status: 'pending', x: 170, y: 240 },
];

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

export default function WorkerMapScreen() {
  const { language, selectedLocationIndex, activeBooking } = useTheme();
  const [selectedPin, setSelectedPin] = useState<JobPin | null>(JOB_PINS[0]);
  const [zoneRadius, setZoneRadius] = useState(2); // km

  const activeSector = ISLAMABAD_SECTORS[selectedLocationIndex];

  // Worker position — center of current sector
  const workerCoords = { x: 160, y: 160 };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'MY COVERAGE ZONE' : 'میرا کوریج زون'}
          </Text>
          <Text style={styles.headerTitle}>{activeSector.name}</Text>
        </View>
        <View style={styles.radiusSelector}>
          <TouchableOpacity
            onPress={() => setZoneRadius(r => Math.max(1, r - 1))}
            style={styles.radiusBtn}
          >
            <Ionicons name="remove" size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.radiusText}>{zoneRadius} km</Text>
          <TouchableOpacity
            onPress={() => setZoneRadius(r => Math.min(5, r + 1))}
            style={styles.radiusBtn}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone Map Canvas */}
      <View style={styles.mapViewport}>
        <View style={styles.mapGrid} />

        {/* Roads */}
        <View style={styles.road1} />
        <View style={styles.road2} />

        {/* Coverage radius circle */}
        <View style={[
          styles.coverageCircle,
          {
            width: zoneRadius * 80,
            height: zoneRadius * 80,
            borderRadius: zoneRadius * 40,
            left: workerCoords.x - (zoneRadius * 40),
            top: workerCoords.y - (zoneRadius * 40),
          }
        ]} />

        {/* Worker pin (green, center) */}
        <View style={[styles.workerPin, { top: workerCoords.y, left: workerCoords.x }]}>
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

        {/* Client job request pins */}
        {JOB_PINS.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          const color = STATUS_COLORS[pin.status];
          // Draw a dashed line from worker to selected job
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
                <View style={[styles.jobTooltip, { borderColor: color }]}>
                  <Text style={styles.jobTooltipName}>{pin.clientName}</Text>
                  <Text style={[styles.jobTooltipStatus, { color }]}>
                    {STATUS_LABELS[pin.status]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Map legend */}
        <View style={styles.mapLegend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>{language === 'en' ? 'Pending' : 'زیر غور'}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
            <Text style={styles.legendText}>{language === 'en' ? 'Accepted' : 'قبول شدہ'}</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>{language === 'en' ? 'En Route' : 'جاری'}</Text>
          </View>
        </View>
      </View>

      {/* Selected job detail panel */}
      {selectedPin && (
        <View style={styles.detailPanel}>
          <View style={styles.detailTop}>
            <View>
              <Text style={styles.detailClient}>{selectedPin.clientName}</Text>
              <Text style={styles.detailService}>{selectedPin.service}</Text>
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
              onPress={() => Alert.alert('Navigation', `Routing to ${selectedPin.clientName}...`)}
            >
              <Ionicons name="navigate" size={16} color="#fff" />
              <Text style={styles.navBtnText}>
                {language === 'en' ? 'Navigate' : 'راستہ'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert('Call', `Calling ${selectedPin.clientName}...`)}
            >
              <Ionicons name="call-outline" size={16} color="#fff" />
              <Text style={styles.callBtnText}>
                {language === 'en' ? 'Call Client' : 'کال کریں'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => Alert.alert('Job Done', 'Mark as complete? Escrow will be released to you.')}
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
  mapLegend: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 10, borderWidth: 1, borderColor: '#1e293b',
    padding: 10,
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
