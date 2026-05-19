// KaamGraph / Mobile / mobile/screens/BidScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bid'>;
type BidRouteProp = RouteProp<RootStackParamList, 'Bid'>;

import { API_BASE_URL } from '../config';

export default function BidScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BidRouteProp>();

  const {
    jobId,
    providerId,
    providerName,
    serviceType,
    clientBudget: initialBudget,
    providerMin: initialMin,
    agreedPrice: initialAgreed,
    action: initialAction,
    reason: initialReason,
  } = route.params;

  const [currentAction, setCurrentAction] = useState(initialAction);
  const [currentAgreedPrice, setCurrentAgreedPrice] = useState(initialAgreed);
  const [currentProviderMin, setCurrentProviderMin] = useState(initialMin);
  const [currentReason, setCurrentReason] = useState(initialReason);
  
  const [counterValue, setCounterValue] = useState('');
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [isEscrowLocking, setIsEscrowLocking] = useState(false);

  // ─── Accept Offer (Locks Payment Milestone in EscrowAgent) ──────────────────────
  const acceptOffer = async () => {
    setIsEscrowLocking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/escrow/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          provider_id: providerId,
          agreed_price: Number(currentAgreedPrice),
        }),
      });

      if (!response.ok) {
        throw new Error(`Escrow locking failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setIsEscrowLocking(false);

      // Route to Confirm Screen with Escrow Receipt Details
      navigation.navigate('Confirm', {
        jobId,
        bookingId: result.escrow?.booking_id,
        escrowId: result.escrow?.escrow_id,
        total: result.escrow?.total,
        fee: result.escrow?.fee,
        netToProvider: result.escrow?.net_to_provider,
        providerName,
        serviceType,
        providerSms: result.followup?.provider_sms || '',
      });

    } catch (err: any) {
      setIsEscrowLocking(false);
      Alert.alert('Payment Lock Failed', err?.message || 'Could not verify milestone with Escrow.');
    }
  };

  // ─── Submit Counter-Offer (Re-negotiate with BiddingAgent) ───────────────────────
  const submitCounterOffer = async () => {
    const enteredVal = Number(counterValue);
    if (!counterValue.trim() || isNaN(enteredVal) || enteredVal <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid numeric counter offer.');
      return;
    }

    setIsNegotiating(true);
    setIsCounterOpen(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          provider_id: providerId,
          budget: enteredVal,
        }),
      });

      if (!response.ok) {
        throw new Error(`Re-negotiation failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setIsNegotiating(false);
      
      // Update Bidding Board state dynamically with BiddingAgent counter decision
      setCurrentAction(result.bid?.action);
      setCurrentAgreedPrice(result.bid?.agreed_price);
      setCurrentProviderMin(result.bid?.provider_min || result.bid?.agreed_price);
      setCurrentReason(result.trace ? result.trace.join('\n') : '');
      setCounterValue('');

      if (result.bid?.action === 'REJECT') {
        Alert.alert('Rejected', 'The Bidding Agent rejected the offer because it falls below the minimum costs.');
      } else {
        Alert.alert('New Offer Calculated', `The Bidding Agent calculated a new price: ${result.bid?.agreed_price} PKR.`);
      }

    } catch (err: any) {
      setIsNegotiating(false);
      Alert.alert('Counter Failed', err?.message || 'Could not process the counter bid.');
    }
  };

  // Dynamic ZOPA Probability and Track Width calculations
  const parsedPrice = Number(counterValue) || Number(currentAgreedPrice);
  const providerMin = Number(currentProviderMin);
  const clientBudget = Number(initialBudget); // The initial job budget

  let zopaStatus = 'HIGH';
  let zopaLabel = '🟢 HIGH PROBABILITY (Inside ZOPA range)';
  let zopaColor = '#10b981';
  let sliderPercentage = 50;

  if (parsedPrice < providerMin) {
    zopaStatus = 'LOW';
    zopaLabel = '🔴 POOR PROBABILITY (Below worker minimum target)';
    zopaColor = '#f43f5e';
    sliderPercentage = Math.max(10, Math.min(40, (parsedPrice / providerMin) * 35));
  } else if (parsedPrice > clientBudget) {
    zopaStatus = 'MEDIUM';
    zopaLabel = '🟡 MEDIUM PROBABILITY (Client representative will counter-negotiate)';
    zopaColor = '#f59e0b';
    sliderPercentage = Math.max(60, Math.min(95, 50 + ((parsedPrice - clientBudget) / clientBudget) * 45));
  } else {
    // Settle perfectly inside ZOPA
    zopaStatus = 'HIGH';
    zopaLabel = '🟢 HIGH PROBABILITY (Overlap inside active ZOPA zone)';
    zopaColor = '#10b981';
    
    // Settle standard percentage
    const zopaSpan = clientBudget - providerMin || 1;
    sliderPercentage = 40 + ((parsedPrice - providerMin) / zopaSpan) * 20;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bidding Board</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Loader Overlay */}
        {(isNegotiating || isEscrowLocking) && (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text style={styles.loaderText}>
              {isEscrowLocking ? 'Locking Milestone Escrow...' : 'Bidding Agent negotiating counter-offer...'}
            </Text>
          </View>
        )}

        {!isNegotiating && !isEscrowLocking && (
          <>
            {/* Candidate Summary Panel */}
            <View style={styles.providerInfoCard}>
              <View style={styles.avatarWrapper}>
                <Ionicons name="person-circle" size={48} color="#4f46e5" />
              </View>
              <View style={styles.nameWrapper}>
                <Text style={styles.providerName}>{providerName}</Text>
                <Text style={styles.providerType}>{serviceType} Provider</Text>
              </View>
              <View style={styles.jobIdBadge}>
                <Text style={styles.jobIdText}>{jobId.slice(0, 8)}</Text>
              </View>
            </View>

            {/* Bidding Decision Board */}
            <View style={styles.decisionCard}>
              <Text style={styles.sectionHeader}>PROPOSAL STATUS</Text>
              
              {currentAction === 'ACCEPT' && (
                <View style={[styles.statusBanner, { backgroundColor: '#05966920', borderColor: '#059669' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  <Text style={[styles.statusText, { color: '#34d399' }]}>DIRECT MATCH SUCCESS</Text>
                </View>
              )}

              {currentAction === 'COUNTER' && (
                <View style={[styles.statusBanner, { backgroundColor: '#eab30820', borderColor: '#eab308' }]}>
                  <Ionicons name="git-compare" size={20} color="#eab308" />
                  <Text style={[styles.statusText, { color: '#fbbf24' }]}>COUNTER-OFFER IN PROCESS</Text>
                </View>
              )}

              {currentAction === 'REJECT' && (
                <View style={[styles.statusBanner, { backgroundColor: '#dc262620', borderColor: '#dc2626' }]}>
                  <Ionicons name="close-circle" size={20} color="#dc2626" />
                  <Text style={[styles.statusText, { color: '#f87171' }]}>OFFER REJECTED BY AGENT</Text>
                </View>
              )}

              {/* Price Tag Board */}
              <View style={styles.priceRow}>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>Agreed / Proposed</Text>
                  <Text style={[styles.priceValue, { color: currentAction === 'REJECT' ? '#f87171' : '#34d399' }]}>{currentAgreedPrice} PKR</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>Provider Cost Min</Text>
                  <Text style={styles.priceValue}>{currentProviderMin} PKR</Text>
                </View>
              </View>

              {/* InDrive Interactive Price Progress Slider Mockup */}
              <View style={styles.sliderContainer}>
                <View style={styles.track} />
                <View style={[styles.activeTrack, { width: `${sliderPercentage}%`, backgroundColor: zopaColor }]} />
                <View style={[styles.thumb, { left: `${sliderPercentage - 3}%` }]} />
                <View style={styles.scaleLabels}>
                  <Text style={styles.scaleText}>Low Cost Limit</Text>
                  <Text style={[styles.scaleText, { color: zopaColor, fontWeight: 'bold' }]}>ZOPA Zone</Text>
                  <Text style={styles.scaleText}>Client Budget</Text>
                </View>
              </View>

              <Text style={{ fontSize: 10, fontWeight: 'bold', color: zopaColor, textAlign: 'center', marginTop: 12 }}>
                {zopaLabel}
              </Text>
            </View>

            {route.params.priceBreakdown ? (
              <View style={styles.breakdownCard}>
                <Text style={styles.breakdownTitle}>PRICE BREAKDOWN</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base Service Cost</Text>
                  <Text style={styles.breakdownValue}>{route.params.priceBreakdown.base_cost} PKR</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Transport Cost</Text>
                  <Text style={styles.breakdownValue}>{route.params.priceBreakdown.transport_cost} PKR</Text>
                </View>
                {route.params.priceBreakdown.urgency_surcharge > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Urgency Surcharge</Text>
                    <Text style={[styles.breakdownValue, { color: '#f59e0b' }]}>
                      +{route.params.priceBreakdown.urgency_surcharge} PKR
                    </Text>
                  </View>
                )}
                {route.params.priceBreakdown.complexity_surcharge > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Complexity Surcharge</Text>
                    <Text style={[styles.breakdownValue, { color: '#f59e0b' }]}>
                      +{route.params.priceBreakdown.complexity_surcharge} PKR
                    </Text>
                  </View>
                )}
                <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: '#333', marginTop: 8, paddingTop: 8 }]}>
                  <Text style={[styles.breakdownLabel, { color: '#fff', fontWeight: 'bold' }]}>Provider Minimum</Text>
                  <Text style={[styles.breakdownValue, { color: '#34d399', fontWeight: 'bold' }]}>
                    {route.params.priceBreakdown.provider_minimum} PKR
                  </Text>
                </View>
                <Text style={styles.breakdownNote}>
                  {route.params.bidReasoning}
                </Text>
              </View>
            ) : null}

            {/* Interactive Custom Counter Input */}
            {isCounterOpen && (
              <View style={styles.counterBox}>
                <Text style={styles.counterTitle}>Enter your counter budget</Text>
                <View style={styles.counterInputWrapper}>
                  <TextInput
                    style={styles.counterInput}
                    placeholder="e.g. 1700"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={counterValue}
                    onChangeText={setCounterValue}
                    autoFocus
                  />
                  <Text style={styles.pkrLabel}>PKR</Text>
                </View>
                <View style={styles.counterBtnRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCounterOpen(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.submitBtn} onPress={submitCounterOffer}>
                    <Text style={styles.submitBtnText}>Submit Counter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bidding Agent Trace Logger Console */}
            {currentReason ? (
              <View style={styles.terminalCard}>
                <View style={styles.terminalHeader}>
                  <Ionicons name="logo-android" size={14} color="#fbbf24" />
                  <Text style={styles.terminalTitle}>BiddingAgent Reasoning</Text>
                </View>
                <ScrollView style={styles.terminalContent} nestedScrollEnabled>
                  <Text style={styles.terminalText}>{currentReason}</Text>
                </ScrollView>
              </View>
            ) : null}

            {/* Action Buttons inspired by InDrive */}
            <View style={styles.actionButtonRow}>
              {currentAction !== 'REJECT' && (
                <TouchableOpacity style={styles.acceptActionBtn} onPress={acceptOffer}>
                  <Ionicons name="wallet" size={18} color="#0f0f0f" />
                  <Text style={styles.acceptActionText}>Lock & Book Offer</Text>
                </TouchableOpacity>
              )}

              {currentAction === 'COUNTER' && !isCounterOpen && (
                <TouchableOpacity style={styles.counterActionBtn} onPress={() => setIsCounterOpen(true)}>
                  <Ionicons name="cash-outline" size={18} color="#ffffff" />
                  <Text style={styles.counterActionText}>Counter Offer</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.rejectActionBtn,
                  currentAction === 'REJECT' && { width: '100%', backgroundColor: '#dc2626' }
                ]}
                onPress={() => {
                  Alert.alert('Negotiation Canceled', 'Bidding board canceled. Routing back to candidate list.');
                  navigation.goBack();
                }}
              >
                <Ionicons name="close" size={18} color="#ffffff" />
                <Text style={styles.rejectActionText}>{currentAction === 'REJECT' ? 'Close & Find Another Worker' : 'Reject & Go Back'}</Text>
              </TouchableOpacity>
            </View>
          </>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
  },
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loaderText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  providerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  nameWrapper: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  providerType: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  jobIdBadge: {
    backgroundColor: '#0d1117',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  jobIdText: {
    color: '#9ca3af',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  decisionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 1.0,
    marginBottom: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0d1117',
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#262626',
    marginBottom: 16,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#333333',
  },
  sliderContainer: {
    marginTop: 10,
  },
  track: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    position: 'relative',
  },
  activeTrack: {
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  thumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#fbbf24',
    position: 'absolute',
    top: -4,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  counterBox: {
    backgroundColor: '#1c1c24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eab308',
    padding: 16,
    marginBottom: 16,
  },
  counterTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  counterInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    borderRadius: 10,
    borderColor: '#333333',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  counterInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    height: 44,
  },
  pkrLabel: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  counterBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262626',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eab308',
  },
  submitBtnText: {
    color: '#0f0f0f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  terminalCard: {
    backgroundColor: '#0c0c0e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    marginBottom: 20,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
    paddingBottom: 8,
    marginBottom: 8,
  },
  terminalTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginLeft: 6,
  },
  terminalContent: {
    maxHeight: 120,
  },
  terminalText: {
    color: '#d1d5db',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  actionButtonRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 30,
  },
  acceptActionBtn: {
    backgroundColor: '#fbbf24', // Indrive golden
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  acceptActionText: {
    color: '#0f0f0f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  counterActionBtn: {
    backgroundColor: '#2b2d31',
    borderWidth: 1,
    borderColor: '#444',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  counterActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectActionBtn: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#2d2d2d',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rejectActionText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  breakdownCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 1.0,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  breakdownNote: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
});
