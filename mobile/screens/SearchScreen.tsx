// KaamGraph / Mobile / mobile/screens/SearchScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useTheme, ISLAMABAD_SECTORS } from '../ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;
type SearchRouteProp = RouteProp<RootStackParamList, 'Search'>;

import { API_BASE_URL } from '../config';

interface AgentLog {
  agent: string;
  status: 'success' | 'error' | 'skipped' | 'running';
  message: string;
}

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchRouteProp>();
  const { colors, theme, language, selectedLocationIndex, setSelectedLocationIndex } = useTheme();
  
  const [requestText, setRequestText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [consoleLogs, setConsoleLogs] = useState<AgentLog[]>([]);
  const [result, setResult] = useState<any>(null);

  // ─── Pre-populate text if arriving from category selection ─────────────────────────
  useEffect(() => {
    if (route.params?.category) {
      const catName = route.params.category;
      setRequestText(`Mujhe ek experienced ${catName} chahye urgently.`);
    }
  }, [route.params?.category]);

  // ─── Trigger Pipeline Matching ─────────────────────────────────────────────────────
  const triggerMatching = async () => {
    if (!requestText.trim()) {
      Alert.alert('Empty Request', 'Kiya kaam karwana chahte hain? Please type your request first.');
      return;
    }

    setIsProcessing(true);
    setActiveStep(0);
    setConsoleLogs([
      { agent: 'System', status: 'running', message: 'Initializing Google Antigravity Orchestrator (agent_1778964020775)...' }
    ]);

    try {
      // Step 1 Simulation logs
      await delay(1000);
      setConsoleLogs(prev => [
        ...prev.map(log => log.agent === 'System' ? { ...log, status: 'success' as const, message: 'Orchestrator Initialized successfully.' } : log),
        { agent: 'LinguisticAgent', status: 'running', message: 'Parsing user natural language intent...' }
      ]);
      setActiveStep(1);

      const activeLoc = ISLAMABAD_SECTORS[selectedLocationIndex];
      const response = await fetch(`${API_BASE_URL}/api/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: requestText,
          user_lat: activeLoc.lat,
          user_lng: activeLoc.lng
        }),
      });

      if (!response.ok) {
        throw new Error(`Orchestration failed with server status: ${response.status}`);
      }

      const resultData = await response.json();
      setResult(resultData);
      
      // Extract agent trace entries from backend
      const traces = resultData.agent_trace || [];
      
      // Simulating step-by-step rendering for clean premium agent visual feel
      for (let i = 0; i < traces.length; i++) {
        const trace = traces[i];
        await delay(1200); // 1.2s delay per agent to let the user review the traces
        
        setConsoleLogs(prev => {
          // Complete previous running status
          const updated = prev.map(log => log.status === 'running' ? { ...log, status: 'success' as const } : log);
          return [
            ...updated,
            { 
              agent: trace.agent, 
              status: trace.status as any, 
              message: trace.message || trace.error || 'Execution complete.' 
            }
          ];
        });
        
        setActiveStep(i + 2);
      }

      await delay(1000);
      setIsProcessing(false);

      const confirmationNeeded = resultData.parsed_request?.confirmation_needed;

      if (resultData.providers && resultData.providers.length > 0 && !confirmationNeeded) {
        // Automatically route to Providers Screen passing the matching payload
        navigation.navigate('Providers', {
          serviceType: resultData.parsed_request?.serviceType || 'Service',
          budget: resultData.parsed_request?.budget || 2000,
          location: resultData.parsed_request?.location || 'Islamabad',
          time: resultData.parsed_request?.time || 'flexible',
          rawRequest: requestText,
          jobId: resultData.job_id,
          providersList: resultData.providers,
          initialBid: resultData.bid,
        });
      } else if (confirmationNeeded) {
        Alert.alert(
          'Clarification Needed',
          resultData.parsed_request.confirmation_question || 'Linguistic analysis confidence is low. Please provide more details.'
        );
      } else {
        Alert.alert(
          'No Matches Found',
          'We couldn\'t find any available service providers in your radius. Try increasing your budget or changing location.'
        );
      }

    } catch (err: any) {
      setConsoleLogs(prev => [
        ...prev.map(log => log.status === 'running' ? { ...log, status: 'error' as const, message: 'Execution halted.' } : log),
        { agent: 'System', status: 'error', message: err?.message || 'Network connection failed.' }
      ]);
      Alert.alert('Pipeline Interrupted', err?.message || 'Failed to communicate with API.');
      setIsProcessing(false);
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.cardBackground }]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Agent Matcher</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Describe what you need</Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Our agents support Roman Urdu, Urdu, and English.</Text>

          <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g. Bijli wala chahye urgent board lagane k liye..."
              placeholderTextColor={colors.textMuted}
              value={requestText}
              onChangeText={setRequestText}
              multiline
              numberOfLines={4}
              editable={!isProcessing}
            />
          </View>

          <TouchableOpacity
            style={[styles.btnMatch, isProcessing && styles.btnDisabled]}
            onPress={triggerMatching}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.btnMatchText}>Find Match via Antigravity</Text>
                <Ionicons name="compass-outline" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="map-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {language === 'ur' ? 'کام کی جگہ منتخب کریں' : 'Select Service Location'}
            </Text>
          </View>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
            {language === 'ur' 
              ? 'اسلام آباد میں ورکرز کو تلاش کرنے کے لیے ایک سیکٹر منتخب کریں۔' 
              : 'Choose a specific sector to query nearby providers dynamically.'}
          </Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.sectorsScroll}
            style={{ marginVertical: 12 }}
          >
            {ISLAMABAD_SECTORS.map((sector, idx) => {
              const isActive = selectedLocationIndex === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.sectorPill,
                    { borderColor: colors.border, backgroundColor: colors.inputBackground },
                    isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setSelectedLocationIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={sector.icon as any} 
                    size={14} 
                    color={isActive ? '#ffffff' : colors.textMuted} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[styles.sectorPillText, { color: isActive ? '#ffffff' : colors.text, fontWeight: 'bold' }]}>
                    {language === 'ur' ? sector.urdu : sector.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.mapContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <View style={styles.mapHeader}>
              <View style={styles.gpsPulseOuter}>
                <View style={[styles.gpsPulseInner, { backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.mapGpsText, { color: colors.text }]}>
                {language === 'ur' ? 'لائیو GPS سگنل - اسلام آباد' : 'LIVE GPS MATCH SIGNAL - ISLAMABAD'}
              </Text>
            </View>
            
            <View style={styles.coordsBoard}>
              <View style={styles.coordCol}>
                <Text style={styles.coordLabel}>LATITUDE</Text>
                <Text style={[styles.coordValue, { color: colors.primary }]}>
                  {ISLAMABAD_SECTORS[selectedLocationIndex].lat.toFixed(4)}° N
                </Text>
              </View>
              <View style={styles.coordDivider} />
              <View style={styles.coordCol}>
                <Text style={styles.coordLabel}>LONGITUDE</Text>
                <Text style={[styles.coordValue, { color: colors.primary }]}>
                  {ISLAMABAD_SECTORS[selectedLocationIndex].lng.toFixed(4)}° E
                </Text>
              </View>
            </View>

            <View style={styles.radarRingWrapper}>
              <View style={[styles.radarMapRing, { width: 140, height: 140, borderRadius: 70, borderColor: colors.border }]} />
              <View style={[styles.radarMapRing, { width: 100, height: 100, borderRadius: 50, borderColor: colors.primaryLight }]} />
              <View style={[styles.radarMapRing, { width: 60, height: 60, borderRadius: 30, borderColor: colors.primary }]} />
              <Ionicons name="pin" size={24} color="#ef4444" style={styles.mapPinIcon} />
            </View>
          </View>
        </View>

        {isProcessing && (
          <View style={[styles.radarWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.radarHeader}>
              <Ionicons name="compass-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.radarTitle, { color: colors.text }]}>SCANNING ACTIVE G-13 RADIUS (2.0 KM)</Text>
            </View>
            <View style={styles.radarGraphicRow}>
              <View style={[styles.radarCircleOuter, { borderColor: colors.primaryLight }]}>
                <View style={[styles.radarCircleInner, { borderColor: colors.primary }]}>
                  <View style={[styles.radarCoreDot, { backgroundColor: colors.primary }]}>
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                </View>
              </View>
              <View style={styles.satelliteList}>
                <View style={[styles.satelliteItem, activeStep >= 1 && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Ionicons name="chatbubbles-outline" size={12} color={activeStep >= 1 ? colors.primary : colors.textMuted} />
                  <Text style={[styles.satelliteText, { color: activeStep >= 1 ? colors.text : colors.textMuted, fontWeight: activeStep >= 1 ? 'bold' : 'normal' }]}>1. LinguisticAgent (Parsed)</Text>
                </View>
                <View style={[styles.satelliteItem, activeStep >= 2 && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Ionicons name="locate-outline" size={12} color={activeStep >= 2 ? colors.primary : colors.textMuted} />
                  <Text style={[styles.satelliteText, { color: activeStep >= 2 ? colors.text : colors.textMuted, fontWeight: activeStep >= 2 ? 'bold' : 'normal' }]}>2. GeoMatcher (Scanned)</Text>
                </View>
                <View style={[styles.satelliteItem, activeStep >= 3 && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Ionicons name="git-compare-outline" size={12} color={activeStep >= 3 ? colors.primary : colors.textMuted} />
                  <Text style={[styles.satelliteText, { color: activeStep >= 3 ? colors.text : colors.textMuted, fontWeight: activeStep >= 3 ? 'bold' : 'normal' }]}>3. BiddingAgent (Bargaining)</Text>
                </View>
                <View style={[styles.satelliteItem, activeStep >= 4 && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Ionicons name="lock-closed-outline" size={12} color={activeStep >= 4 ? colors.primary : colors.textMuted} />
                  <Text style={[styles.satelliteText, { color: activeStep >= 4 ? colors.text : colors.textMuted, fontWeight: activeStep >= 4 ? 'bold' : 'normal' }]}>4. EscrowAgent (Locked)</Text>
                </View>
                <View style={[styles.satelliteItem, activeStep >= 5 && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                  <Ionicons name="mail-outline" size={12} color={activeStep >= 5 ? colors.primary : colors.textMuted} />
                  <Text style={[styles.satelliteText, { color: activeStep >= 5 ? colors.text : colors.textMuted, fontWeight: activeStep >= 5 ? 'bold' : 'normal' }]}>5. FollowUpAgent (Cleared)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {(isProcessing || consoleLogs.length > 0) && (
          <View style={styles.terminalCard}>
            <View style={styles.terminalHeader}>
              <View style={styles.dotRow}>
                <View style={[styles.terminalDot, { backgroundColor: '#ff5f56' }]} />
                <View style={[styles.terminalDot, { backgroundColor: '#ffbd2e' }]} />
                <View style={[styles.terminalDot, { backgroundColor: '#27c93f' }]} />
              </View>
              <Text style={styles.terminalTitle}>Antigravity Logs</Text>
              {isProcessing && <ActivityIndicator size="small" color="#10b981" />}
            </View>

            <ScrollView style={styles.terminalContent} nestedScrollEnabled>
              {consoleLogs.map((log, index) => (
                <View key={index} style={styles.logLine}>
                  <Text style={styles.logLineText}>
                    <Text style={styles.logTimestamp}>[{new Date().toLocaleTimeString()}] </Text>
                    <Text style={[styles.logAgent, { color: getAgentColor(log.agent) }]}>{log.agent}: </Text>
                    <Text style={[styles.logText, { color: getLogTextColor(log.status) }]}>{log.message}</Text>
                    {log.status === 'running' && <Text style={styles.cursor}>_</Text>}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {result?.parsed_request?.confidence !== undefined ? (
          <View style={[
            styles.confidenceBar,
            { borderColor: result.parsed_request.confidence >= 0.7 ? '#10b981' : '#f59e0b' }
          ]}>
            <Text style={styles.confidenceLabel}>
              Parse Confidence: {(result.parsed_request.confidence * 100).toFixed(0)}%
            </Text>
            {result.parsed_request.confirmation_needed && (
              <Text style={styles.confirmationQuestion}>
                ❓ {result.parsed_request.confirmation_question}
              </Text>
            )}
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styling Helper Constants ───────────────────────────────────────────────────────
const getAgentColor = (agent: string) => {
  switch (agent) {
    case 'System': return '#9ca3af';
    case 'LinguisticAgent': return '#34d399';
    case 'GeoAgent': return '#60a5fa';
    case 'BiddingAgent': return '#fbbf24';
    case 'EscrowAgent': return '#a78bfa';
    case 'FollowUpAgent': return '#f472b6';
    default: return '#38bdf8';
  }
};

const getLogTextColor = (status: string) => {
  switch (status) {
    case 'success': return '#34d399'; // Neon emerald green
    case 'error': return '#f87171'; // Red
    case 'skipped': return '#fbbf24'; // Amber
    case 'running': return '#ffffff';
    default: return '#d1d5db';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 16,
  },
  inputWrapper: {
    backgroundColor: '#0d1117',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    color: '#ffffff',
    fontSize: 14,
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  btnMatch: {
    backgroundColor: '#4f46e5', // Hackathon Indigo accent
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnDisabled: {
    backgroundColor: '#312e81',
  },
  btnMatchText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  terminalCard: {
    backgroundColor: '#0c0c0e', // Monospace Terminal Background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16181c',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2d30',
  },
  dotRow: {
    flexDirection: 'row',
    width: 50,
    justifyContent: 'space-between',
  },
  terminalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalTitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  terminalContent: {
    padding: 12,
    minHeight: 180,
    maxHeight: 250,
  },
  logLine: {
    marginBottom: 8,
  },
  logLineText: {
    color: '#9ca3af',
  },
  logTimestamp: {
    color: '#555555',
    fontFamily: 'monospace',
    fontSize: 11,
    marginRight: 6,
  },
  logAgent: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    marginRight: 6,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  cursor: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  radarWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  radarTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  radarGraphicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radarCircleOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCircleInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCoreDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  satelliteList: {
    flex: 1,
    marginLeft: 16,
  },
  satelliteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  satelliteText: {
    fontSize: 10,
    marginLeft: 6,
  },
  // Location Selector Styles
  sectorsScroll: {
    paddingRight: 20,
  },
  sectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  sectorPillText: {
    fontSize: 12,
  },
  mapContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  gpsPulseOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  gpsPulseInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mapGpsText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  coordsBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    marginBottom: 20,
    zIndex: 10,
  },
  coordCol: {
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 9,
    color: '#888',
    marginBottom: 4,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  coordValue: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  coordDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#333',
  },
  radarRingWrapper: {
    position: 'relative',
    height: 140,
    width: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  radarMapRing: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  mapPinIcon: {
    position: 'absolute',
    top: 45,
  },
  confidenceBar: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    backgroundColor: '#1a1a1a',
  },
  confidenceLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confirmationQuestion: {
    color: '#f59e0b',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
