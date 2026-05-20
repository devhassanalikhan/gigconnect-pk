// KaamGraph / screens/SearchScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ThemeColors } from '../ThemeContext';
import { API_BASE_URL, fetchWithTimeout, USE_MOCK } from '../config';
import { matchMock } from '../mock/mockApi';
import { rPadding, rFontSize, rMargin, rBorderRadius, getShadow, rIconSize, rSpacing } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

interface ChatBubble {
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { colors, theme, language, chatHistory, setChatHistory } = useTheme();
  const styles = getStyles(colors, theme);
  const scrollViewRef = useRef<ScrollView>(null);

  const [requestText, setRequestText] = useState('');
  const [activeAgentStep, setActiveAgentStep] = useState(-1); // -1 = idle
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      sender: 'agent',
      text: 'Assalam-o-Alaikum! Main KaamGraph AI Assistant hoon. Aapko kis qism ki service chahye? (e.g. Plumber, Electrician or AC service)',
      time: '4:12 PM',
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [matchedProviders, setMatchedProviders] = useState<any[]>([]);
  const [parsedRequest, setParsedRequest] = useState<any>(null);

  // Automatically scroll to bottom when messages list updates
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Scroll to bottom when keyboard opens (fixes overlap on physical devices)
  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(keyboardShowEvent, () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    });
    return () => sub.remove();
  }, []);

  // Trigger matching pipeline
  const handleSend = async (customText?: string) => {
    const textToSend = customText || requestText;
    if (!textToSend.trim()) return;

    // Append client message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatBubble = { sender: 'user', text: textToSend, time: timestamp };
    
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setRequestText('');
    setIsProcessing(true);
    setActiveAgentStep(0);

    const advanceStep = (step: number, delay: number) =>
      new Promise<void>(res => setTimeout(() => { setActiveAgentStep(step); res(); }, delay));

    // Save search context history
    setChatHistory((prev: any[]) => [
      { text: textToSend, time: '19 May 2026' },
      ...prev.slice(0, 4)
    ]);

    try {
      // Simulate agent steps visually while backend runs
      advanceStep(1, 600);   // LinguisticAgent
      advanceStep(2, 1400);  // GeoMatcher
      advanceStep(3, 2200);  // BiddingAgent

      let resultData: any = null;
      if (USE_MOCK) {
        resultData = await matchMock(textToSend);
      } else {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSend,
            user_lat: 33.642,
            user_lng: 73.076,
          }),
        }, 15000); // 15 second timeout for LangGraph compilation

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        resultData = await response.json();
      }

      // ─── Handle Greeting Intent (no pipeline needed) ───────────────
      if (resultData.pipeline_status === 'greeting' && resultData.greeting_response) {
        setIsProcessing(false);
        setActiveAgentStep(-1);
        const greetingMsg: ChatBubble = {
          sender: 'agent',
          text: resultData.greeting_response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, greetingMsg]);
        return; // Skip provider display logic
      }

      // ─── Handle Service Request (full pipeline) ────────────────────
      advanceStep(4, 400); // EscrowAgent

      setTimeout(async () => {
        setActiveAgentStep(5); // FollowUpAgent
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        setActiveAgentStep(-1);

        if (resultData.providers && resultData.providers.length > 0) {
          setMatchedProviders(resultData.providers);
          setParsedRequest(resultData.parsed_request);
          
          const successMsg: ChatBubble = {
            sender: 'agent',
            text: `✅ ${resultData.providers.length} provider(s) matched near you! Scroll down to see results.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, successMsg]);
        } else {
          setMatchedProviders([]);
          const failMsg: ChatBubble = {
            sender: 'agent',
            text: language === 'en'
              ? 'No providers found near you. Try adjusting budget or location.'
              : 'Koi provider nahi mila. Budget ya location badal kar try karein.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, failMsg]);
        }
      }, 500);

    } catch (err: any) {
      setIsProcessing(false);
      setActiveAgentStep(-1);
      const errorMsg: ChatBubble = {
        sender: 'agent',
        text: `Network issue. Backend pipeline (${API_BASE_URL}) se connect nahi kar pa raha hoon. Error: ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Simulate speech recognition mic input
  const triggerVoiceInput = () => {
    setMicActive(true);
    setTimeout(() => {
      setMicActive(false);
      const simulatedSpeechText = 'Mujhe AC technician chahye Tulsa Road Lalazar k liye urgently';
      setRequestText(simulatedSpeechText);
      Alert.alert('Speech Recognized', `Translated: "${simulatedSpeechText}"`);
    }, 2500);
  };  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 60, default: 0 })}
      >
        {/* Header bar */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, paddingHorizontal: rPadding(16), paddingVertical: rPadding(12) }]}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerVisible(true)}>
            <Ionicons name="menu-outline" size={rIconSize(24)} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: rFontSize(18), fontWeight: 'bold', color: colors.text }]}>KaamGraph AI Chat</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={() => setMessages([messages[0]])}>
            <Text style={[styles.clearBtnText, { color: colors.primary, fontSize: rFontSize(14) }]}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Conversational Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={`msg-${idx}`}
                style={[
                  styles.bubbleWrapper,
                  isUser ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isUser
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text }]}>{m.text}</Text>
                  <Text style={[styles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>{m.time}</Text>
                </View>
              </View>
            );
          })}

          {/* Agentic Radar Step Tracker — removed as per request, using simple chat typing indicator instead */}
          {isProcessing && (
            <View style={[styles.bubbleWrapper, { alignSelf: 'flex-start' }]}>
              <View style={[styles.bubble, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}

          {/* Dynamic Provider Results */}
          {matchedProviders.length > 0 && !isProcessing && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>
                {language === 'en' ? 'MATCHED PROVIDERS' : 'منتخب ورکرز'}
              </Text>
              {matchedProviders.map((p, pIdx) => (
                <TouchableOpacity
                  key={`p-${pIdx}`}
                  style={styles.providerCard}
                  onPress={() => navigation.navigate('Book', {
                    provider: p,
                    serviceType: parsedRequest?.serviceType || 'Service',
                  })}
                >
                  <View style={styles.providerInfo}>
                    <View style={styles.providerMain}>
                      <Text style={styles.providerNameText}>{p.name}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#f59e0b" />
                        <Text style={styles.ratingText}> {p.rating}</Text>
                        <Text style={styles.distanceText}> • {p.distance_km}km away</Text>
                      </View>
                    </View>
                    <View style={styles.priceTagSmall}>
                      <Text style={styles.priceTextSmall}>{p.base_cost} PKR</Text>
                    </View>
                  </View>
                  <View style={styles.selectBtn}>
                    <Text style={styles.selectBtnText}>{language === 'en' ? 'Select & Bid' : 'منتخب کریں'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom input area */}
        <View style={[styles.inputArea, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.micBtn} onPress={triggerVoiceInput}>
            <Ionicons name="mic-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, {
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
              color: theme === 'dark' ? '#ffffff' : '#0f172a',
              borderColor: theme === 'dark' ? '#334155' : '#cbd5e1'
            }]}
            value={requestText}
            onChangeText={setRequestText}
            placeholder={language === 'en' ? 'Ask KaamGraph AI...' : 'KaamGraph AI سے پوچھیں...'}
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme === 'dark' ? '#6366f1' : '#4f46e5' }]} onPress={() => handleSend()}>
            <Ionicons name="arrow-up" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Mic listening overlay */}
      <Modal visible={micActive} transparent animationType="fade">
        <View style={styles.listeningBg}>
          <View style={styles.listeningCard}>
            <View style={styles.pulseWaves}>
              <View style={[styles.pulseCircle, { transform: [{ scale: 1.2 }] }]} />
              <Ionicons name="mic" size={40} color={colors.primary} />
            </View>
            <Text style={styles.listeningTitle}>Listening...</Text>
            <Text style={styles.listeningDesc}>Say something like "Electrician chahye Tulsa Road par"</Text>
          </View>
        </View>
      </Modal>

      {/* Historical Roman Urdu slide-out drawer */}
      <Modal visible={drawerVisible} transparent animationType="slide">
        <View style={styles.drawerBg}>
          <TouchableOpacity style={styles.drawerDismiss} onPress={() => setDrawerVisible(false)} />
          
          <View style={styles.drawerPanel}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>
                {language === 'en' ? 'Recent Searches' : 'حالیہ تلاشیں'}
              </Text>
              <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.drawerScroll}>
              {chatHistory.map((history, idx) => (
                <TouchableOpacity
                  key={`hist-${idx}`}
                  style={styles.historyItem}
                  onPress={() => {
                    setDrawerVisible(false);
                    handleSend(history.text);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={colors.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyText} numberOfLines={2}>{history.text}</Text>
                    <Text style={styles.historyTime}>{history.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {chatHistory.length === 0 && (
                <Text style={styles.emptyHistory}>No previous chat logs recorded.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: colors.primary,
    fontSize: 14,
  },
  chatArea: {
    flexGrow: 1,
    padding: 20,
  },
  bubbleWrapper: {
    maxWidth: '80%',
    marginBottom: 16,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  scanningCard: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
    marginBottom: 20,
  },
  radarGraphicOuter: {
    marginRight: 10,
  },
  scanningText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  micBtn: {
    padding: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 14,
    marginHorizontal: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  listeningBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 40,
    alignItems: 'center',
    width: width * 0.8,
  },
  pulseWaves: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  pulseCircle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: colors.primary,
    opacity: 0.5,
  },
  listeningTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  listeningDesc: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  drawerBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
  },
  drawerDismiss: {
    flex: 1,
  },
  drawerPanel: {
    width: width * 0.75,
    backgroundColor: colors.cardBackground,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: 20,
    height: '100%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  drawerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerScroll: {
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  historyText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  historyTime: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  emptyHistory: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  // ── Agentic Radar styles ──────────────────────────────────────────────────
  agentRadarCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  agentRadarTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  agentStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentStepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentStepSub: {
    color: colors.primary,
    fontSize: 11,
    marginTop: 2,
  },
  resultsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  resultsTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
    paddingLeft: 4,
    color: colors.textMuted,
  },
  providerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  providerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerMain: {
    flex: 1,
  },
  providerNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  distanceText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  priceTagSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  priceTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  selectBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
