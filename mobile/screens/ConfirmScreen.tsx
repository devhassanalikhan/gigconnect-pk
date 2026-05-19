// KaamGraph / Mobile / mobile/screens/ConfirmScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useTheme } from '../ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Confirm'>;
type ConfirmRouteProp = RouteProp<RootStackParamList, 'Confirm'>;

import { API_BASE_URL } from '../config';

export default function ConfirmScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ConfirmRouteProp>();
  const { colors, theme, toggleUserRole } = useTheme();
  const styles = getStyles(colors);

  const {
    jobId,
    bookingId,
    escrowId,
    total,
    fee,
    netToProvider,
    providerName,
    serviceType,
    providerSms,
  } = route.params;

  const [rating, setRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const submitRating = () => {
    if (rating === 0) {
      Alert.alert('No Rating Selected', 'Please tap a star to rate the provider.');
      return;
    }
    setRatingSubmitted(true);
    Alert.alert('Thank You!', `You rated ${providerName} ${rating} Stars. Feedback submitted successfully!`);
  };

  const handleDispute = async (type: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          dispute_type: type,
          description: 'Client initiated dispute from mobile UI'
        })
      });
      const result = await res.json();
      Alert.alert('Dispute Registered', `Action: ${result.resolution.action}\n\n${result.resolution.message}`);
    } catch (e) {
      Alert.alert('Error', 'Could not register dispute.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Receipt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Success Branding Banner */}
        <View style={styles.successBanner}>
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={56} color="#059669" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Milestone secured with AI Escrow. {providerName} has been assigned to your task.
          </Text>
        </View>

        {/* Escrow Transaction Card */}
        <View style={styles.receiptCard}>
          <Text style={styles.sectionHeader}>PAYMENT ESCROW RECEIPT</Text>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Job ID</Text>
            <Text style={styles.receiptMonospace}>{jobId.slice(0, 10)}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Booking ID</Text>
            <Text style={styles.receiptMonospace}>{bookingId}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Escrow ID</Text>
            <Text style={styles.receiptMonospace}>{escrowId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Total Amount Locked</Text>
            <Text style={styles.totalValue}>{total.toFixed(0)} PKR</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Platform Fee (9.99%)</Text>
            <Text style={styles.receiptFee}>-{fee.toFixed(2)} PKR</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Net Payout to Worker</Text>
            <Text style={styles.netValue}>{netToProvider.toFixed(2)} PKR</Text>
          </View>
        </View>

        {/* SMS Dispatch Box */}
        {providerSms ? (
          <View style={styles.smsPreviewBox}>
            <View style={styles.smsHeader}>
              <Ionicons name="mail" size={14} color="#34d399" />
              <Text style={styles.smsTitle}>FollowUpAgent SMS Sent</Text>
            </View>
            <Text style={styles.smsText}>{providerSms}</Text>
          </View>
        ) : null}

        {/* Interactive Simulated Rating Module */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingSectionHeader}>RATE SERVICE PROVIDER</Text>
          <Text style={styles.ratingSubtitle}>
            {ratingSubmitted ? 'Feedback submitted' : `How was your experience with ${providerName}?`}
          </Text>

          {!ratingSubmitted ? (
            <>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRatingPress(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color="#eab308"
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.ratingBtn} onPress={submitRating}>
                <Text style={styles.ratingBtnText}>Submit Rating Feedback</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.ratingSuccessBox}>
              <Ionicons name="ribbon-sharp" size={24} color="#eab308" />
              <Text style={styles.ratingSuccessText}>Rating: {rating} / 5 Stars registered!</Text>
            </View>
          )}
        </View>

        <View style={styles.disputeCard}>
          <Text style={styles.sectionHeader}>REPORT AN ISSUE (DISPUTE AGENT)</Text>
          <Text style={styles.disputeSubtitle}>Escrow is locked. If something goes wrong, you can open a dispute.</Text>
          
          <View style={styles.disputeBtnRow}>
            <TouchableOpacity style={styles.disputeBtn} onPress={() => handleDispute('no_show')}>
              <Ionicons name="person-remove-outline" size={14} color="#f87171" />
              <Text style={styles.disputeBtnText}>No-Show</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.disputeBtn} onPress={() => handleDispute('quality_complaint')}>
              <Ionicons name="construct-outline" size={14} color="#f87171" />
              <Text style={styles.disputeBtnText}>Quality</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.disputeBtn} onPress={() => handleDispute('price_disagreement')}>
              <Ionicons name="cash-outline" size={14} color="#f87171" />
              <Text style={styles.disputeBtnText}>Pricing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Return to Landing Dashboard */}
        <TouchableOpacity
          style={styles.btnHome}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btnHomeText}>Return to Dashboard</Text>
          <Ionicons name="home-sharp" size={16} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Demo Role-Switch: View Lead as Worker */}
        <TouchableOpacity
          style={[styles.btnHome, { backgroundColor: '#10b981', borderColor: '#059669', marginTop: 12 }]}
          onPress={() => {
            toggleUserRole();
            navigation.navigate('Home');
          }}
        >
          <Text style={styles.btnHomeText}>Demo Role-Switch: View Lead as Worker</Text>
          <Ionicons name="construct-sharp" size={16} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
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
  successBanner: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  receiptCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    letterSpacing: 1.0,
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  receiptLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  receiptMonospace: {
    color: colors.text,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  receiptFee: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
  },
  netValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#34d399',
  },
  smsPreviewBox: {
    backgroundColor: colors.successLight,
    borderRadius: 12,
    borderColor: colors.success,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  smsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  smsTitle: {
    fontSize: 11,
    color: colors.success,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  smsText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  ratingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingSectionHeader: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    letterSpacing: 1.0,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  ratingSubtitle: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  ratingBtn: {
    backgroundColor: colors.background,
    borderWidth: 0.5,
    borderColor: colors.border,
    height: 38,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#fbbf24',
  },
  ratingSuccessText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  btnHome: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnHomeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disputeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 16,
    marginBottom: 24,
  },
  disputeSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12,
  },
  disputeBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  disputeBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  disputeBtnText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
