// GigConnect AI / screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, BookingDetails } from '../ThemeContext';
import { API_BASE_URL } from '../config';

interface JobRecord {
  id: string;
  parsed: {
    serviceType: string;
    location: string;
    time: string;
    budget: number;
  };
  providers: any[];
  bid?: {
    action: string;
    agreed_price: number;
    provider_min: number;
    client_budget: number;
  };
  escrow?: {
    escrow_id: string;
    booking_id: string;
    total: number;
    fee: number;
    fee_rate_pct: number;
    net_to_provider: number;
    status: string;
  };
  status: string;
  created_at: string;
}

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const { colors, theme, userRole, language, activeBooking, setActiveBooking } = useTheme();

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [newDate, setNewDate] = useState('20 May 2026');
  const [newTime, setNewTime] = useState('2:00 PM');
  const [cancelReason, setCancelReason] = useState('');

  // Fetch SQLite History
  const fetchHistory = async (showRefresher = false) => {
    if (showRefresher) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }
      const result = await response.json();
      
      const filtered = (result.jobs || []).filter((j: any) => {
        if (userRole === 'client') {
          return true;
        } else {
          return j.provider_id_assigned === 'p1' || j.provider_id_assigned === 'p4' || j.provider_id_assigned?.startsWith('GPLACE');
        }
      });
      setJobs(filtered);
    } catch (err: any) {
      console.log('API Fetch failed or offline, showing local mocks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userRole]);

  // Handler: Reschedule Booking
  const handleReschedule = () => {
    if (!activeBooking) return;
    
    const updated: BookingDetails = {
      ...activeBooking,
      date: newDate,
      time: newTime,
      timelineLogs: [
        ...activeBooking.timelineLogs,
        { title: `Booking rescheduled to ${newDate} at ${newTime}`, time: '19 May, 4:18 PM', done: true }
      ]
    };
    setActiveBooking(updated);
    setRescheduleVisible(false);
    Alert.alert('Rescheduled', 'Your booking appointment was rescheduled successfully.');
  };

  // Handler: Cancel Booking
  const handleCancel = () => {
    if (!activeBooking) return;

    const updated: BookingDetails = {
      ...activeBooking,
      status: 'Cancelled',
      timelineLogs: [
        ...activeBooking.timelineLogs,
        { title: `Booking cancelled: ${cancelReason || 'Client request'}`, time: '19 May, 4:19 PM', done: true }
      ]
    };
    setActiveBooking(updated);
    setCancelVisible(false);
    Alert.alert('Cancelled', 'Your booking was cancelled and the escrow funds have been refunded to your wallet.');
  };

  // Handler: Advance active booking progress steps (Simulation)
  const advanceProgressStep = () => {
    if (!activeBooking) return;
    
    const logs = [...activeBooking.timelineLogs];
    let nextStatus: BookingDetails['status'] = activeBooking.status;

    if (activeBooking.status === 'Pending') {
      nextStatus = 'Accepted';
      logs[1] = { title: 'Accepted by service professional', time: '19 May, 4:15 PM', done: true };
    } else if (activeBooking.status === 'Accepted') {
      nextStatus = 'In progress';
      logs[2] = { title: 'Technician en route & working', time: '19 May, 4:16 PM', done: true };
    } else if (activeBooking.status === 'In progress') {
      nextStatus = 'Completed';
      logs[3] = { title: 'Job Completed successfully', time: '19 May, 4:17 PM', done: true };
    }

    setActiveBooking({
      ...activeBooking,
      status: nextStatus,
      timelineLogs: logs,
    });
  };

  // Handler: Release Escrow Payment
  const releaseEscrow = () => {
    if (!activeBooking) return;

    setActiveBooking({
      ...activeBooking,
      escrowReleased: true,
    });
    Alert.alert(
      '🔒 Escrow Funds Released',
      `PKR ${activeBooking.provider.base_cost || 1500} released securely to ${activeBooking.provider.name}!`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#090d16' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      {/* Dynamic role-aware Header */}
      <View style={[styles.header, {
        borderBottomColor: userRole === 'provider' ? '#10b981' : '#1e293b',
      }]}>
        <View>
          <Text style={[styles.headerSub, {
            color: userRole === 'provider' ? '#10b981' : '#6366f1',
          }]}>
            {userRole === 'provider'
              ? (language === 'en' ? 'WORKER PORTAL' : 'ورکر پورٹل')
              : (language === 'en' ? 'CLIENT PORTAL' : 'کلائنٹ پورٹل')}
          </Text>
          <Text style={styles.headerTitle}>
            {userRole === 'provider'
              ? (language === 'en' ? 'My Escrow Ledger' : 'میرا ایسکرو لیجر')
              : (language === 'en' ? 'My Bookings' : 'میری بکنگز')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, { borderColor: '#1e293b' }]}
          onPress={() => fetchHistory(true)}
        >
          <Ionicons name="refresh-outline" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchHistory(true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── WORKER ESCROW VIEW ────────────────────────────────── */}
        {userRole === 'provider' && (
          <View style={styles.workerEscrowSection}>
            <Text style={styles.sectionHeader}>
              {language === 'en' ? '💼 Active Job Escrows' : '💼 فعال ایسکرو جابز'}
            </Text>

            {activeBooking && activeBooking.status !== 'Cancelled' ? (
              <View style={styles.workerJobCard}>
                {/* Job Header */}
                <View style={styles.workerJobTop}>
                  <View style={styles.workerServiceBadge}>
                    <Text style={styles.workerServiceBadgeText}>{activeBooking.service}</Text>
                  </View>
                  <View style={[styles.workerStatusPill, {
                    borderColor: activeBooking.status === 'Completed' ? '#10b981' :
                      activeBooking.status === 'Accepted' ? '#6366f1' : '#f59e0b'
                  }]}>
                    <Text style={[styles.workerStatusText, {
                      color: activeBooking.status === 'Completed' ? '#10b981' :
                        activeBooking.status === 'Accepted' ? '#6366f1' : '#f59e0b'
                    }]}>{activeBooking.status}</Text>
                  </View>
                </View>

                {/* Client info */}
                <View style={styles.workerClientRow}>
                  <Ionicons name="person-circle-outline" size={20} color="#6366f1" />
                  <Text style={styles.workerClientName}>
                    {activeBooking.provider?.name !== 'You (Worker)'
                      ? activeBooking.provider?.name
                      : (language === 'en' ? 'Client Request' : 'گاہک کی درخواست')}
                  </Text>
                </View>

                <View style={styles.workerClientRow}>
                  <Ionicons name="location-outline" size={16} color="#64748b" />
                  <Text style={styles.workerClientMeta}>{activeBooking.address}</Text>
                </View>

                {/* Earnings breakdown */}
                <View style={styles.earningsBox}>
                  <View style={styles.earningsRow}>
                    <Text style={styles.earningsLabel}>
                      {language === 'en' ? 'Agreed Price' : 'طے شدہ قیمت'}
                    </Text>
                    <Text style={styles.earningsValue}>1,500 PKR</Text>
                  </View>
                  <View style={styles.earningsRow}>
                    <Text style={styles.earningsLabel}>
                      {language === 'en' ? 'Platform Fee (5%)' : 'پلیٹ فارم فیس (5%)'}
                    </Text>
                    <Text style={[styles.earningsValue, { color: '#ef4444' }]}>-75 PKR</Text>
                  </View>
                  <View style={[styles.earningsRow, styles.earningsTotal]}>
                    <Text style={styles.earningsTotalLabel}>
                      {language === 'en' ? 'YOU RECEIVE' : 'آپ کو ملے گا'}
                    </Text>
                    <Text style={styles.earningsTotalValue}>1,425 PKR</Text>
                  </View>
                </View>

                {/* Timeline */}
                <Text style={styles.timelineHeader}>
                  {language === 'en' ? 'Job Timeline' : 'کام کا ٹائم لائن'}
                </Text>
                {activeBooking.timelineLogs.map((log, idx) => (
                  <View key={idx} style={styles.workerTimelineRow}>
                    <View style={[styles.workerTimelineDot, {
                      backgroundColor: log.done ? '#10b981' : '#1e293b',
                    }]}>
                      {log.done && <Ionicons name="checkmark" size={10} color="#fff" />}
                    </View>
                    <View style={styles.workerTimelineContent}>
                      <Text style={[styles.workerTimelineTitle, log.done && { color: '#fff' }]}>
                        {log.title}
                      </Text>
                      <Text style={styles.workerTimelineTime}>{log.time}</Text>
                    </View>
                  </View>
                ))}

                {/* Worker actions */}
                <View style={styles.workerActions}>
                  {activeBooking.status !== 'Completed' && (
                    <TouchableOpacity
                      style={styles.advanceBtn}
                      onPress={advanceProgressStep}
                    >
                      <Ionicons name="arrow-forward-circle-outline" size={16} color="#fff" />
                      <Text style={styles.advanceBtnText}>
                        {language === 'en' ? 'Advance Status' : 'اسٹیٹس آگے بڑھائیں'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {activeBooking.status === 'Completed' && !activeBooking.escrowReleased && (
                    <View style={styles.escrowPendingNote}>
                      <Ionicons name="time-outline" size={16} color="#f59e0b" />
                      <Text style={styles.escrowPendingText}>
                        {language === 'en'
                          ? 'Waiting for client to release escrow payment...'
                          : 'گاہک کے ایسکرو جاری کرنے کا انتظار ہے...'}
                      </Text>
                    </View>
                  )}
                  {activeBooking.escrowReleased && (
                    <View style={styles.escrowReleasedBanner}>
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      <Text style={styles.escrowReleasedBannerText}>
                        {language === 'en' ? '1,425 PKR credited to your wallet!' : '1,425 روپے آپ کے والیٹ میں!'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.workerEmptyCard}>
                <Ionicons name="wallet-outline" size={40} color="#334155" />
                <Text style={styles.workerEmptyText}>
                  {language === 'en'
                    ? 'No active escrows. Accept a job from the Leads tab.'
                    : 'کوئی فعال ایسکرو نہیں۔ Leads ٹیب سے کام قبول کریں۔'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── CLIENT ACTIVE BOOKING TRACKER ─────────────────────── */}
        {userRole === 'client' && activeBooking && activeBooking.status !== 'Cancelled' && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionHeader}>⚠️ Active Tracking Timeline</Text>
            
            <View style={styles.activeCard}>
              <View style={styles.cardTop}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.serviceTag}>{activeBooking.service}</Text>
                  <Text style={styles.workerName}>{activeBooking.provider.name}</Text>
                </View>
                <View style={[styles.badge, styles.activeBadge]}>
                  <Text style={styles.badgeTxt}>{activeBooking.status}</Text>
                </View>
              </View>

              <Text style={styles.metaTime}>
                📅 Scheduled: {activeBooking.date} • {activeBooking.time}
              </Text>

              {/* Progress Timeline Grid */}
              <View style={styles.timelineContainer}>
                {activeBooking.timelineLogs.map((log, idx) => (
                  <View key={`log-${idx}`} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.bulletDot,
                        log.done ? { backgroundColor: '#10b981' } : { backgroundColor: '#334155' }
                      ]} />
                      {idx < activeBooking.timelineLogs.length - 1 && (
                        <View style={[
                          styles.bulletLine,
                          log.done ? { backgroundColor: '#10b981' } : { backgroundColor: '#334155' }
                        ]} />
                      )}
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={[styles.timelineLogTitle, log.done ? { color: '#fff' } : { color: '#475569' }]}>
                        {log.title}
                      </Text>
                      <Text style={styles.timelineLogTime}>{log.time}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Progress and Call Actions */}
              {activeBooking.status !== 'Completed' && (
                <View style={styles.timelineControlRow}>
                  <TouchableOpacity
                    style={[styles.controlBtn, { backgroundColor: colors.primary }]}
                    onPress={advanceProgressStep}
                  >
                    <Text style={styles.controlBtnText}>
                      {activeBooking.status === 'Pending' && 'Accept Job (Sim)'}
                      {activeBooking.status === 'Accepted' && 'Mark En Route (Sim)'}
                      {activeBooking.status === 'In progress' && 'Complete Work (Sim)'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: '#334155' }]}
                    onPress={() => setRescheduleVisible(true)}
                  >
                    <Text style={styles.outlineBtnText}>Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: '#f43f5e' }]}
                    onPress={() => setCancelVisible(true)}
                  >
                    <Text style={[styles.outlineBtnText, { color: '#f43f5e' }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Release Escrow trigger */}
              {activeBooking.status === 'Completed' && (
                <View style={styles.escrowContainer}>
                  {activeBooking.escrowReleased ? (
                    <View style={styles.escrowReleasedRow}>
                      <Ionicons name="lock-open-outline" size={20} color="#10b981" />
                      <Text style={styles.escrowReleasedText}>Payment Released to Provider Wallet</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.escrowBtn, { backgroundColor: '#10b981' }]}
                      onPress={releaseEscrow}
                    >
                      <Text style={styles.escrowBtnText}>🔓 Release Escrow Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* COMPLETED GIGS OR HISTORY SECTION */}
        <Text style={styles.sectionHeader}>📜 Escrow History Ledgers</Text>
        
        {jobs.map((item) => {
          const totalCost = item.escrow?.total || item.bid?.agreed_price || item.parsed?.budget || 0;
          return (
            <View key={item.id} style={styles.jobCard}>
              <View style={styles.cardHeader}>
                <View style={styles.serviceCol}>
                  <Text style={styles.serviceTitle}>{item.parsed?.serviceType}</Text>
                  <Text style={styles.jobDate}>JOB ID: {item.id}</Text>
                </View>
                <View style={[styles.badge, styles.closedBadge]}>
                  <Text style={styles.badgeTxt}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.jobDetailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>LOCATION</Text>
                  <Text style={styles.detailVal}>{item.parsed?.location || 'Islamabad'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>BUDGET</Text>
                  <Text style={styles.detailVal}>{totalCost} PKR</Text>
                </View>
              </View>
            </View>
          );
        })}

        {jobs.length === 0 && !activeBooking && (
          <View style={styles.emptyCard}>
            <Ionicons name="clipboard-outline" size={48} color="#475569" />
            <Text style={styles.emptyTitle}>No Bookings Active</Text>
            <Text style={styles.emptySubtitle}>
              Please describe what service you need in the search/chat screen to initiate a job match.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={rescheduleVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reschedule Booking</Text>
            
            <Text style={styles.inputLabel}>New Date</Text>
            <TextInput
              style={styles.modalInput}
              value={newDate}
              onChangeText={setNewDate}
              placeholder="e.g. 20 May 2026"
              placeholderTextColor="#475569"
            />

            <Text style={styles.inputLabel}>New Time Slot</Text>
            <TextInput
              style={styles.modalInput}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="e.g. 2:00 PM"
              placeholderTextColor="#475569"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleReschedule}
              >
                <Text style={styles.modalBtnText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRescheduleVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal */}
      <Modal visible={cancelVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.modalDesc}>Are you sure you want to cancel? The locked escrow milestone will be immediately refunded.</Text>
            
            <Text style={styles.inputLabel}>Cancellation Reason</Text>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Reason for cancelling..."
              placeholderTextColor="#475569"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#f43f5e' }]}
                onPress={handleCancel}
              >
                <Text style={styles.modalBtnText}>Confirm Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCancelVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Keep Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  activeSection: {
    marginBottom: 28,
  },
  activeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrapper: {
    flex: 1,
  },
  serviceTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6366f1',
    letterSpacing: 0.5,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  closedBadge: {
    backgroundColor: 'rgba(71, 85, 105, 0.15)',
  },
  badgeTxt: {
    color: '#6366f1',
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaTime: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 20,
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  bulletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  bulletLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineLogTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineLogTime: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
  },
  timelineControlRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  controlBtn: {
    flex: 2,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  controlBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  outlineBtn: {
    flex: 1.2,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  outlineBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  escrowContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 16,
  },
  escrowBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escrowBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  escrowReleasedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 12,
    borderRadius: 10,
  },
  escrowReleasedText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 8,
  },
  jobCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceCol: {
    flex: 1,
  },
  serviceTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  jobDate: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
  },
  jobDetailsRow: {
    flexDirection: 'row',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: 'bold',
  },
  detailVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  modalDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalInput: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#090d16',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  modalCancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // ── Worker Escrow Section Styles ──────────────────────────────────
  workerEscrowSection: {
    marginBottom: 20,
  },
  workerJobCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 16,
  },
  workerJobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerServiceBadge: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  workerServiceBadgeText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workerStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  workerStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  workerClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  workerClientName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  workerClientMeta: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 8,
  },
  earningsBox: {
    backgroundColor: '#090d16',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginTop: 12,
    marginBottom: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  earningsLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  earningsValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  earningsTotal: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  earningsTotalLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  earningsTotalValue: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  workerTimelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workerTimelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 10,
  },
  workerTimelineContent: {
    flex: 1,
  },
  workerTimelineTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  workerTimelineTime: {
    color: '#334155',
    fontSize: 10,
    marginTop: 2,
  },
  workerActions: {
    marginTop: 14,
  },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 44,
  },
  advanceBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  escrowPendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
    padding: 12,
  },
  escrowPendingText: {
    color: '#f59e0b',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  escrowReleasedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 12,
  },
  escrowReleasedBannerText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  workerEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 30,
  },
  workerEmptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
