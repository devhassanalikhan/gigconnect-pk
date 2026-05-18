import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Providers'>;
type ProvidersRouteProp = RouteProp<RootStackParamList, 'Providers'>;

import { API_BASE_URL } from '../config';

export default function ProvidersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProvidersRouteProp>();

  const params = route.params || {
    serviceType: 'Service',
    budget: 2000,
    location: 'Islamabad',
    time: 'flexible',
    jobId: 'JOB-000000',
    providersList: [],
  };

  const {
    serviceType,
    budget,
    location,
    time,
    jobId,
    providersList = [],
  } = params;

  const [isLoading, setIsLoading] = useState(false);

  // ─── Trigger BiddingAgent on Server for Selected Provider ──────────────────────────
  const selectProviderAndNegotiate = async (providerId: string, providerName: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          provider_id: providerId,
          budget: Number(budget),
        }),
      });

      if (!response.ok) {
        throw new Error(`Bidding request failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setIsLoading(false);

      // Navigate to Bidding Screen passing the bidding response
      navigation.navigate('Bid', {
        jobId,
        providerId,
        providerName,
        serviceType,
        clientBudget: Number(budget),
        providerMin: result.bid?.provider_min || result.bid?.agreed_price || 0,
        agreedPrice: result.bid?.agreed_price || 0,
        action: result.bid?.action || 'COUNTER',
        reason: result.trace ? result.trace.join('\n') : '',
      });

    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Negotiation Failed', err?.message || 'Could not contact the Bidding Agent.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Matching Candidates</Text>
          <Text style={styles.headerSubtitle}>Job ID: {jobId}</Text>
        </View>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Matching Meta Summary */}
        <View style={styles.metaCard}>
          <View style={styles.metaBadgeRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="location-sharp" size={12} color="#4f46e5" />
              <Text style={styles.metaBadgeText}>{location}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="cash-sharp" size={12} color="#059669" />
              <Text style={styles.metaBadgeText}>{budget} PKR</Text>
            </View>
            <View style={styles.metaBadge}>
              <Ionicons name="time-sharp" size={12} color="#fbbf24" />
              <Text style={styles.metaBadgeText}>{time}</Text>
            </View>
          </View>
          <Text style={styles.metaText}>
            Ranked based on Geo-score: <Text style={styles.boldText}>(50% Distance + 50% Quality Rating)</Text>
          </Text>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loaderText}>Dispatching BiddingAgent for negotiation...</Text>
          </View>
        )}

        {/* Candidate List */}
        {!isLoading && providersList.map((item, index) => (
          <View key={item.id} style={styles.providerCard}>
            {/* Top Rank Badge */}
            {index === 0 && (
              <View style={styles.rankBadge}>
                <Ionicons name="trophy" size={10} color="#0f0f0f" />
                <Text style={styles.rankBadgeText}>BEST MATCH</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <View style={styles.nameSection}>
                <Text style={styles.providerName}>{item.name}</Text>
                <Text style={styles.providerType}>{item.service_type}</Text>
              </View>
              <View style={styles.scoreSection}>
                <Text style={styles.scoreLabel}>Geo Score</Text>
                <Text style={styles.scoreValue}>{(item.score * 100).toFixed(0)}%</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="star" size={14} color="#eab308" />
                <Text style={styles.statValue}>{item.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              
              <View style={styles.statBox}>
                <Ionicons name="navigate-outline" size={14} color="#60a5fa" />
                <Text style={styles.statValue}>{item.distance_km.toFixed(1)} km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="wallet-outline" size={14} color="#34d399" />
                <Text style={styles.statValue}>{item.base_cost} PKR</Text>
                <Text style={styles.statLabel}>Base Cost</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => selectProviderAndNegotiate(item.id, item.name)}
            >
              <Text style={styles.bookBtnText}>Select & Negotiate Bid</Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        ))}

        {providersList.length === 0 && !isLoading && (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
            <Text style={styles.emptyText}>No available candidates found matching the criteria.</Text>
          </View>
        )}

      </ScrollView>
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
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  scrollContent: {
    padding: 16,
  },
  metaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262626',
  },
  metaBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  boldText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loaderText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  providerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  rankBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fbbf24', // Hackathon gold
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadgeText: {
    color: '#0f0f0f',
    fontSize: 8,
    fontWeight: '900',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameSection: {
    flex: 1,
  },
  providerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  providerType: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreSection: {
    alignItems: 'flex-end',
    marginRight: 80, // Space for rank badge if active
  },
  scoreLabel: {
    fontSize: 9,
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669', // Emerald success green
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0d1117',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#262626',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  bookBtn: {
    backgroundColor: '#4f46e5',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
