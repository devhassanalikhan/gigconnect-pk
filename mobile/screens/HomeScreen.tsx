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

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, theme, toggleTheme, userRole, toggleUserRole, language, toggleLanguage, t, selectedLocationIndex } = useTheme();

  const activeLocation = ISLAMABAD_SECTORS[selectedLocationIndex];
  const locName = language === 'en' ? activeLocation.name : activeLocation.urdu;

  const [isOnline, setIsOnline] = useState(true);
  const [escrowBalance, setEscrowBalance] = useState(12500);
  const [activeLeads, setActiveLeads] = useState<InDriveLead[]>([]);

  const fetchJobs = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`);
      const data = await res.json();
      
      const mockLeads = [
        {
          id: '1',
          category: 'AC Technician',
          icon: 'snow-outline',
          color: '#06b6d4',
          clientName: 'Hassan A.',
          description: `Mujhe kal subah ${locName} me urgent AC lagwana hai koi technician bhejo.`,
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
          description: `Main board me short circuit ho rha hai urgently electrician chahye ${locName}.`,
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
          description: `Kitchen tap leak kr rha hai, paani bohot zaya ho rha hai. Urgent help!`,
          distance: '2.1 km away',
          price: 1200,
          matchRating: 90,
        }
      ];

      if (data && data.jobs) {
        const mapped = data.jobs.map((job: any) => {
          const serviceType = job.parsed?.serviceType || 'Plumber';
          const budget = job.parsed?.budget || 2000;
          const location = job.parsed?.location || 'G-13';
          const confidence = job.parsed?.confidence ?? 1.0;
          
          let icon = 'construct-outline';
          let color = '#a78bfa';
          if (serviceType === 'Plumber') { icon = 'water-outline'; color = '#3b82f6'; }
          else if (serviceType === 'Electrician') { icon = 'flash-outline'; color = '#eab308'; }
          else if (serviceType === 'AC Technician') { icon = 'snow-outline'; color = '#06b6d4'; }
          else if (serviceType === 'Painter') { icon = 'brush-outline'; color = '#ec4899'; }
          else if (serviceType === 'Tutor') { icon = 'book-outline'; color = '#10b981'; }
          else if (serviceType === 'Carpenter') { icon = 'hammer-outline'; color = '#f97316'; }

          const shortId = job.id.startsWith('JOB-') ? job.id.slice(4, 9) : job.id.slice(0, 5);
          return {
            id: job.id,
            category: serviceType,
            icon: icon,
            color: color,
            clientName: `Client ${shortId}`,
            description: job.parsed?.text || `Requires experienced ${serviceType} at ${location}. Urgent: ${job.parsed?.time || 'yes'}.`,
            distance: '1.2 km away',
            price: budget,
            matchRating: Math.round(confidence * 100),
            status: job.status,
            fullJob: job
          };
        });

        const activeOnly = mapped.filter((j: any) => j.status === 'Searching' || j.status === 'Pending Clarification' || j.status === 'BidPlaced');
        setActiveLeads([...activeOnly, ...mockLeads]);
      } else {
        setActiveLeads(mockLeads);
      }
    } catch (e) {
      console.log('Error fetching jobs:', e);
    }
  }, [locName]);

  React.useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

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

      const clientTarget = selectedLead.price;
      const proposedDiff = targetPrice - clientTarget;
      let finalPrice = targetPrice;

      if (proposedDiff > 0) {
        finalPrice = Math.round(clientTarget + (proposedDiff * 0.6));
        setBargainTrace(prev => [...prev, `[ZOPA Engine] Client representative counter-proposed. Compromise found...`]);
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
      setEscrowBalance(prev => prev + finalPrice);

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

            {/* Leads Feed */}
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>{t.workerLeadsFeed}</Text>
            {!isOnline ? (
              <View style={[styles.inDriveCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, alignItems: 'center', paddingVertical: 30 }]}>
                <Ionicons name="eye-off-outline" size={36} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 10 }}>
                  {language === 'en' ? 'You are offline. Go live to see requests.' : 'آپ آف لائن ہیں۔ شروع کریں۔'}
                </Text>
              </View>
            ) : activeLeads.length === 0 ? (
              <View style={[styles.inDriveCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, alignItems: 'center', paddingVertical: 30 }]}>
                <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
                <Text style={{ color: colors.textMuted, marginTop: 10 }}>
                  {language === 'en' ? 'All caught up! New leads appear here live.' : 'سب ٹھیک ہے! نئی جابز جلد آئیں گی۔'}
                </Text>
              </View>
            ) : activeLeads.map((lead) => (
              <View key={lead.id} style={[styles.inDriveCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.leadHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.statusDot, { backgroundColor: colors.warning, marginRight: 8 }]} />
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{lead.category}</Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{lead.distance}</Text>
                </View>
                <Text style={{ color: colors.text, fontStyle: 'italic', marginVertical: 10, lineHeight: 20 }}>
                  "{lead.description}"
                </Text>
                <View style={styles.leadPricingRow}>
                  <View>
                    <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: 'bold' }}>
                      {language === 'en' ? 'CLIENT BUDGET' : 'گاہک کا بجٹ'}
                    </Text>
                    <Text style={{ color: colors.success, fontSize: 18, fontWeight: 'bold' }}>
                      {lead.price.toLocaleString()} PKR
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[styles.negotiateBtn, { backgroundColor: colors.border, marginRight: 8 }]}
                      onPress={() => handleIgnoreLead(lead.id)}
                    >
                      <Text style={[styles.negotiateBtnText, { color: colors.textMuted }]}>
                        {language === 'en' ? 'Skip' : 'چھوڑیں'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.negotiateBtn, { backgroundColor: colors.success }]}
                      onPress={() => handleOpenBidOptions(lead)}
                    >
                      <Text style={styles.negotiateBtnText}>{t.workerCounterOffer}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

      </ScrollView>

      {/* Counter bid negotiation Modal */}
      {selectedLead && (
        <Modal visible={showCounterModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.dragBar} />
              
              <View style={styles.modalHeaderRow}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>Counter Offer Bargaining</Text>
                <TouchableOpacity onPress={() => setShowCounterModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {!isBargaining && !bargainFinished ? (
                <View>
                  <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
                    Customer budget: {selectedLead.price} PKR. Suggest counter offer:
                  </Text>
                  <View style={styles.multipliersGrid}>
                    <TouchableOpacity style={[styles.multiplierPill, { backgroundColor: colors.border, borderColor: colors.border }]} onPress={() => runBargainingNegotiation(selectedLead.price + 100)}>
                      <Text style={{ color: colors.text }}>+100 PKR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.multiplierPill, { backgroundColor: colors.border, borderColor: colors.border }]} onPress={() => runBargainingNegotiation(selectedLead.price + 300)}>
                      <Text style={{ color: colors.text }}>+300 PKR</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : isBargaining ? (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ color: colors.text, marginTop: 12 }}>ZOPA Negotiation agent Bargaining...</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                  <Text style={{ color: colors.success, fontWeight: 'bold', marginTop: 10 }}>Bid Locked Successfully!</Text>
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
