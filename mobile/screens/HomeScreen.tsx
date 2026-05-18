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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useTheme } from '../ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const CATEGORIES: Category[] = [
  { id: 'Plumber', name: 'Plumber', icon: 'water-outline', color: '#3b82f6', description: 'Nalka, pipes & leaks' },
  { id: 'Electrician', name: 'Electrician', icon: 'flash-outline', color: '#eab308', description: 'Wiring & short circuits' },
  { id: 'AC Technician', name: 'AC Tech', icon: 'snow-outline', color: '#06b6d4', description: 'Cooling & gas leaks' },
  { id: 'Painter', name: 'Painter', icon: 'brush-outline', color: '#f97316', description: 'Wall painting & touchup' },
  { id: 'Tutor', name: 'Tutor', icon: 'book-outline', color: '#10b981', description: 'Math, Urdu & English ustaad' },
  { id: 'Carpenter', name: 'Carpenter', icon: 'construct-outline', color: '#8b5cf6', description: 'Furniture & wood repair' },
];

interface InDriveLead {
  id: string;
  category: string;
  icon: string;
  color: string;
  clientName: string;
  description: string;
  distance: string;
  price: number;
  matchRating: number;
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 44) / 2;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, theme, toggleTheme, userRole, language, toggleLanguage, t } = useTheme();

  // InDrive Worker Dashboard States
  const [isOnline, setIsOnline] = useState(true);
  const [escrowBalance, setEscrowBalance] = useState(12500);
  const [activeLeads, setActiveLeads] = useState<InDriveLead[]>([
    {
      id: '1',
      category: 'AC Technician',
      icon: 'snow-outline',
      color: '#06b6d4',
      clientName: 'Hassan A.',
      description: 'Mujhe kal subah G-13 me urgent AC lagwana hai koi technician bhejo.',
      distance: '1.4 km away',
      price: 2500,
      matchRating: 98,
    },
    {
      id: '2',
      category: 'Electrician',
      icon: 'flash-outline',
      color: '#eab308',
      clientName: 'Zainab M.',
      description: 'Main board me short circuit ho rha hai urgently electrician chahye G-13.',
      distance: '0.8 km away',
      price: 1800,
      matchRating: 95,
    },
    {
      id: '3',
      category: 'Plumber',
      icon: 'water-outline',
      color: '#3b82f6',
      clientName: 'Bilal K.',
      description: 'Kitchen tap leak kr rha hai, paani bohot zaya ho rha hai. Urgent help!',
      distance: '2.1 km away',
      price: 1200,
      matchRating: 90,
    }
  ]);

  const [selectedLead, setSelectedLead] = useState<InDriveLead | null>(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [customCounter, setCustomCounter] = useState('');
  const [isBargaining, setIsBargaining] = useState(false);
  const [bargainTrace, setBargainTrace] = useState<string[]>([]);
  const [bargainFinished, setBargainFinished] = useState(false);

  const handleCategoryPress = (category: string) => {
    navigation.navigate('Search', { category });
  };

  const handleIgnoreLead = (id: string) => {
    setActiveLeads(prev => prev.filter(lead => lead.id !== id));
  };

  const handleOpenBidOptions = (lead: InDriveLead) => {
    setSelectedLead(lead);
    setCustomCounter(lead.price.toString());
    setBargainFinished(false);
    setBargainTrace([]);
    setShowCounterModal(true);
  };

  const runBargainingNegotiation = async (targetPrice: number) => {
    if (!selectedLead) return;
    setIsBargaining(true);
    setBargainTrace([]);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      setBargainTrace(['[LinguisticAgent] Parsing driver counter-offer...']);
      await delay(800);
      
      setBargainTrace(prev => [...prev, `[BiddingAgent] Offering ${targetPrice} PKR to Client ${selectedLead.clientName}'s representative...`]);
      await delay(1000);

      // Simple ZOPA math simulation: Client will accept if difference is reasonable, else settle in between
      const clientTarget = selectedLead.price;
      const proposedDiff = targetPrice - clientTarget;
      let finalPrice = targetPrice;

      if (proposedDiff > 0) {
        // AI locks a compromise inside the ZOPA range
        finalPrice = Math.round(clientTarget + (proposedDiff * 0.6));
        setBargainTrace(prev => [...prev, `[ZOPA Engine] Client representative counter-proposed. Settlecompromise found...`]);
        await delay(800);
        setBargainTrace(prev => [...prev, `[ZOPA Engine] Compromise agreed at: ${finalPrice} PKR!`]);
      } else {
        setBargainTrace(prev => [...prev, `[ZOPA Engine] Client accepted offered baseline directly: ${finalPrice} PKR!`]);
      }
      
      await delay(900);
      setBargainTrace(prev => [...prev, `[EscrowAgent] Locked: ${finalPrice} PKR placed successfully inside secure AI Escrow! 🔒`]);
      await delay(700);

      setIsBargaining(false);
      setBargainFinished(true);

      // Add to escrow wallet balance
      setEscrowBalance(prev => prev + finalPrice);

      // Remove from feed after short delay
      setTimeout(() => {
        setActiveLeads(prev => prev.filter(lead => lead.id !== selectedLead.id));
        setShowCounterModal(false);
        setSelectedLead(null);
      }, 1500);

    } catch (err) {
      setIsBargaining(false);
      Alert.alert('Negotiation Timeout', 'AI bargaining system busy. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      {/* Header section */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerBranding}>
          <Text style={[styles.headerSubtitle, { color: userRole === 'client' ? colors.primary : colors.success }]}>
            {userRole === 'client' ? t.homeSubtitleClient : t.homeSubtitleWorker}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {userRole === 'client' ? t.homeTitleClient : t.homeTitleWorker}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: userRole === 'client' ? colors.primary : colors.success }}>
              {language === 'en' ? 'اردو' : 'EN'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginLeft: 8 }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} 
              size={20} 
              color={userRole === 'client' ? colors.primary : colors.success} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {userRole === 'client' ? (
          <>
            {/* CLIENT DASHBOARD PERSPECTIVE */}
            <View style={[styles.heroCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroBadge}>{t.heroBadge}</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>{t.heroTitle}</Text>
                <Text style={[styles.heroDescription, { color: colors.textMuted }]}>{t.heroDescription}</Text>
              </View>
              <View style={[styles.heroGlow, { backgroundColor: colors.primary }]} />
            </View>

            {/* InDrive inspired big dynamic prompt trigger button */}
            <TouchableOpacity 
              style={[styles.searchBarTrigger, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={18} color={colors.primary} style={styles.searchIcon} />
              <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>{t.searchPlaceholder}</Text>
              <View style={[styles.arrowIconWrapper, { backgroundColor: colors.primary }]}>
                <Ionicons name="arrow-forward" size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Service Categories grid */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.selectCategory}</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>{t.selectCategorySub}</Text>
            </View>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name={category.icon as any} size={22} color={colors.primary} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted }]}>{category.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Google Antigravity Brand Credit */}
            <View style={[styles.pipelineExplanationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.pipelineTitle, { color: colors.text }]}>{t.poweredBy}</Text>
              <Text style={styles.pipelineSubtitle}>{t.howSubagentsSecure}</Text>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberWrapper}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}>
                  <Text style={[styles.boldText, { color: colors.text }]}>Linguistic Agent</Text>: decodes dynamic Roman Urdu/English intents instantly.
                </Text>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberWrapper}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}>
                  <Text style={[styles.boldText, { color: colors.text }]}>GeoMatcher Agent</Text>: scans 2km radius matching available workers.
                </Text>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberWrapper}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}>
                  <Text style={[styles.boldText, { color: colors.text }]}>Bidding Agent</Text>: auto-negotiates optimal prices on overlapping ZOPA boundaries.
                </Text>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberWrapper}>
                  <Text style={styles.stepNumber}>4</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}>
                  <Text style={[styles.boldText, { color: colors.text }]}>Escrow Agent</Text>: locks milestone security inside safe digital vault.
                </Text>
              </View>

              <View style={[styles.stepRow, { marginBottom: 0 }]}>
                <View style={styles.stepNumberWrapper}>
                  <Text style={styles.stepNumber}>5</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}>
                  <Text style={[styles.boldText, { color: colors.text }]}>FollowUp Agent</Text>: delivers NADRA & police-clearance updates via SMS.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* ────────────────────────────────────────────────────────────────────────
                INDRIVE-STYLE SKILLED WORKER PORTAL DASHBOARD
                ──────────────────────────────────────────────────────────────────────── */}
            
            {/* Online / Offline Status Toggle Banner */}
            <View style={[
              styles.onlineStatusRow, 
              { 
                backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
                borderColor: isOnline ? colors.success : colors.danger 
              }
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.danger }]} />
                <Text style={[styles.onlineStatusText, { color: colors.text }]} numberOfLines={1}>
                  {isOnline 
                    ? (language === 'en' ? 'ONLINE • Scanning G-13 for leads' : 'آن لائن • سیکٹر G-13 میں نوکریاں تلاش کی جا رہی ہیں') 
                    : (language === 'en' ? 'OFFLINE • Tapped to pause matches' : 'آف لائن • نئی جابز بند ہیں')
                  }
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.onlineToggleBtn, { backgroundColor: isOnline ? colors.success : colors.border }]} 
                onPress={() => setIsOnline(!isOnline)}
                activeOpacity={0.8}
              >
                <Text style={styles.onlineToggleBtnText}>
                  {isOnline ? (language === 'en' ? 'PAUSE' : 'روکیں') : (language === 'en' ? 'GO LIVE' : 'شروع کریں')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Earnings & Escrows Dashboard Card */}
            <View style={styles.earningsDashboardRow}>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.earningMiniLabel, { color: colors.textMuted }]}>
                  {language === 'en' ? 'ACTIVE ESCROW' : 'فعال ایسکرو رقم'}
                </Text>
                <Text style={[styles.earningMiniVal, { color: colors.success }]}>
                  {escrowBalance.toLocaleString()} PKR
                </Text>
              </View>
              <View style={[styles.earningMiniCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Text style={[styles.earningMiniLabel, { color: colors.textMuted }]}>
                  {language === 'en' ? 'TOTAL EARNED' : 'کل کمائی'}
                </Text>
                <Text style={[styles.earningMiniVal, { color: colors.primary }]}>
                  48,600 PKR
                </Text>
              </View>
            </View>

            {/* Verification & Trust Badge */}
            <View style={[styles.nadraTrustBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} style={{ marginRight: 8 }} />
              <Text style={[styles.nadraTrustText, { color: colors.text }]}>
                {language === 'en' 
                  ? 'Tasdeeq Verified Provider • NADRA CNIC & Police Approved' 
                  : 'تصدیق شدہ فراہم کنندہ • نادرا شناختی کارڈ اور پولیس کلیئرنس منظور شدہ'
                }
              </Text>
            </View>

            {/* Live Leads Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {language === 'en' ? 'InDrive Live Leads Feed' : 'ان ڈرائیو لائیو لیڈز فیڈ'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                {language === 'en' 
                  ? 'Swipe, ignore or submit custom bargains in real-time' 
                  : 'حقیقی وقت میں کسٹمرز کے ساتھ اپنی مرضی کی قیمت پر ڈیل طے کریں'
                }
              </Text>
            </View>

            {!isOnline ? (
              <View style={[styles.offlinePlaceholder, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Ionicons name="eye-off-outline" size={44} color={colors.textMuted} />
                <Text style={[styles.offlinePlaceholderTitle, { color: colors.text }]}>
                  {language === 'en' ? 'You are Offline' : 'آپ آف لائن ہیں'}
                </Text>
                <Text style={[styles.offlinePlaceholderDesc, { color: colors.textMuted }]}>
                  {language === 'en' 
                    ? 'Turn your status to ONLINE from the top bar to scan available neighborhood gigs.' 
                    : 'محلے کی نئی نوکریاں دیکھنے کے لیے سب سے اوپر والے بٹن سے آن لائن ہو جائیں۔'
                  }
                </Text>
              </View>
            ) : activeLeads.length === 0 ? (
              <View style={[styles.offlinePlaceholder, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <Ionicons name="checkmark-done-circle-outline" size={44} color={colors.success} />
                <Text style={[styles.offlinePlaceholderTitle, { color: colors.text }]}>
                  {language === 'en' ? 'All Caught Up!' : 'سب جابز مکمل!'}
                </Text>
                <Text style={[styles.offlinePlaceholderDesc, { color: colors.textMuted }]}>
                  {language === 'en' 
                    ? 'Scan completed successfully. New customer requests will appear in real-time.' 
                    : 'نیا کام آتے ہی آپ کو فوری نوٹیفیکیشن بھیج دیا جائے گا۔'
                  }
                </Text>
              </View>
            ) : (
              activeLeads.map((lead) => (
                <View 
                  key={lead.id} 
                  style={[styles.inDriveCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                >
                  {/* Lead Category Badge & Distance */}
                  <View style={styles.leadHeaderRow}>
                    <View style={styles.leadLabelWrapper}>
                      <View style={[styles.leadIconCircle, { backgroundColor: colors.successLight }]}>
                        <Ionicons name={lead.icon as any} size={14} color={colors.success} />
                      </View>
                      <Text style={[styles.leadCategoryName, { color: colors.text }]}>{lead.category}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="navigate-outline" size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.leadDistance, { color: colors.textMuted }]}>{lead.distance}</Text>
                    </View>
                  </View>

                  {/* Customer natural language request */}
                  <Text style={[styles.leadClientQuote, { color: colors.text }]}>
                    {lead.description}
                  </Text>

                  {/* Pricing row & rating */}
                  <View style={styles.leadPricingRow}>
                    <View>
                      <Text style={[styles.leadPriceLabel, { color: colors.textMuted }]}>
                        {language === 'en' ? 'CLIENT OFFERED PRICE' : 'گاہک کی پیشکش کردہ قیمت'}
                      </Text>
                      <Text style={[styles.leadPriceVal, { color: colors.success }]}>
                        {lead.price.toLocaleString()} PKR
                      </Text>
                    </View>
                    <View style={[styles.leadMatchBadge, { backgroundColor: colors.successLight }]}>
                      <Text style={[styles.leadMatchText, { color: colors.success }]}>
                        {lead.matchRating}% Match
                      </Text>
                    </View>
                  </View>

                  {/* InDrive Interaction Buttons */}
                  <View style={styles.inDriveActionRow}>
                    <TouchableOpacity 
                      style={[styles.ignoreBtn, { borderColor: colors.border }]}
                      onPress={() => handleIgnoreLead(lead.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.ignoreBtnText, { color: colors.textMuted }]}>
                        {language === 'en' ? 'Ignore' : 'چھوڑیں'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.negotiateBtn, { backgroundColor: colors.success }]}
                      onPress={() => handleOpenBidOptions(lead)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.negotiateBtnText}>
                        {language === 'en' ? 'Accept / Bid' : 'قبول / بولی'}
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#ffffff" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}


          </>
        )}

      </ScrollView>

      {/* ────────────────────────────────────────────────────────────────────────
          INDRIVE MULTIPLIERS COUNTER BID MODAL
          ──────────────────────────────────────────────────────────────────────── */}
      {selectedLead && (
        <Modal
          visible={showCounterModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCounterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              
              {/* Modal Drag Indicator */}
              <View style={[styles.dragBar, { backgroundColor: colors.border }]} />

              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === 'en' ? 'Counter Bid Offer' : 'بولی کی پیشکش کریں'}
                </Text>
                <TouchableOpacity onPress={() => setShowCounterModal(false)}>
                  <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!isBargaining && !bargainFinished ? (
                <>
                  <Text style={[styles.modalLeadDesc, { color: colors.textMuted }]}>
                    {selectedLead.description}
                  </Text>

                  <View style={styles.modalClientPriceRow}>
                    <Text style={[styles.modalPriceLabel, { color: colors.textMuted }]}>
                      {language === 'en' ? 'Client Budget:' : 'گاہک کا بجٹ:'}
                    </Text>
                    <Text style={[styles.modalPriceValue, { color: colors.text }]}>
                      {selectedLead.price} PKR
                    </Text>
                  </View>

                  {/* Predefined InDrive Multiplier Pills */}
                  <Text style={[styles.quickCounterTitle, { color: colors.text }]}>
                    {language === 'en' ? 'Select Predefined Settle Offer:' : 'طے شدہ قیمت کا انتخاب کریں:'}
                  </Text>

                  <View style={styles.multipliersGrid}>
                    <TouchableOpacity 
                      style={[styles.multiplierPill, { backgroundColor: colors.successLight, borderColor: colors.success }]}
                      onPress={() => runBargainingNegotiation(selectedLead.price)}
                    >
                      <Text style={[styles.multiplierLabel, { color: colors.success }]}>
                        {language === 'en' ? 'Accept' : 'قبول کریں'}
                      </Text>
                      <Text style={[styles.multiplierVal, { color: colors.success }]}>
                        {selectedLead.price} PKR
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.multiplierPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                      onPress={() => runBargainingNegotiation(selectedLead.price + 200)}
                    >
                      <Text style={[styles.multiplierLabel, { color: colors.primary }]}>+200 PKR</Text>
                      <Text style={[styles.multiplierVal, { color: colors.primary }]}>
                        {selectedLead.price + 200} PKR
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.multiplierPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                      onPress={() => runBargainingNegotiation(selectedLead.price + 400)}
                    >
                      <Text style={[styles.multiplierLabel, { color: colors.primary }]}>+400 PKR</Text>
                      <Text style={[styles.multiplierVal, { color: colors.primary }]}>
                        {selectedLead.price + 400} PKR
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.multiplierPill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                      onPress={() => runBargainingNegotiation(selectedLead.price + 600)}
                    >
                      <Text style={[styles.multiplierLabel, { color: colors.primary }]}>+600 PKR</Text>
                      <Text style={[styles.multiplierVal, { color: colors.primary }]}>
                        {selectedLead.price + 600} PKR
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Custom Counter Bid Input */}
                  <Text style={[styles.quickCounterTitle, { color: colors.text, marginTop: 16 }]}>
                    {language === 'en' ? 'Or Enter Custom Price Target:' : 'یا اپنی مرضی کا ریٹ درج کریں:'}
                  </Text>
                  <View style={[styles.customInputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.customBidInput, { color: colors.text }]}
                      keyboardType="numeric"
                      value={customCounter}
                      onChangeText={setCustomCounter}
                      placeholder="e.g. 2900"
                      placeholderTextColor={colors.textMuted}
                    />
                    <Text style={[styles.customBidPkr, { color: colors.textMuted }]}>PKR</Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.modalSubmitBtn, { backgroundColor: colors.success }]}
                    onPress={() => runBargainingNegotiation(parseInt(customCounter) || selectedLead.price)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="sparkles" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.modalSubmitBtnText}>
                      {language === 'en' ? 'Launch Agent Negotiation' : 'خودکار مذاکرات شروع کریں'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : isBargaining ? (
                <View style={styles.bargainProgressWrapper}>
                  <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 20 }} />
                  <Text style={[styles.bargainingTitle, { color: colors.text }]}>
                    {language === 'en' ? 'Negotiating with Client representative...' : 'گاہک سے خودکار بات چیت جاری ہے...'}
                  </Text>

                  {/* Console traces */}
                  <View style={styles.bargainConsole}>
                    {bargainTrace.map((line, idx) => (
                      <Text key={idx} style={styles.consoleLineText}>{line}</Text>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.bargainProgressWrapper}>
                  <Ionicons name="checkmark-circle" size={56} color={colors.success} style={{ marginBottom: 12 }} />
                  <Text style={[styles.bargainingTitle, { color: colors.success, fontSize: 18, fontWeight: 'bold' }]}>
                    {language === 'en' ? 'BID ACCEPTED & ESCROW LOCKED!' : 'پیشکش قبول اور رقم والٹ میں محفوظ!'}
                  </Text>
                  <Text style={[styles.bargainSuccessSub, { color: colors.textMuted }]}>
                    {language === 'en' 
                      ? 'Milestone security is verified. Routing follow-up instructions to client via SMS.' 
                      : 'سیکورٹی رقم والٹ میں لاک ہو چکی ہے۔ گاہک کو تصدیقی ایس ایم ایس بھیج دیا گیا ہے۔'
                    }
                  </Text>
                </View>
              )}

            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerBranding: {
    flexDirection: 'column',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  themeBtn: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTextContent: {
    zIndex: 1,
  },
  heroBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: '#6366f1',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#6366f1',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    lineHeight: 26,
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  heroGlow: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.15,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
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
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: COLUMN_WIDTH,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  pipelineExplanationCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  pipelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pipelineSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumberWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 0.5,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  stepNumber: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  boldText: {
    fontWeight: 'bold',
  },

  /* ────────────────────────────────────────────────────────────────────────
     INDRIVE WORKER DASHBOARD STYLES
     ──────────────────────────────────────────────────────────────────────── */
  onlineStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  onlineStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  onlineToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  onlineToggleBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  earningsDashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  earningMiniCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 3,
  },
  earningMiniLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  earningMiniVal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nadraTrustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  nadraTrustText: {
    fontSize: 11,
    flex: 1,
    fontWeight: '500',
  },
  offlinePlaceholder: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  offlinePlaceholderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  offlinePlaceholderDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* InDrive Card layout */
  inDriveCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  leadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  leadCategoryName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  leadDistance: {
    fontSize: 11,
    fontWeight: '500',
  },
  leadClientQuote: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  leadPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leadPriceLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  leadPriceVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  leadMatchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leadMatchText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  inDriveActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ignoreBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ignoreBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  negotiateBtn: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  negotiateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  /* Multipliers Counter Bid Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalLeadDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  modalClientPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    marginBottom: 16,
  },
  modalPriceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickCounterTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  multipliersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  multiplierPill: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  multiplierLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  multiplierVal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  customBidInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  customBidPkr: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  /* Bargaining simulation */
  bargainProgressWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bargainingTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  bargainConsole: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  consoleLineText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#00ff00',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  bargainSuccessSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
