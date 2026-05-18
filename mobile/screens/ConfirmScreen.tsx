import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Confirm'>;
type ConfirmRouteProp = RouteProp<RootStackParamList, 'Confirm'>;

export default function ConfirmScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ConfirmRouteProp>();

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />

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
              <Text style={styles.ratingSuccessText}>
                Rating: {rating} / 5 Stars registered!
              </Text>
            </View>
          )}
        </View>

        {/* Return to Landing Dashboard */}
        <TouchableOpacity
          style={styles.btnHome}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btnHomeText}>Return to Dashboard</Text>
          <Ionicons name="home-sharp" size={16} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
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
    backgroundColor: '#05966915',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#05966930',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  receiptCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 10,
    color: '#9ca3af',
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
    color: '#9ca3af',
  },
  receiptMonospace: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 12,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
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
    backgroundColor: '#13201a',
    borderRadius: 12,
    borderColor: '#065f46',
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
    color: '#34d399',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  smsText: {
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 18,
  },
  ratingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingSectionHeader: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 1.0,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  ratingSubtitle: {
    fontSize: 12,
    color: '#ffffff',
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
    backgroundColor: '#161616',
    borderWidth: 0.5,
    borderColor: '#333333',
    height: 38,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf2415',
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
    backgroundColor: '#4f46e5',
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
});
