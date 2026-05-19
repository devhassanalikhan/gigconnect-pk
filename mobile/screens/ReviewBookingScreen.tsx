import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

export default function ReviewBookingScreen({ route, navigation }: any) {
  const { colors, setActiveBooking, theme } = useTheme();
  const { provider, serviceType, selectedDate, selectedTime } = route.params;

  const [address, setAddress] = useState('Adyala Road, Rawalpindi');
  const [issue, setIssue] = useState('Urgent repair needed');

  const handleSubmit = () => {
    // Generate simulated active booking structure in context
    const bookingId = `BK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const jobId = `JOB-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const newBooking = {
      id: bookingId,
      provider: provider,
      service: serviceType,
      date: selectedDate,
      time: selectedTime,
      address: address,
      issue: issue,
      status: 'Pending' as const,
      timelineLogs: [
        { title: 'Pending Dispatch confirmation', time: '19 May, 4:13 PM', done: true },
        { title: 'Accepted by service professional', time: '--:--', done: false },
        { title: 'Technician en route', time: '--:--', done: false },
        { title: 'Job Completed successfully', time: '--:--', done: false }
      ],
      escrowReleased: false,
    };
    
    // Save to context
    setActiveBooking(newBooking);

    // Transition straight to the ZOPA Bargaining simulator
    navigation.navigate('Bid', {
      jobId: jobId,
      providerId: provider.id || 'p1',
      providerName: provider.name,
      serviceType: serviceType,
      clientBudget: provider.base_cost || 1500,
      providerMin: (provider.base_cost || 1500) + 300,
      agreedPrice: (provider.base_cost || 1500) + 150,
      action: 'COUNTER_OFFER',
      reason: 'Bidding bounds calculated',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Review your booking</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Confirm the details before submitting.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Service Info Block */}
          <View style={[styles.detailBlock, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.primary }]}>SERVICE</Text>
            <Text style={[styles.value, { color: colors.text }]}>{serviceType}</Text>
          </View>

          {/* Provider Card */}
          <View style={[styles.detailBlock, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.primary }]}>PROVIDER</Text>
            <Text style={[styles.value, { color: colors.text }]}>{provider.name}</Text>
            <Text style={[styles.subtext, { color: colors.textMuted }]}>
              {provider.distance_km} km away • Rating {provider.rating}★
            </Text>
          </View>

          {/* Date and Time row */}
          <View style={styles.row}>
            <View style={[styles.detailBlock, { flex: 1, marginRight: 10, backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.primary }]}>DATE</Text>
              <Text style={[styles.value, { color: colors.text }]}>{selectedDate}</Text>
            </View>
            <View style={[styles.detailBlock, { flex: 1, marginLeft: 10, backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.primary }]}>TIME</Text>
              <Text style={[styles.value, { color: colors.text }]}>{selectedTime}</Text>
            </View>
          </View>

          {/* Address Editable Area */}
          <View style={[styles.detailBlock, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.primary }]}>ADDRESS</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your street address"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Issue Description Area */}
          <View style={[styles.detailBlock, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.primary }]}>ISSUE DETAILS</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={issue}
              onChangeText={setIssue}
              placeholder="Describe what needs to be fixed..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.editBtnText, { color: colors.text }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.submitBtnText, { color: '#fff' }]}>Submit booking</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  detailBlock: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  input: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#090d16',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 15,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  editBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
