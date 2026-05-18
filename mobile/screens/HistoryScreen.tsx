import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useTheme } from '../ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

import { API_BASE_URL } from '../config';

interface JobRecord {
  id: string;
  parsed: {
    serviceType: string;
    location: string;
    time: string;
    budget: number;
  };
  providers: any[];
  bid?: {
    action: string;
    agreed_price: number;
    provider_min: number;
    client_budget: number;
  };
  escrow?: {
    escrow_id: string;
    booking_id: string;
    total: number;
    fee: number;
    fee_rate_pct: number;
    net_to_provider: number;
    status: string;
  };
  status: string;
  created_at: string;
}

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, theme } = useTheme();

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // ─── Fetch Booking History from backend SQLite ─────────────────────────────────────
  const fetchHistory = async (showRefresher = false) => {
    if (showRefresher) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }
      const result = await response.json();
      setJobs(result.jobs || []);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Network Error', 'Failed to retrieve booking history. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ─── Status Color Selectors ────────────────────────────────────────────────────────
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MilestoneLocked': return { bg: '#05966920', text: '#34d399' };
      case 'BidPlaced': return { bg: '#3b82f620', text: '#60a5fa' };
      case 'Searching': return { bg: '#eab30820', text: '#fbbf24' };
      default: return { bg: '#262626', text: '#a3a3a3' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MilestoneLocked': return 'Booking Locked';
      case 'BidPlaced': return 'Bid Placed';
      case 'Searching': return 'Matching...';
      default: return status;
    }
  };

  // ─── Dynamic Icon Selector ─────────────────────────────────────────────────────────
  const getCategoryIcon = (service: string) => {
    switch (service) {
      case 'Plumber': return 'water';
      case 'Electrician': return 'flash';
      case 'AC Technician': return 'snow';
      case 'Painter': return 'brush';
      case 'Tutor': return 'book';
      case 'Carpenter': return 'construct';
      default: return 'hammer';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      {/* Screen Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.cardBackground }]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Booking History</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Fetch Loading Indicator */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.primary }]}>Loading secure history directory...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchHistory(true)}
              tintColor="#4f46e5"
            />
          }
        >
          {jobs.map((item) => {
            const { bg, text } = getStatusColor(item.status);
            const totalCost = item.escrow?.total || item.bid?.agreed_price || item.parsed?.budget || 0;

            return (
              <View key={item.id} style={[styles.jobCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.categoryRow}>
                    <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons
                        name={getCategoryIcon(item.parsed?.serviceType) as any}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={[styles.serviceName, { color: colors.text }]}>
                        {item.parsed?.serviceType || 'Informal Job'}
                      </Text>
                      <Text style={[styles.dateStamp, { color: colors.textMuted }]}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[styles.statusText, { color: text }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>

                {/* Meta Row */}
                <View style={[styles.metaRow, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>LOCATION</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>{item.parsed?.location || 'Islamabad'}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>TIME ZONE</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>{item.parsed?.time || 'Flexible'}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaLabel, { color: colors.textMuted }]}>LOCKED VAL</Text>
                    <Text style={[styles.metaValue, { color: colors.success, fontWeight: 'bold' }]}>
                      {totalCost} PKR
                    </Text>
                  </View>
                </View>

                {/* Monospace IDs Panel for milestone tracking */}
                {item.status === 'MilestoneLocked' && item.escrow && (
                  <View style={[styles.receiptBox, { borderTopColor: colors.border }]}>
                    <View style={styles.receiptDetailRow}>
                      <Text style={[styles.receiptDetailLabel, { color: colors.textMuted }]}>Booking ID</Text>
                      <Text style={[styles.receiptDetailValue, { color: colors.text }]}>{item.escrow.booking_id}</Text>
                    </View>
                    <View style={styles.receiptDetailRow}>
                      <Text style={[styles.receiptDetailLabel, { color: colors.textMuted }]}>Escrow Lock ID</Text>
                      <Text style={[styles.receiptDetailValue, { color: colors.text }]}>{item.escrow.escrow_id}</Text>
                    </View>
                  </View>
                )}

              </View>
            );
          })}

          {jobs.length === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="clipboard-outline" size={48} color="#555" />
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySubtitle}>
                Describe a service request in the matching screen to simulate your first booking!
              </Text>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.bookBtnText}>Find a Worker Now</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  jobCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#4f46e510',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceInfo: {
    flexDirection: 'column',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateStamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0d1117',
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#262626',
  },
  metaCol: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12,
    color: '#ffffff',
  },
  receiptBox: {
    marginTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  receiptDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptDetailLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  receiptDetailValue: {
    fontSize: 11,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  emptyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  bookBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
