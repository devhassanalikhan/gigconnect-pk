// KaamGraph / screens/WorkerLeadsScreen.tsx
// Worker-exclusive screen: incoming job requests with creative accept flow + escrow auto-lock
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Alert, Animated, Modal, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, BookingDetails } from '../ThemeContext';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

interface IncomingRequest {
  id: string;
  clientName: string;
  service: string;
  icon: string;
  location: string;
  budget: number;
  urgency: 'urgent' | 'normal' | 'flexible';
  description: string;
  distance: string;
  postedAgo: string;
}

const MOCK_REQUESTS: IncomingRequest[] = [
  {
    id: 'req-1', clientName: 'Hassan Ali', service: 'AC Technician', icon: 'snow-outline',
    location: 'G-13 Sector, Islamabad', budget: 2500, urgency: 'urgent',
    description: 'AC gas khatam ho gaya hai, subah tak fix karwana hai. 1.5 ton Samsung unit.',
    distance: '0.8 km', postedAgo: '3 min ago',
  },
  {
    id: 'req-2', clientName: 'Zainab Mirza', service: 'Electrician', icon: 'flash-outline',
    location: 'Tulsa Road, Rawalpindi', budget: 1800, urgency: 'urgent',
    description: 'Ghar ka main board trip kar raha hai, ek circuit bhi nahi chal raha.',
    distance: '1.4 km', postedAgo: '7 min ago',
  },
  {
    id: 'req-3', clientName: 'Bilal Khan', service: 'Plumber', icon: 'water-outline',
    location: 'Saddar, Rawalpindi', budget: 1200, urgency: 'normal',
    description: 'Kitchen sink ki pipe se paani nikal raha hai, moderate leak.',
    distance: '2.1 km', postedAgo: '12 min ago',
  },
];

type AcceptPhase = 'idle' | 'negotiating' | 'locking' | 'done';

export default function WorkerLeadsScreen() {
  const { language, setActiveBooking } = useTheme();

  const [requests, setRequests] = useState<IncomingRequest[]>(MOCK_REQUESTS);
  const [selectedReq, setSelectedReq] = useState<IncomingRequest | null>(null);
  const [acceptPhase, setAcceptPhase] = useState<AcceptPhase>('idle');
  const [finalPrice, setFinalPrice] = useState(0);
  const [agentTrace, setAgentTrace] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [escrowLocked, setEscrowLocked] = useState<{ reqId: string; price: number }[]>([]);

  // Pulse animation for urgent badge
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const openAcceptModal = (req: IncomingRequest) => {
    setSelectedReq(req);
    setAcceptPhase('idle');
    setAgentTrace([]);
    setFinalPrice(req.budget);
    setShowModal(true);
  };

  const handleAccept = async (req: IncomingRequest) => {
    setAcceptPhase('negotiating');
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    setAgentTrace(['[LinguisticAgent] Parsing job description & urgency level...']);
    await delay(700);
    setAgentTrace(p => [...p, `[GeoMatcher] Client ${req.distance} from your active zone. ✅`]);
    await delay(800);

    // ZOPA: worker accepts client budget or AI adds small margin
    const workerMin = req.budget;
    const zopaSettled = req.urgency === 'urgent'
      ? Math.round(req.budget * 1.12)
      : req.budget;
    setFinalPrice(zopaSettled);

    setAgentTrace(p => [...p, `[BiddingAgent] ZOPA analysis: Client ${req.budget} PKR → Settled at ${zopaSettled} PKR`]);
    await delay(900);

    setAcceptPhase('locking');
    setAgentTrace(p => [...p, `[EscrowAgent] Locking ${zopaSettled} PKR in secure vault... 🔒`]);
    await delay(1000);
    setAgentTrace(p => [...p, `[FollowUpAgent] SMS sent to ${req.clientName} ✅`]);
    await delay(600);

    // Add to active booking context
    const bookingId = `BK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newBooking: BookingDetails = {
      id: bookingId,
      provider: { name: 'You (Worker)', id: 'self' },
      service: req.service,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      address: req.location,
      issue: req.description,
      status: 'Accepted',
      timelineLogs: [
        { title: 'Job request received', time: req.postedAgo, done: true },
        { title: 'Bid accepted & escrow locked', time: 'Just now', done: true },
        { title: 'En route to client', time: '--:--', done: false },
        { title: 'Job completed', time: '--:--', done: false },
      ],
      escrowReleased: false,
    };
    setActiveBooking(newBooking);
    setEscrowLocked(p => [...p, { reqId: req.id, price: zopaSettled }]);

    setAcceptPhase('done');

    // Remove from feed after 2s
    setTimeout(() => {
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setShowModal(false);
      setSelectedReq(null);
      setAcceptPhase('idle');
    }, 2000);
  };

  const handleDecline = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const urgencyColor = (u: string) =>
    u === 'urgent' ? '#ef4444' : u === 'normal' ? '#f59e0b' : '#10b981';
  const urgencyLabel = (u: string) =>
    u === 'urgent' ? (language === 'en' ? '🔴 URGENT' : '🔴 فوری') :
    u === 'normal' ? (language === 'en' ? '🟡 NORMAL' : '🟡 عام') :
    (language === 'en' ? '🟢 FLEXIBLE' : '🟢 لچکدار');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>
            {language === 'en' ? 'WORKER PORTAL' : 'ورکر پورٹل'}
          </Text>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Live Job Requests' : 'لائیو جاب درخواستیں'}
          </Text>
        </View>
        <View style={styles.liveTag}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Escrow summary bar */}
      {escrowLocked.length > 0 && (
        <View style={styles.escrowBar}>
          <Ionicons name="lock-closed" size={14} color="#10b981" />
          <Text style={styles.escrowBarText}>
            {escrowLocked.length} {language === 'en' ? 'job(s) locked in Escrow' : 'کام ایسکرو میں محفوظ'} •{' '}
            {escrowLocked.reduce((s, e) => s + e.price, 0).toLocaleString()} PKR
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {requests.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={52} color="#10b981" />
            <Text style={styles.emptyTitle}>
              {language === 'en' ? 'All caught up!' : 'سب مکمل!'}
            </Text>
            <Text style={styles.emptySub}>
              {language === 'en'
                ? 'New job requests will appear here in real-time.'
                : 'نئی جاب درخواستیں یہاں فوری نظر آئیں گی۔'}
            </Text>
          </View>
        )}

        {requests.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={styles.serviceTag}>
                <Ionicons name={req.icon as any} size={14} color="#6366f1" />
                <Text style={styles.serviceTagText}>{req.service}</Text>
              </View>
              <View style={[styles.urgencyBadge, { borderColor: urgencyColor(req.urgency) }]}>
                <Text style={[styles.urgencyText, { color: urgencyColor(req.urgency) }]}>
                  {urgencyLabel(req.urgency)}
                </Text>
              </View>
            </View>

            {/* Client info */}
            <View style={styles.clientRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{req.clientName[0]}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.clientName}>{req.clientName}</Text>
                <Text style={styles.clientMeta}>📍 {req.location} • {req.distance}</Text>
              </View>
              <Text style={styles.postedAgo}>{req.postedAgo}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>"{req.description}"</Text>

            {/* Budget row */}
            <View style={styles.budgetRow}>
              <View>
                <Text style={styles.budgetLabel}>
                  {language === 'en' ? 'CLIENT BUDGET' : 'گاہک کا بجٹ'}
                </Text>
                <Text style={styles.budgetValue}>{req.budget.toLocaleString()} PKR</Text>
              </View>
              {req.urgency === 'urgent' && (
                <View style={styles.bonusTag}>
                  <Text style={styles.bonusText}>
                    +{Math.round(req.budget * 0.12).toLocaleString()} PKR {language === 'en' ? 'AI Bonus' : 'AI بونس'}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => handleDecline(req.id)}
              >
                <Ionicons name="close" size={16} color="#64748b" />
                <Text style={styles.declineBtnText}>
                  {language === 'en' ? 'Decline' : 'انکار'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => openAcceptModal(req)}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                <Text style={styles.acceptBtnText}>
                  {language === 'en' ? 'Accept & Lock Escrow' : 'قبول کریں و ایسکرو لاک'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Accept negotiation Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            {acceptPhase === 'idle' && selectedReq && (
              <>
                <Text style={styles.modalTitle}>
                  {language === 'en' ? 'Confirm Acceptance' : 'قبولیت کی تصدیق'}
                </Text>
                <Text style={styles.modalDesc}>
                  {language === 'en'
                    ? `Accept job from ${selectedReq.clientName}? AI will negotiate the best price and lock escrow automatically.`
                    : `${selectedReq.clientName} کی جاب قبول کریں؟ AI بہترین قیمت طے کر کے ایسکرو لاک کرے گا۔`}
                </Text>
                <View style={styles.modalBudgetRow}>
                  <Text style={styles.modalBudgetLabel}>Budget</Text>
                  <Text style={styles.modalBudgetVal}>{selectedReq.budget.toLocaleString()} PKR</Text>
                </View>
                <TouchableOpacity
                  style={styles.confirmAcceptBtn}
                  onPress={() => selectedReq && handleAccept(selectedReq)}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.confirmAcceptText}>
                    {language === 'en' ? 'Launch AI Negotiation' : 'AI مذاکرات شروع کریں'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelModalText}>
                    {language === 'en' ? 'Cancel' : 'منسوخ'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {(acceptPhase === 'negotiating' || acceptPhase === 'locking') && (
              <View style={styles.negotiatingView}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.negotiatingTitle}>
                  {acceptPhase === 'negotiating'
                    ? (language === 'en' ? 'AI Negotiating...' : 'AI مذاکرات جاری...')
                    : (language === 'en' ? 'Locking Escrow...' : 'ایسکرو لاک ہو رہا ہے...')}
                </Text>
                <View style={styles.traceBox}>
                  {agentTrace.map((line, i) => (
                    <Text key={i} style={styles.traceLine}>{line}</Text>
                  ))}
                </View>
              </View>
            )}

            {acceptPhase === 'done' && (
              <View style={styles.doneView}>
                <Ionicons name="shield-checkmark" size={60} color="#10b981" />
                <Text style={styles.doneTitle}>
                  {language === 'en' ? 'Escrow Locked!' : 'ایسکرو لاک!'}
                </Text>
                <Text style={styles.donePrice}>
                  {finalPrice.toLocaleString()} PKR {language === 'en' ? 'secured' : 'محفوظ'}
                </Text>
                <Text style={styles.doneSub}>
                  {language === 'en'
                    ? 'Check your Escrows tab for timeline & payment release.'
                    : 'ادائیگی کے لیے ایسکرو ٹیب چیک کریں۔'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  headerSub: { color: '#10b981', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 2 },
  liveTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#10b981',
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 6 },
  liveText: { color: '#10b981', fontSize: 11, fontWeight: 'bold' },
  escrowBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.08)',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  escrowBarText: { color: '#10b981', fontSize: 12, fontWeight: '600', marginLeft: 8 },
  scroll: { padding: 16, paddingBottom: 40 },
  emptyCard: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0f172a', borderRadius: 20,
    borderWidth: 1, borderColor: '#1e293b',
    padding: 40, marginTop: 30,
  },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptySub: { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  requestCard: {
    backgroundColor: '#0f172a', borderRadius: 20,
    borderWidth: 1, borderColor: '#1e293b',
    padding: 16, marginBottom: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  serviceTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.1)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#6366f1',
  },
  serviceTagText: { color: '#6366f1', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  urgencyBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  urgencyText: { fontSize: 10, fontWeight: 'bold' },
  clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  clientName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  clientMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  postedAgo: { color: '#475569', fontSize: 11 },
  description: {
    color: '#94a3b8', fontStyle: 'italic', fontSize: 13,
    lineHeight: 20, marginBottom: 14,
    backgroundColor: '#090d16', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#1e293b',
  },
  budgetRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  budgetLabel: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  budgetValue: { color: '#10b981', fontSize: 20, fontWeight: 'bold' },
  bonusTag: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10,
    borderWidth: 1, borderColor: '#ef4444',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  bonusText: { color: '#ef4444', fontSize: 11, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row' },
  declineBtn: {
    flexDirection: 'row', alignItems: 'center',
    flex: 1, height: 44, borderRadius: 10,
    borderWidth: 1, borderColor: '#1e293b',
    justifyContent: 'center', marginRight: 10,
  },
  declineBtnText: { color: '#64748b', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  acceptBtn: {
    flexDirection: 'row', alignItems: 'center',
    flex: 2.5, height: 44, borderRadius: 10,
    backgroundColor: '#10b981', justifyContent: 'center',
  },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  // Modal
  modalBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: '#1e293b', padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#334155', alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalDesc: { color: '#94a3b8', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  modalBudgetRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#090d16', borderRadius: 12,
    padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#1e293b',
  },
  modalBudgetLabel: { color: '#64748b', fontSize: 13 },
  modalBudgetVal: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  confirmAcceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#10b981', borderRadius: 14, height: 52, marginBottom: 12,
  },
  confirmAcceptText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cancelModalBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelModalText: { color: '#64748b', fontSize: 14 },
  negotiatingView: { alignItems: 'center', paddingVertical: 20 },
  negotiatingTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 16 },
  traceBox: {
    width: '100%', backgroundColor: '#000', borderRadius: 10,
    padding: 14, minHeight: 100,
  },
  traceLine: { color: '#10b981', fontSize: 11, fontFamily: 'monospace', marginBottom: 6 },
  doneView: { alignItems: 'center', paddingVertical: 20 },
  doneTitle: { color: '#10b981', fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  donePrice: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  doneSub: { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 },
});
