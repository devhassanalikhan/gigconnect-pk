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
import { useTheme } from '../ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bid'>;
type BidRouteProp = RouteProp<RootStackParamList, 'Bid'>;

import { API_BASE_URL, fetchWithTimeout, USE_MOCK } from '../config';
import { lockEscrowMock, submitBidMock } from '../mock/mockApi';

export default function BidScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BidRouteProp>();
  const { colors, theme } = useTheme();
  const styles = getStyles(colors);

  const {
    jobId = '',
    providerId = '',
    providerName = '',
    serviceType = '',
    clientBudget: initialBudget = 0,
    providerMin: initialMin = 0,
    agreedPrice: initialAgreed = 0,
    action: initialAction = '',
    reason: initialReason = '',
  } = route.params || {};

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
      let result: any;

      if (USE_MOCK) {
        result = await lockEscrowMock(jobId, providerId, Number(currentAgreedPrice));
      } else {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/escrow/lock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: jobId,
            provider_id: providerId,
            agreed_price: Number(currentAgreedPrice),
          }),
        }, 10000); // 10 second timeout

        if (!response.ok) {
          throw new Error(`Escrow locking failed with status: ${response.status}`);
        }

        result = await response.json();
      }

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
      let result: any;

      if (USE_MOCK) {
        result = await submitBidMock(jobId, providerId, enteredVal);
      } else {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/bid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: jobId,
            provider_id: providerId,
            budget: enteredVal,
          }),
        }, 10000); // 10 second timeout

        if (!response.ok) {
          throw new Error(`Re-negotiation failed with status: ${response.status}`);
        }

        result = await response.json();
      }

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bidding Board</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Loader Overlay */}
        {(isNegotiating || isEscrowLocking) && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={[styles.loaderText, { color: colors.primary }]}>
              {isEscrowLocking ? 'Locking Milestone Escrow...' : 'Bidding Agent negotiating counter-offer...'}
            </Text>
          </View>
        )}

        {!isNegotiating && !isEscrowLocking && (
          <>
            {/* Candidate Summary Panel */}
            <View style={[styles.providerMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.avatarWrapper}>
                <Ionicons name="person-circle" size={56} color="#6366f1" />
              </View>
              <View style={styles.nameWrapper}>
                <Text style={[styles.providerName, { color: colors.text }]}>{providerName}</Text>
                <Text style={[styles.providerType, { color: colors.primary }]}>{serviceType} Provider</Text>
              </View>
              <View style={[styles.jobIdBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                <Text style={[styles.jobIdText, { color: colors.primary }]}>#{jobId.slice(0, 6)}</Text>
              </View>
            </View>

            {/* Bidding Decision Board */}
            <View style={[styles.decisionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.sectionHeader, { color: colors.primary }]}>PROPOSAL STATUS</Text>
              
              {currentAction === 'ACCEPT' && (
                <View style={[styles.statusBanner, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={[styles.statusText, { color: '#10b981' }]}>DIRECT MATCH SUCCESS</Text>
                </View>
              )}

              {currentAction === 'COUNTER' && (
                <View style={[styles.statusBanner, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#f59e0b' }]}>
                  <Ionicons name="git-compare" size={20} color="#f59e0b" />
                  <Text style={[styles.statusText, { color: '#f59e0b' }]}>COUNTER-OFFER IN PROCESS</Text>
                </View>
              )}

              {currentAction === 'REJECT' && (
                <View style={[styles.statusBanner, { backgroundColor: 'rgba(225, 29, 72, 0.1)', borderColor: '#e11d48' }]}>
                  <Ionicons name="close-circle" size={20} color="#e11d48" />
                  <Text style={[styles.statusText, { color: '#e11d48' }]}>OFFER REJECTED BY AGENT</Text>
                </View>
              )}

              {/* Price Tag Board */}
              <View style={[styles.priceRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.priceColumn}>
                  <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Agreed / Proposed</Text>
                  <Text style={[styles.priceValue, { color: currentAction === 'REJECT' ? colors.danger : colors.success }]}>{currentAgreedPrice} PKR</Text>
                </View>
                <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                <View style={styles.priceColumn}>
                  <Text style={[styles.priceLabel, { color: colors.textMuted }]}>Provider Cost Min</Text>
                  <Text style={[styles.priceValue, { color: colors.text }]}>{currentProviderMin} PKR</Text>
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
              <View style={[styles.breakdownCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.breakdownTitle, { color: colors.primary }]}>PRICE BREAKDOWN</Text>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Base Service Cost</Text>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>{route.params.priceBreakdown.base_cost} PKR</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Transport Cost</Text>
                  <Text style={[styles.breakdownValue, { color: colors.text }]}>{route.params.priceBreakdown.transport_cost} PKR</Text>
                </View>
                {route.params.priceBreakdown.urgency_surcharge > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Urgency Surcharge</Text>
                    <Text style={[styles.breakdownValue, { color: colors.warning }]}>
                      +{route.params.priceBreakdown.urgency_surcharge} PKR
                    </Text>
                  </View>
                )}
                {route.params.priceBreakdown.complexity_surcharge > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Complexity Surcharge</Text>
                    <Text style={[styles.breakdownValue, { color: colors.warning }]}>
                      +{route.params.priceBreakdown.complexity_surcharge} PKR
                    </Text>
                  </View>
                )}
                <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 }]}>
                  <Text style={[styles.breakdownLabel, { color: colors.text, fontWeight: 'bold' }]}>Provider Minimum</Text>
                  <Text style={[styles.breakdownValue, { color: colors.success, fontWeight: 'bold' }]}>
                    {route.params.priceBreakdown.provider_minimum} PKR
                  </Text>
                </View>
                <Text style={[styles.breakdownNote, { color: colors.textMuted }]}>
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
              <View style={[styles.terminalCard, { backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: colors.border }]}>
                <View style={[styles.terminalHeader, { borderBottomColor: colors.border }]}>
                  <Ionicons name="logo-android" size={14} color={colors.primary} />
                  <Text style={[styles.terminalTitle, { color: colors.primary }]}>BiddingAgent Reasoning</Text>
                </View>
                <ScrollView style={styles.terminalContent} nestedScrollEnabled>
                  <Text style={[styles.terminalText, { color: colors.text }]}>{currentReason}</Text>
                </ScrollView>
              </View>
            ) : null}

            {/* Action Buttons inspired by InDrive */}
            <View style={styles.actionButtonRow}>
              {currentAction !== 'REJECT' && (
                <TouchableOpacity style={styles.acceptActionBtn} onPress={acceptOffer}>
                  <Ionicons name="wallet" size={18} color="#ffffff" />
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

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loaderText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  providerMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
    color: colors.text,
  },
  providerType: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  jobIdBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  jobIdText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  decisionCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.15)',
      }
    }),
  },
  sectionHeader: {
    fontSize: 10,
    color: colors.primary,
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  sliderContainer: {
    marginTop: 10,
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    position: 'relative',
  },
  activeTrack: {
    height: 4,
    backgroundColor: colors.primary,
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
    borderColor: colors.primary,
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
    color: colors.textMuted,
  },
  counterBox: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    marginBottom: 16,
  },
  counterTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  counterInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  counterInput: {
    flex: 1,
    color: colors.text,
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
    backgroundColor: colors.border,
    marginRight: 8,
  },
  cancelBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  terminalCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 20,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  terminalTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginLeft: 6,
  },
  terminalContent: {
    maxHeight: 120,
  },
  terminalText: {
    color: colors.text,
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
    backgroundColor: colors.success,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  acceptActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  counterActionBtn: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
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
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rejectActionText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
  },
  breakdownCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 10,
    color: colors.primary,
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
    color: colors.textMuted,
  },
  breakdownValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  breakdownNote: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
});
