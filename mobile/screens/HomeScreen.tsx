import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── TypeScript Type Definitions (Matching Backend Schemas Exactly) ─────────────────

export interface Provider {
  id: string;
  name: string;
  service_type: string;
  rating: number;
  lat: number;
  lng: number;
  base_cost: number;
  is_available: boolean;
}

export interface EnrichedProvider extends Provider {
  distance_km: number;
  score?: number;
}

export interface Bid {
  action: 'ACCEPT' | 'COUNTER' | 'REJECT' | 'ERROR';
  agreed_price: number | null;
  provider_min: number;
  client_budget: number;
  reason?: string;
}

export interface Escrow {
  escrow_id: string;
  booking_id: string;
  total: number;
  fee: number;
  fee_rate_pct: number;
  net_to_provider: number;
  status: string;
  locked_at: string;
}

export interface Followup {
  client_sms: string;
  provider_sms: string;
  rating_reminder: string;
  reminder_scheduled_for: string;
}

export interface AgentTraceEntry {
  agent: 'LinguisticAgent' | 'GeoAgent' | 'BiddingAgent' | 'EscrowAgent' | 'FollowUpAgent' | 'System';
  status: 'success' | 'error' | 'skipped';
  timestamp: string;
  output?: any;
  message?: string;
  error?: string;
  fallback?: any;
}

export interface PipelineResult {
  job_id: string;
  pipeline_status: 'success' | 'partial';
  parsed_request: {
    serviceType: string;
    location: string;
    time: string;
    budget: number;
  };
  providers: EnrichedProvider[];
  bid: Bid;
  escrow: Escrow;
  followup: Followup;
  booking_confirmed: boolean;
  agent_trace: AgentTraceEntry[];
}

export default function HomeScreen() {
  // ─── Configuration & State ──────────────────────────────────────────────────────────
  const [apiBaseUrl, setApiBaseUrl] = useState('http://10.0.2.2:8000'); // Default to Android Emulator localhost; toggleable
  const [showConfig, setShowConfig] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // ─── Fetch All Providers on Mount ───────────────────────────────────────────────────
  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    setProvidersError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/providers`);
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.providers)) {
        setProviders(data.providers);
      } else {
        throw new Error('Invalid data format returned by server');
      }
    } catch (err: any) {
      setProvidersError(err?.message || 'Failed to connect to backend api');
    } finally {
      setIsLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [apiBaseUrl]);

  // ─── Run Multi-Agent Matching Pipeline ──────────────────────────────────────────────
  const runAgentPipeline = async () => {
    if (!requestText.trim()) {
      Alert.alert('Empty Request', 'Please describe the gig you want to match providers for.');
      return;
    }

    setIsMatching(true);
    setPipelineResult(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: requestText }),
      });

      if (!response.ok) {
        throw new Error(`Matching failed. Server returned status: ${response.status}`);
      }

      const result: PipelineResult = await response.json();
      setPipelineResult(result);
      
      // Proactively refresh provider directory in case availability changed
      fetchProviders();
    } catch (err: any) {
      Alert.alert('Pipeline Error', err?.message || 'Failed to run matching pipeline.');
    } finally {
      setIsMatching(false);
    }
  };

  // ─── Helper: Get Agent Icon ────────────────────────────────────────────────────────
  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'LinguisticAgent': return 'chatbubble-ellipses-outline';
      case 'GeoAgent': return 'location-outline';
      case 'BiddingAgent': return 'cash-outline';
      case 'EscrowAgent': return 'lock-closed-outline';
      case 'FollowUpAgent': return 'mail-unread-outline';
      default: return 'cog-outline';
    }
  };

  // ─── Helper: Get Trace Badge Color ────────────────────────────────────────────────
  const getTraceBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981'; // Emerald
      case 'error': return '#ef4444'; // Red
      case 'skipped': return '#f59e0b'; // Amber
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f12" />

      {/* Header section with Premium Dark Theme branding */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerSubtitle}>Pakistan's 1st Agentic</Text>
          <Text style={styles.headerTitle}>GigConnect PK</Text>
        </View>
        <TouchableOpacity 
          style={styles.configBtn} 
          onPress={() => setShowConfig(!showConfig)}
        >
          <Ionicons name="construct-outline" size={22} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Slide-down API Configuration Panel */}
      {showConfig && (
        <View style={styles.configPanel}>
          <Text style={styles.configPanelTitle}>Backend Connection Settings</Text>
          <View style={styles.configInputWrapper}>
            <TextInput
              style={styles.configInput}
              value={apiBaseUrl}
              onChangeText={setApiBaseUrl}
              placeholder="e.g., http://localhost:8000"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.configRefreshBtn} onPress={fetchProviders}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.configHelpText}>
            Use 'http://10.0.2.2:8000' for Android emulator, or your system's LAN IP address.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1: Natural Language Matching Console */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hire with AI Agents</Text>
          <Text style={styles.cardDescription}>
            Type what you need in Roman Urdu, Urdu, or English (e.g. "Bijli wala chahye Lahore mein budget 1500")
          </Text>
          
          <View style={styles.inputWrapper}>
            <Ionicons name="sparkles" size={20} color="#10b981" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Kiya kaam karwana chahte hain?..."
              placeholderTextColor="#6b7280"
              value={requestText}
              onChangeText={setRequestText}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.btnMatch, isMatching && styles.btnDisabled]}
            onPress={runAgentPipeline}
            disabled={isMatching}
          >
            {isMatching ? (
              <ActivityIndicator color="#0f0f12" size="small" />
            ) : (
              <>
                <Text style={styles.btnMatchText}>Trigger 5-Agent Pipeline</Text>
                <Ionicons name="arrow-forward" size={18} color="#0f0f12" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* SECTION 2: Pipeline Live Execution Results */}
        {isMatching && (
          <View style={[styles.card, styles.matchingLoaderCard]}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loaderText}>Agents are negotiating in the background...</Text>
          </View>
        )}

        {pipelineResult && (
          <View style={styles.card}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultBadge}>Booking Confirmed 🎉</Text>
                <Text style={styles.resultJobId}>ID: {pipelineResult.job_id}</Text>
              </View>
              <View style={styles.resultPriceWrapper}>
                <Text style={styles.resultPriceLabel}>Agreed Price</Text>
                <Text style={styles.resultPrice}>
                  {pipelineResult.bid.agreed_price ? `${pipelineResult.bid.agreed_price} PKR` : 'REJECTED'}
                </Text>
              </View>
            </View>

            {/* Negotiation Output */}
            {pipelineResult.booking_confirmed && (
              <View style={styles.escrowDetails}>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>Escrow ID:</Text>
                  <Text style={styles.escrowValue}>{pipelineResult.escrow.escrow_id}</Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>Status:</Text>
                  <Text style={[styles.escrowValue, { color: '#10b981', fontWeight: 'bold' }]}>
                    {pipelineResult.escrow.status}
                  </Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>Fee (9.99%):</Text>
                  <Text style={styles.escrowValue}>{pipelineResult.escrow.fee} PKR</Text>
                </View>
                <View style={styles.escrowRow}>
                  <Text style={styles.escrowLabel}>Net to Provider:</Text>
                  <Text style={styles.escrowValue}>{pipelineResult.escrow.net_to_provider} PKR</Text>
                </View>
              </View>
            )}

            {/* Follow-up SMS Previews */}
            {pipelineResult.booking_confirmed && pipelineResult.followup && (
              <View style={styles.smsPreviewBox}>
                <Text style={styles.smsBoxTitle}>🔔 Provider Dispatch SMS:</Text>
                <Text style={styles.smsBoxText}>{pipelineResult.followup.provider_sms}</Text>
              </View>
            )}

            {/* Agent Trace Timeline */}
            <Text style={styles.timelineTitle}>5-Agent Pipeline Execution Trace</Text>
            <View style={styles.timeline}>
              {pipelineResult.agent_trace.map((entry, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineIconWrapper}>
                    <View style={[styles.timelineLine, index === pipelineResult.agent_trace.length - 1 && styles.hideLine]} />
                    <View style={[styles.timelineIconBg, { borderColor: getTraceBadgeColor(entry.status) }]}>
                      <Ionicons name={getAgentIcon(entry.agent) as any} size={16} color={getTraceBadgeColor(entry.status)} />
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineContentHeader}>
                      <Text style={styles.timelineAgentName}>{entry.agent}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getTraceBadgeColor(entry.status) + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: getTraceBadgeColor(entry.status) }]}>
                          {entry.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.timelineMessage}>{entry.message || entry.error}</Text>
                    <Text style={styles.timelineTime}>{new Date(entry.timestamp).toLocaleTimeString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SECTION 3: Provider Directory */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Providers Nearby</Text>
          <TouchableOpacity onPress={fetchProviders} style={styles.refreshWrapper}>
            <Ionicons name="sync-outline" size={16} color="#10b981" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {isLoadingProviders ? (
          <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 30 }} />
        ) : providersError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={36} color="#ef4444" />
            <Text style={styles.errorText}>{providersError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchProviders}>
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : providers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={40} color="#374151" />
            <Text style={styles.emptyText}>No registered service providers found.</Text>
          </View>
        ) : (
          <FlatList
            data={providers}
            scrollEnabled={false} // since it's nested in ScrollView
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.providerCard} onPress={() => setSelectedProvider(item)}>
                <View style={styles.providerHeader}>
                  <View>
                    <Text style={styles.providerName}>{item.name}</Text>
                    <Text style={styles.providerService}>{item.service_type}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <View style={styles.providerFooter}>
                  <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={14} color="#10b981" />
                    <Text style={styles.infoLabel}>Base: {item.base_cost} PKR</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: item.is_available ? '#10b981' : '#ef4444' }]}>
                    <Text style={styles.statusLabel}>{item.is_available ? 'Available' : 'Busy'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      {/* DETAIL MODAL: Single Provider details */}
      <Modal
        visible={!!selectedProvider}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedProvider(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProvider && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedProvider.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedProvider(null)}>
                    <Ionicons name="close-circle" size={26} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Service Domain:</Text>
                    <Text style={styles.modalMetaValue}>{selectedProvider.service_type}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Rating Quality:</Text>
                    <Text style={styles.modalMetaValue}>⭐ {selectedProvider.rating.toFixed(1)} / 5.0</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Base Rate:</Text>
                    <Text style={styles.modalMetaValue}>{selectedProvider.base_cost} PKR</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Coordinates:</Text>
                    <Text style={styles.modalMetaValue}>Lat: {selectedProvider.lat}, Lng: {selectedProvider.lng}</Text>
                  </View>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Status:</Text>
                    <Text style={[styles.modalMetaValue, { color: selectedProvider.is_available ? '#10b981' : '#ef4444', fontWeight: 'bold' }]}>
                      {selectedProvider.is_available ? 'Active & Available' : 'Currently Engaged'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Custom Premium StyleSheet (Dark theme aesthetics matching v4.0 design systems) ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f12', // Premium deep dark background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e24',
  },
  headerInfo: {
    flexDirection: 'column',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10b981', // Emerald theme green
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '800',
  },
  configBtn: {
    padding: 8,
    backgroundColor: '#1a1a24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d2d3a',
  },
  configPanel: {
    backgroundColor: '#181822',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d3a',
  },
  configPanelTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 8,
  },
  configInputWrapper: {
    flexDirection: 'row',
  },
  configInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#111118',
    borderColor: '#2d2d3a',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  configRefreshBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  configHelpText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#181822',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#272733',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 14,
    lineHeight: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#0f0f15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d2d3e',
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  inputIcon: {
    marginTop: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 80,
    color: '#ffffff',
    fontSize: 14,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  btnMatch: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#065f46',
  },
  btnMatchText: {
    color: '#0f0f12',
    fontSize: 15,
    fontWeight: '800',
  },
  matchingLoaderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loaderText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d3a',
    paddingBottom: 12,
    marginBottom: 12,
  },
  resultBadge: {
    backgroundColor: '#065f46',
    color: '#34d399',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  resultJobId: {
    color: '#9ca3af',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  resultPriceWrapper: {
    alignItems: 'flex-end',
  },
  resultPriceLabel: {
    color: '#9ca3af',
    fontSize: 11,
  },
  resultPrice: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: '900',
  },
  escrowDetails: {
    backgroundColor: '#0f0f15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#22222d',
  },
  escrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  escrowLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  escrowValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  smsPreviewBox: {
    backgroundColor: '#13201a',
    borderRadius: 10,
    borderColor: '#065f46',
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
  },
  smsBoxTitle: {
    fontSize: 12,
    color: '#34d399',
    fontWeight: '700',
    marginBottom: 4,
  },
  smsBoxText: {
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconWrapper: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    backgroundColor: '#2d2d3a',
    position: 'absolute',
    top: 24,
    bottom: -16,
  },
  hideLine: {
    backgroundColor: 'transparent',
  },
  timelineIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#181822',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#0f0f15',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#22222e',
  },
  timelineContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineAgentName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  timelineMessage: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
  timelineTime: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  refreshWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  providerCard: {
    backgroundColor: '#181822',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#22222f',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  providerService: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b1d0a',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderColor: '#f59e0b',
    borderWidth: 0.5,
  },
  ratingText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 4,
  },
  statusDot: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#201315',
    borderColor: '#991b1b',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 8,
  },
  retryBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#181822',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2d2d3a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d3a',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalBody: {
    paddingBottom: 20,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalMetaLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modalMetaValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
