// GigConnect AI / screens/SearchScreen.tsx
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
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext';
import { API_BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

interface ChatBubble {
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { colors, theme, language, chatHistory, setChatHistory } = useTheme();

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

      const response = await fetch(`${API_BASE_URL}/api/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          user_lat: 33.642,
          user_lng: 73.076,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const resultData = await response.json();
      
      advanceStep(4, 400); // EscrowAgent

      setTimeout(async () => {
        setActiveAgentStep(5); // FollowUpAgent
        await new Promise(r => setTimeout(r, 600));
        setIsProcessing(false);
        setActiveAgentStep(-1);

        if (resultData.providers && resultData.providers.length > 0) {
          const successMsg: ChatBubble = {
            sender: 'agent',
            text: `✅ ${resultData.providers.length} provider(s) matched near you! Routing to booking flow...`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, successMsg]);
          navigation.navigate('Book', {
            provider: resultData.providers[0],
            serviceType: resultData.parsed_request?.serviceType || 'Service',
          });
        } else {
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
        text: 'Network issue. Main backend pipeline se connect nahi kar pa raha hoon.',
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>KaamGraph AI Chat</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={() => setMessages([messages[0]])}>
          <Text style={[styles.clearBtnText, { color: colors.primary }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Conversational Stream */}
      <ScrollView contentContainerStyle={styles.chatArea} showsVerticalScrollIndicator={false}>
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

        {/* Agentic Radar Step Tracker — shows while processing */}
        {isProcessing && activeAgentStep >= 0 && (
          <View style={[styles.agentRadarCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.agentRadarTitle, { color: colors.text }]}>
              {language === 'en' ? '⚡ KaamGraph AI Pipeline Running...' : '⚡ KaamGraph AI پائپ لائن جاری ہے...'}
            </Text>
            {[
              { step: 1, icon: 'chatbubbles-outline', label: 'Linguistic Agent', subLabel: 'Parsing Roman Urdu intent...' },
              { step: 2, icon: 'locate-outline',      label: 'GeoMatcher',       subLabel: 'Scanning 2km radius...' },
              { step: 3, icon: 'git-compare-outline', label: 'Bidding Agent',    subLabel: 'ZOPA negotiation...' },
              { step: 4, icon: 'lock-closed-outline', label: 'Escrow Agent',     subLabel: 'Locking payment milestone...' },
              { step: 5, icon: 'mail-outline',        label: 'FollowUp Agent',   subLabel: 'Sending SMS confirmation...' },
            ].map(({ step, icon, label, subLabel }) => {
              const done = activeAgentStep > step;
              const active = activeAgentStep === step;
              return (
                <View key={step} style={styles.agentStepRow}>
                  <View style={[
                    styles.agentStepDot,
                    done   && { backgroundColor: '#10b981' },
                    active && { backgroundColor: '#6366f1' },
                  ]}>
                    {active
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Ionicons name={done ? 'checkmark' : icon as any} size={12} color="#fff" />
                    }
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[
                      styles.agentStepLabel,
                      (done || active) ? { color: colors.text } : { color: colors.textMuted }
                    ]}>{label}</Text>
                    {active && <Text style={styles.agentStepSub}>{subLabel}</Text>}
                  </View>
                  {done && <Ionicons name="checkmark-circle" size={16} color="#10b981" />}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom input area */}
      <View style={[styles.inputArea, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.micBtn} onPress={triggerVoiceInput}>
          <Ionicons name="mic-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={requestText}
          onChangeText={setRequestText}
          placeholder={language === 'en' ? 'Ask KaamGraph AI...' : 'KaamGraph AI سے پوچھیں...'}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.text }]} onPress={() => handleSend()}>
          <Ionicons name="arrow-up" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Mic listening overlay */}
      <Modal visible={micActive} transparent animationType="fade">
        <View style={styles.listeningBg}>
          <View style={[styles.listeningCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.pulseWaves}>
              <View style={[styles.pulseCircle, { transform: [{ scale: 1.2 }] }]} />
              <Ionicons name="mic" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.listeningTitle, { color: colors.text }]}>Listening...</Text>
            <Text style={[styles.listeningDesc, { color: colors.textMuted }]}>Say something like "Electrician chahye Tulsa Road par"</Text>
          </View>
        </View>
      </Modal>

      {/* Historical Roman Urdu slide-out drawer */}
      <Modal visible={drawerVisible} transparent animationType="slide">
        <View style={styles.drawerBg}>
          <TouchableOpacity style={styles.drawerDismiss} onPress={() => setDrawerVisible(false)} />
          
          <View style={[styles.drawerPanel, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>
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
                  style={[styles.historyItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setDrawerVisible(false);
                    handleSend(history.text);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={colors.primary} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyText, { color: colors.text }]} numberOfLines={2}>{history.text}</Text>
                    <Text style={[styles.historyTime, { color: colors.textMuted }]}>{history.time}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  menuBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  chatArea: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'flex-end',
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
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 10,
    marginBottom: 20,
  },
  radarGraphicOuter: {
    marginRight: 10,
  },
  scanningText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#090d16',
  },
  micBtn: {
    padding: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
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
    borderColor: '#6366f1',
    opacity: 0.5,
  },
  listeningTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listeningDesc: {
    color: '#94a3b8',
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
    backgroundColor: '#0f172a',
    borderLeftWidth: 1,
    borderLeftColor: '#1e293b',
    padding: 20,
    height: '100%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 16,
    marginBottom: 16,
  },
  drawerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerScroll: {
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  historyText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  historyTime: {
    color: '#475569',
    fontSize: 10,
    marginTop: 4,
  },
  emptyHistory: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  // ── Agentic Radar styles ──────────────────────────────────────────────────
  agentRadarCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  agentRadarTitle: {
    color: '#6366f1',
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
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentStepLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  agentStepSub: {
    color: '#6366f1',
    fontSize: 11,
    marginTop: 2,
  },
});
