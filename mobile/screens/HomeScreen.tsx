// KaamGraph / screens/HomeScreen.tsx
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
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';
import { API_BASE_URL } from '../config';
import { rPadding, rFontSize, rSpacing, rMargin, getGridColumnWidth, rBorderRadius, getShadow, rCardHeight, rIconSize } from '../utils/responsive';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = getGridColumnWidth(2, rPadding(12));

interface Category {
  id: string;
  name: string;
  urdu: string;
  icon: string;
  color: string;
  description: string;
  descUrdu: string;
  onlineBadge?: string;
}

const DAILY_ESSENTIALS: Category[] = [
  { id: 'Plumber', name: 'Plumber', urdu: 'پلمبر', icon: 'water-outline', color: '#3b82f6', description: 'Pipes, nalka & leaks', descUrdu: 'نلکہ، پائپ اور لیکس', onlineBadge: '12 Active' },
  { id: 'Electrician', name: 'Electrician', urdu: 'الیکٹریشین', icon: 'flash-outline', color: '#eab308', description: 'Wiring & short circuits', descUrdu: 'وائرنگ اور شارٹ سرکٹ', onlineBadge: '9 Online' },
  { id: 'AC Technician', name: 'AC Tech', urdu: 'اے سی ٹیکنیشین', icon: 'snow-outline', color: '#06b6d4', description: 'Cooling & gas refill', descUrdu: 'کولنگ اور گیس ریفل', onlineBadge: '15 Online' },
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

  // Animated placeholders sequence
  const PLACEHOLDERS = [
    "Toti kharab ho gai ha...",
    "Sofa repair karwana ha...",
    "G-11 mein plumber chahye...",
    "Ghar ki deep cleaning krni ha...",
    "Bijli ka short circuit check karein...",
    "Mujhe AC wala chahye Tulsa road par...",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Live Escrow Activity Ticker Scrolling
  const ESCROW_TRANSACTIONS = [
    { id: '1', text: "🟢 Booking BK-788C42: Deep Cleaning Escrow Secured (3,000 PKR)" },
    { id: '2', text: "🟢 Booking BK-1092: Plumber Dispatched to F-11 (1,500 PKR)" },
    { id: '3', text: "🟢 Booking BK-9051: Electrician Job Completed in G-13 (1,800 PKR)" },
    { id: '4', text: "🟢 Booking BK-4112: AC Maintenance Escrow Released (2,000 PKR)" },
    { id: '5', text: "🟢 Booking BK-3329: Carpenter Assigned to DHA Phase II (2,200 PKR)" },
    { id: '6', text: "🟢 Booking BK-8172: Painter Material Cost Escrow Locked (4,500 PKR)" },
  ];
  const tickerRef = React.useRef<FlatList>(null);
  const scrollIndex = React.useRef(0);

  React.useEffect(() => {
    const tickerInterval = setInterval(() => {
      if (tickerRef.current && ESCROW_TRANSACTIONS.length > 0) {
        scrollIndex.current = (scrollIndex.current + 1) % ESCROW_TRANSACTIONS.length;
        tickerRef.current.scrollToIndex({
          index: scrollIndex.current,
          animated: true,
          viewPosition: 0,
        });
      }
    }, 4000);
    return () => clearInterval(tickerInterval);
  }, []);

  // Pulsing animation for icons
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleCategoryPress = (category: string) => {
    let initialMessage: string | undefined = undefined;
    if (category === 'Plumber') {
      initialMessage = "Mujhe plumber chahye urgent";
    } else if (category === 'Electrician') {
      initialMessage = "Electrician ki zaroorat ha";
    } else if (category === 'AC Technician' || category === 'AC Tech') {
      initialMessage = "AC service karwani ha";
    } else if (category === 'Painter') {
      initialMessage = "Ghar ka paint karwana ha";
    } else if (category === 'Carpenter') {
      initialMessage = "Sofa aur darwaza repair karwana ha";
    } else if (category === 'Cleaning') {
      initialMessage = "Ghar ki deep cleaning krni ha";
    }

    if (initialMessage) {
      navigation.navigate('AI Match', { initialMessage });
    } else {
      navigation.navigate('AI Match', { category });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header section */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingHorizontal: rPadding(20), paddingVertical: rPadding(12) }]}>
        <View style={styles.headerBranding}>
          <Text style={[styles.headerSubtitle, { color: userRole === 'client' ? colors.primary : colors.success, fontSize: rFontSize(9) }]}>
            {userRole === 'client' ? t.homeSubtitleClient : t.homeSubtitleWorker}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: rFontSize(20) }]}>
            KaamGraph
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border, padding: rPadding(8), marginLeft: rPadding(4) }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: rFontSize(11), fontWeight: 'bold', color: colors.primary }}>
              {language === 'en' ? 'اردو' : 'EN'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginLeft: rPadding(8), padding: rPadding(8) }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={rIconSize(20)} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginLeft: rPadding(8), padding: rPadding(8) }]}
            onPress={toggleUserRole}
            activeOpacity={0.7}
          >
            <Ionicons name={userRole === 'client' ? 'person-outline' : 'construct-outline'} size={rIconSize(18)} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: rPadding(20) }]} showsVerticalScrollIndicator={false}>
        
        {userRole === 'client' ? (
          <>
            {/* Hero Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(24), padding: rPadding(24), marginBottom: rMargin(16), ...getShadow(5) }]}>
              <View style={styles.heroTextContent}>
                <Text style={[styles.heroBadge, { fontSize: rFontSize(9), paddingHorizontal: rPadding(8), paddingVertical: rPadding(4), borderRadius: rBorderRadius(6) }]}>{t.heroBadgeText}</Text>
                <Text style={[styles.heroTitle, { color: colors.text, fontSize: rFontSize(18), marginBottom: rMargin(6) }]}>{t.heroTitleText}</Text>
                <Text style={[styles.heroDescription, { color: colors.textMuted, fontSize: rFontSize(12), lineHeight: rFontSize(18) }]}>{t.heroDescText}</Text>
              </View>
              <View style={styles.heroGlowDot} />
            </View>

            {/* Live Escrow Activity Ticker */}
            <View style={[styles.tickerWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(12) }]}>
              <View style={styles.tickerHeader}>
                <Ionicons name="stats-chart-outline" size={rIconSize(12)} color={colors.primary} />
                <Text style={[styles.tickerTitle, { color: colors.text }]}>LIVE AGENTIC ESCROW FEED</Text>
              </View>
              <FlatList
                ref={tickerRef}
                horizontal
                data={ESCROW_TRANSACTIONS}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                onScrollToIndexFailed={() => {}}
                renderItem={({ item }) => (
                  <View style={styles.tickerItem}>
                    <Text style={[styles.tickerItemText, { color: colors.textMuted }]}>
                      {item.text}
                    </Text>
                    <Text style={[styles.tickerDivider, { color: colors.border }]}>•</Text>
                  </View>
                )}
              />
            </View>

            {/* AI Search Prompt Trigger */}
            <TouchableOpacity 
              style={[styles.searchBarTrigger, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(16), paddingHorizontal: rPadding(18), paddingVertical: rPadding(14), marginBottom: rMargin(28), ...getShadow(2) }]}
              onPress={() => navigation.navigate('AI Match')}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles-outline" size={rIconSize(18)} color="#6366f1" style={{ marginRight: rMargin(8) }} />
              <TextInput
                style={[styles.searchPlaceholder, { color: colors.text, fontSize: rFontSize(13), flex: 1 }]}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                placeholderTextColor="#94a3b8"
                editable={false}
              />
              <TouchableOpacity
                style={{ padding: rPadding(4), marginRight: rMargin(8) }}
                onPress={() => {
                  Alert.alert("Voice Search", "Listening... Speak your Roman Urdu query now.");
                }}
              >
                <Ionicons name="mic" size={rIconSize(20)} color="#6366f1" />
              </TouchableOpacity>
              <View style={[styles.arrowIconWrapper, { backgroundColor: '#6366f1', width: rSpacing(24), height: rSpacing(24), borderRadius: rBorderRadius(12) }]}>
                <Ionicons name="arrow-forward" size={rIconSize(14)} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Overview Section */}
            <View style={[styles.sectionHeader, { marginBottom: rMargin(12) }]}>
              <Text style={[styles.groupTitle, { color: colors.textMuted, marginBottom: 0, fontSize: rFontSize(12) }]}>{t.overviewTitle}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={{ color: colors.primary, fontSize: rFontSize(11), fontWeight: 'bold' }}>{t.viewDetails}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.overviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.overviewHeader}>
                <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
                  <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.statusText, { color: colors.primary }]}>ACTIVE</Text>
                </View>
                <Text style={[styles.timeText, { color: colors.textMuted }]}>Today, 10:30 AM</Text>
              </View>
              
              <View style={styles.overviewBody}>
                <View style={styles.overviewMain}>
                  <Text style={[styles.serviceTitle, { color: colors.text }]}>AC Maintenance</Text>
                  <Text style={[styles.providerSub, { color: colors.textMuted }]}>Hassan Technics • G-13 Markaz</Text>
                </View>
                <View style={[styles.priceTag, { backgroundColor: colors.successLight }]}>
                  <Text style={[styles.priceText, { color: colors.success }]}>1,500 PKR</Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: '65%' }]} />
              </View>

              {/* Agent Nodes Horizontal Tracking */}
              <View style={styles.agentNodesWrapper}>
                <View style={styles.agentNode}>
                  <View style={[styles.nodeDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.nodeText, { color: colors.text, fontWeight: '600' }]}>Matched</Text>
                </View>
                <View style={styles.nodeLine} />
                <View style={styles.agentNode}>
                  <View style={[styles.nodeDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.nodeText, { color: colors.text, fontWeight: '600' }]}>Escrow Locked</Text>
                </View>
                <View style={styles.nodeLine} />
                <View style={styles.agentNode}>
                  <View style={[styles.nodeDot, styles.glowingNodeDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.nodeText, { color: colors.primary, fontWeight: '700' }]}>Arriving</Text>
                </View>
              </View>

              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                {language === 'en' ? 'Provider is arriving' : 'ورکر آ رہا ہے'} • 12 mins away
              </Text>
            </View>

            {/* Grid 1: Daily Essentials */}
            <Text style={[styles.groupTitle, { color: colors.textMuted, fontSize: rFontSize(12), marginBottom: rMargin(12) }]}>{t.groupEssentials}</Text>
            <View style={[styles.categoryGrid, { marginBottom: rMargin(16) }]}>
              {DAILY_ESSENTIALS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, width: COLUMN_WIDTH, borderRadius: rBorderRadius(20), padding: rPadding(18), marginBottom: rMargin(16), position: 'relative', ...getShadow(3) }]}
                  onPress={() => handleCategoryPress(c.id)}
                >
                  {c.onlineBadge && (
                    <View style={[styles.onlineBadge, { backgroundColor: colors.successLight, borderColor: colors.success + '20' }]}>
                      <View style={[styles.onlineBadgeDot, { backgroundColor: colors.success }]} />
                      <Text style={[styles.onlineBadgeText, { color: colors.success }]}>
                        {c.onlineBadge}
                      </Text>
                    </View>
                  )}
                  <Animated.View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight, transform: [{ scale: pulseAnim }], width: rSpacing(48), height: rSpacing(48), borderRadius: rBorderRadius(12) }]}>
                    <Ionicons name={c.icon as any} size={rIconSize(22)} color={colors.primary} />
                  </Animated.View>
                  <Text style={[styles.categoryName, { color: colors.text, fontSize: rFontSize(14), fontWeight: 'bold', marginTop: rMargin(8) }]}>{language === 'en' ? c.name : c.urdu}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted, fontSize: rFontSize(11), marginTop: rMargin(4) }]}>{language === 'en' ? c.description : c.descUrdu}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Grid 2: Home Services */}
            <Text style={[styles.groupTitle, { color: colors.textMuted, fontSize: rFontSize(12), marginBottom: rMargin(12) }]}>{t.groupHomeServices}</Text>
            <View style={[styles.categoryGrid, { marginBottom: rMargin(16) }]}>
              {HOME_SERVICES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(c.id)}
                >
                  <Animated.View style={[styles.iconWrapper, { backgroundColor: 'rgba(249, 115, 22, 0.1)', transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name={c.icon as any} size={22} color="#f97316" />
                  </Animated.View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{language === 'en' ? c.name : c.urdu}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted }]}>{language === 'en' ? c.description : c.descUrdu}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Grid 3: Health Care */}
            <Text style={[styles.groupTitle, { color: colors.textMuted, fontSize: rFontSize(12), marginBottom: rMargin(12) }]}>{t.groupHealthCare}</Text>
            <View style={[styles.categoryGrid, { marginBottom: rMargin(16) }]}>
              {HEALTH_CARE.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(c.id)}
                >
                  <Animated.View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)', transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name={c.icon as any} size={22} color="#10b981" />
                  </Animated.View>
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
            <View style={[styles.earningsDashboardRow, { marginBottom: rMargin(20), flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(12), padding: rPadding(14), marginHorizontal: rMargin(4), flex: 1 }]}>
                <Text style={{ color: colors.textMuted, fontSize: rFontSize(10) }}>{t.workerWallet}</Text>
                <Text style={{ color: colors.success, fontSize: rFontSize(18), fontWeight: 'bold', marginTop: rMargin(4) }}>
                  {escrowBalance.toLocaleString()} PKR
                </Text>
              </View>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(12), padding: rPadding(14), marginHorizontal: rMargin(4), flex: 1 }]}>
                <Text style={{ color: colors.textMuted, fontSize: rFontSize(10) }}>{t.workerGigs}</Text>
                <Text style={{ color: colors.primary, fontSize: rFontSize(18), fontWeight: 'bold', marginTop: rMargin(4) }}>34</Text>
              </View>
            </View>

            {/* Active Task & Performance Dashboard */}
            <Text style={[styles.groupTitle, { color: colors.textMuted, fontSize: rFontSize(12), marginBottom: rMargin(12) }]}>
              {language === 'en' ? 'Performance Overview' : 'کارکردگی کا جائزہ'}
            </Text>
            
            <View style={[{ flexDirection: 'row', marginBottom: rMargin(20), justifyContent: 'space-between' }]}>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(12), padding: rPadding(14), marginHorizontal: rMargin(4), flex: 1 }]}>
                <Text style={{ color: colors.textMuted, fontSize: rFontSize(10) }}>RATING</Text>
                <Text style={{ color: colors.warning, fontSize: rFontSize(18), fontWeight: 'bold', marginTop: rMargin(4) }}>⭐ 4.8</Text>
              </View>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderRadius: rBorderRadius(12), padding: rPadding(14), marginHorizontal: rMargin(4), flex: 1 }]}>
                <Text style={{ color: colors.textMuted, fontSize: rFontSize(10) }}>ON-TIME SCORE</Text>
                <Text style={{ color: colors.success, fontSize: rFontSize(18), fontWeight: 'bold', marginTop: rMargin(4) }}>96%</Text>
              </View>
            </View>

            <Text style={[styles.groupTitle, { color: colors.textMuted, fontSize: rFontSize(12), marginBottom: rMargin(12) }]}>
              {language === 'en' ? 'Active Jobs' : 'موجودہ کام'}
            </Text>
            
            {!isOnline ? (
              <View style={[styles.inDriveCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, alignItems: 'center', paddingVertical: rPadding(30), borderRadius: rBorderRadius(16), padding: rPadding(16), marginBottom: rMargin(16) }]}>
                <Ionicons name="moon-outline" size={rIconSize(36)} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: rMargin(10), fontSize: rFontSize(13) }}>
                  {language === 'en' ? 'Go online to see AI Dispatch heatmaps.' : 'کام شروع کرنے کے لیے آن لائن ہوں۔'}
                </Text>
              </View>
            ) : (
              <View style={[styles.inDriveCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary, alignItems: 'center', paddingVertical: rPadding(30), borderRadius: rBorderRadius(16), padding: rPadding(16), marginBottom: rMargin(16) }]}>
                <Ionicons name="flame-outline" size={rIconSize(36)} color={colors.primary} />
                <Text style={{ color: colors.primary, marginTop: rMargin(10), fontWeight: 'bold', fontSize: rFontSize(14) }}>
                  {language === 'en' ? '🔥 High Demand in F-11 Sector!' : '🔥 سیکٹر F-11 میں زیادہ ڈیمانڈ!'}
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: rMargin(4), fontSize: rFontSize(12) }}>
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 10px 20px rgba(99, 102, 241, 0.2)',
      }
    }),
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
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }
    }),
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
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
      }
    }),
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    overflow: 'hidden',
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
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 11,
  },
  overviewBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewMain: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  providerSub: {
    fontSize: 12,
  },
  priceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontStyle: 'italic',
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
  tickerWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  tickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tickerTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  tickerItemText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tickerDivider: {
    marginLeft: 12,
    marginRight: 12,
    fontSize: 12,
  },
  agentNodesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  agentNode: {
    alignItems: 'center',
    flex: 1.2,
  },
  nodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  glowingNodeDot: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nodeText: {
    fontSize: 9,
    textAlign: 'center',
  },
  nodeLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flex: 0.5,
    marginTop: -14,
  },
  onlineBadge: {
    position: 'absolute',
    top: rPadding(10),
    right: rPadding(10),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rPadding(6),
    paddingVertical: rPadding(3),
    borderRadius: rBorderRadius(6),
    borderWidth: 1,
    zIndex: 2,
  },
  onlineBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  onlineBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
