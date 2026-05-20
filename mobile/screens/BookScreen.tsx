import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';

export default function BookScreen({ route, navigation }: any) {
  const { colors, theme } = useTheme();
  const params = route.params || {};
  const provider = params.provider || { name: 'Local Provider', distance_km: 1.2, rating: 4.8 };
  const serviceType = params.serviceType || provider.category || 'Plumber';
  const [selectedDay, setSelectedDay] = useState(19);

  // Generate days of May 2026
  const daysInMay = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayOffset = 5; // Friday is May 1st, 2026 (offset by 5 for Mon-Sun grid starting Sunday)

  const handleNext = () => {
    navigation.navigate('Review', {
      provider,
      serviceType,
      selectedDate: `Tue ${selectedDay} May`,
      selectedTime: '5:00 PM',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.backTxt, { color: colors.textMuted }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Book your service</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Confirm details to schedule the visit.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Provider card */}
        <View style={[styles.providerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.category, { color: colors.primary }]}>{serviceType.toUpperCase()}</Text>
          <Text style={[styles.providerName, { color: colors.text }]}>{provider.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={[styles.ratingText, { color: colors.textMuted }]}>{provider.rating} • {provider.distance_km} km away</Text>
          </View>
        </View>

        {/* Date Calendar */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Date</Text>
        <View style={[styles.calendarCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.monthHeader, { color: colors.text }]}>May 2026</Text>
          
          {/* Day Names */}
          <View style={styles.weeksRow}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <Text key={d} style={[styles.weekDayName, { color: colors.textMuted }]}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {/* Blank placeholders */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <View key={`empty-${idx}`} style={styles.emptyDay} />
            ))}
            
            {/* Real Days */}
            {daysInMay.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayCell,
                    isSelected ? { backgroundColor: colors.primary } : null
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected ? { color: '#fff', fontWeight: 'bold' } : { color: colors.text }
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer trigger */}
      <View style={[styles.footerContainer, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
          <Text style={styles.actionBtnText}>Pick a time slot</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: {
    marginBottom: 10,
  },
  backTxt: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
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
  providerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    marginBottom: 24,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    color: '#fbbf24',
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    alignItems: 'center',
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  weeksRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayName: {
    color: '#475569',
    fontSize: 14,
    width: 36,
    textAlign: 'center',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  emptyDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  actionBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
