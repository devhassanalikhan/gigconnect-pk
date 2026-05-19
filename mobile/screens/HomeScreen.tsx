// GigConnect AI / screens/HomeScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 44) / 2;

interface Category {
  id: string;
  name: string;
  urdu: string;
  icon: string;
  color: string;
  description: string;
  descUrdu: string;
}

const DAILY_ESSENTIALS: Category[] = [
  { id: 'Plumber', name: 'Plumber', urdu: 'پلمبر', icon: 'water-outline', color: '#3b82f6', description: 'Pipes, nalka & leaks', descUrdu: 'نلکہ، پائپ اور لیکس' },
  { id: 'Electrician', name: 'Electrician', urdu: 'الیکٹریشین', icon: 'flash-outline', color: '#eab308', description: 'Wiring & short circuits', descUrdu: 'وائرنگ اور شارٹ سرکٹ' },
  { id: 'AC Technician', name: 'AC Tech', urdu: 'اے سی ٹیکنیشین', icon: 'snow-outline', color: '#06b6d4', description: 'Cooling & gas refill', descUrdu: 'کولنگ اور گیس ریفل' },
];

const HOME_SERVICES: Category[] = [
  { id: 'Painter', name: 'Painter', urdu: 'پینٹر', icon: 'brush-outline', color: '#f97316', description: 'Wall painting & touchup', descUrdu: 'دیواری رنگ اور ٹچ اپ' },
  { id: 'Carpenter', name: 'Carpenter', urdu: 'بڑھئی', icon: 'hammer-outline', color: '#8b5cf6', description: 'Furniture & wood work', descUrdu: 'فرنیچر اور لکڑی کام' },
  { id: 'Cleaning', name: 'Cleaning', urdu: 'صفائی', icon: 'home-outline', color: '#ec4899', description: 'Deep home cleanup', descUrdu: 'گھر کی مکمل صفائی' },
];

const HEALTH_CARE: Category[] = [
  { id: 'Home Nursing', name: 'Home Nursing', urdu: 'ہوم نرسنگ', icon: 'heart-outline', color: '#10b981', description: 'Patient care at home', descUrdu: 'گھر پر مریض کی دیکھ بھال' },
  { id: 'Tele-health', name: 'Tele-health', urdu: 'ٹیلی صحت', icon: 'call-outline', color: '#06b6d4', description: 'Virtual AI consultancy', descUrdu: 'آن لائن AI مشاورہ' },
  { id: 'Physiotherapy', name: 'Physiotherapist', urdu: 'فزیو تھیرپی', icon: 'fitness-outline', color: '#a855f7', description: 'Muscle rehab sessions', descUrdu: 'مسل ریہیب سیشنز' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, theme, toggleTheme, userRole, toggleUserRole, language, toggleLanguage, t, selectedLocationIndex } = useTheme();

  const activeLocation = ISLAMABAD_SECTORS[selectedLocationIndex];
  const locName = language === 'en' ? activeLocation.name : activeLocation.urdu;

  // Worker Dashboard state
  const [isOnline, setIsOnline] = useState(false);
  const [escrowBalance, setEscrowBalance] = useState(14500);

  const handleCategoryPress = (category: string) => {
    navigation.navigate('Search', { category });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header section */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerBranding}>
          <Text style={[styles.headerSubtitle, { color: userRole === 'client' ? colors.primary : colors.success }]}>
            {userRole === 'client' ? t.homeSubtitleClient : t.homeSubtitleWorker}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            KaamGraph
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary }}>
              {language === 'en' ? 'اردو' : 'EN'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginLeft: 8 }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginLeft: 8 }]}
            onPress={toggleUserRole}
            activeOpacity={0.7}
          >
            <Ionicons name={userRole === 'client' ? 'person-outline' : 'construct-outline'} size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {userRole === 'client' ? (
          <>
            {/* Hero Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroBadge}>{t.heroBadgeText}</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>{t.heroTitleText}</Text>
                <Text style={[styles.heroDescription, { color: colors.textMuted }]}>{t.heroDescText}</Text>
              </View>
              <View style={styles.heroGlowDot} />
            </View>

            {/* AI Search Prompt Trigger */}
            <TouchableOpacity 
              style={[styles.searchBarTrigger, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles-outline" size={18} color="#6366f1" style={styles.searchIcon} />
              <Text style={[styles.searchPlaceholder, { color: '#94a3b8' }]}>{t.searchHint}</Text>
              <View style={[styles.arrowIconWrapper, { backgroundColor: '#6366f1' }]}>
                <Ionicons name="arrow-forward" size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Grid 1: Daily Essentials */}
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>{t.groupEssentials}</Text>
            <View style={styles.categoryGrid}>
              {DAILY_ESSENTIALS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(c.id)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name={c.icon as any} size={22} color={colors.primary} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{language === 'en' ? c.name : c.urdu}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted }]}>{language === 'en' ? c.description : c.descUrdu}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Grid 2: Home Services */}
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>{t.groupHomeServices}</Text>
            <View style={styles.categoryGrid}>
              {HOME_SERVICES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(c.id)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                    <Ionicons name={c.icon as any} size={22} color="#f97316" />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{language === 'en' ? c.name : c.urdu}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted }]}>{language === 'en' ? c.description : c.descUrdu}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Grid 3: Health Care */}
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>{t.groupHealthCare}</Text>
            <View style={styles.categoryGrid}>
              {HEALTH_CARE.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(c.id)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name={c.icon as any} size={22} color="#10b981" />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{language === 'en' ? c.name : c.urdu}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted }]}>{language === 'en' ? c.description : c.descUrdu}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* WORKER DASHBOARD */}
            <View style={[styles.onlineStatusRow, {
              backgroundColor: isOnline ? colors.successLight : colors.dangerLight,
              borderColor: isOnline ? colors.success : colors.danger,
              borderWidth: 1
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.danger }]} />
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>
                  {isOnline ? `${t.workerOnline} ${locName}` : (language === 'en' ? 'OFFLINE • Paused' : 'آف لائن • موقوف')}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.onlineToggleBtn, { backgroundColor: isOnline ? colors.success : colors.border }]}
                onPress={() => setIsOnline(!isOnline)}
              >
                <Text style={[styles.onlineToggleBtnText, { color: colors.text }]}>
                  {isOnline ? (language === 'en' ? 'PAUSE' : 'روکیں') : (language === 'en' ? 'GO LIVE' : 'شروع')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Earnings */}
            <View style={styles.earningsDashboardRow}>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>{t.workerWallet}</Text>
                <Text style={{ color: colors.success, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>
                  {escrowBalance.toLocaleString()} PKR
                </Text>
              </View>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>{t.workerGigs}</Text>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>34</Text>
              </View>
            </View>

            {/* Active Task & Performance Dashboard */}
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
              {language === 'en' ? 'Performance Overview' : 'کارکردگی کا جائزہ'}
            </Text>
            
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>RATING</Text>
                <Text style={{ color: colors.warning, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>⭐ 4.8</Text>
              </View>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>ON-TIME SCORE</Text>
                <Text style={{ color: colors.success, fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>96%</Text>
              </View>
            </View>

            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
              {language === 'en' ? 'Active Jobs' : 'موجودہ کام'}
            </Text>
            
            {!isOnline ? (
              <View style={[styles.inDriveCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, alignItems: 'center', paddingVertical: 30 }]}>
                <Ionicons name="moon-outline" size={36} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 10 }}>
                  {language === 'en' ? 'Go online to see AI Dispatch heatmaps.' : 'کام شروع کرنے کے لیے آن لائن ہوں۔'}
                </Text>
              </View>
            ) : (
              <View style={[styles.inDriveCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary, alignItems: 'center', paddingVertical: 30 }]}>
                <Ionicons name="flame-outline" size={36} color={colors.primary} />
                <Text style={{ color: colors.primary, marginTop: 10, fontWeight: 'bold' }}>
                  {language === 'en' ? '🔥 High Demand in F-11 Sector!' : '🔥 سیکٹر F-11 میں زیادہ ڈیمانڈ!'}
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>
                  {language === 'en' ? 'Check the Leads tab for live incoming jobs.' : 'نئی جابز کے لیے لیڈز ٹیب دیکھیں۔'}
                </Text>
              </View>
            )}
          </>
        )}

      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBranding: {
    flexDirection: 'column',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  heroCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  heroTextContent: {
    zIndex: 1,
  },
  heroBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#6366f1',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  heroGlowDot: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 13,
    flex: 1,
  },
  arrowIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDesc: {
    color: '#64748b',
    fontSize: 11,
  },
  onlineStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  onlineToggleBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  onlineToggleBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  earningsDashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  earningMiniCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 4,
  },
  inDriveCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  leadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leadPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  negotiateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  negotiateBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  multipliersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  multiplierPill: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
});
