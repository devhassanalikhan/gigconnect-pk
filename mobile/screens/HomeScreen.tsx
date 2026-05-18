import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
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

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 44) / 2;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, theme, toggleTheme, userRole } = useTheme();

  const handleCategoryPress = (category: string) => {
    // Route to Search Screen with the pre-selected category
    navigation.navigate('Search', { category });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />

      {/* Header section with brand and history trigger */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerBranding}>
          <Text style={[styles.headerSubtitle, { color: userRole === 'client' ? colors.primary : colors.success }]}>
            {userRole === 'client' ? "Pakistan's 1st Agentic Economy" : "KaamGraph Provider Portal"}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {userRole === 'client' ? "KaamGraph" : "Arsalan's Panel"}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={[styles.themeBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} 
              size={20} 
              color={userRole === 'client' ? colors.primary : colors.success} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.historyBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginLeft: 8 }]}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color={userRole === 'client' ? colors.primary : colors.success} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {userRole === 'client' ? (
          <>
            {/* Sleek Tagline & Hero Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.heroTextContent}>
                <Text style={[styles.heroBadge, { backgroundColor: colors.primaryLight, color: colors.primary }]}>HACKATHON EDITION</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>Trusted pricing, locked with AI Escrow.</Text>
                <Text style={[styles.heroDescription, { color: colors.textMuted }]}>
                  Describe your task in Roman Urdu or English and let our 5-Agent pipeline handle matching, bidding & payments.
                </Text>
              </View>
              <View style={styles.heroGlow} />
            </View>

            {/* Interactive Matchmaking Search Prompt Trigger */}
            <TouchableOpacity 
              style={[styles.searchBarTrigger, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles-outline" size={18} color={colors.primary} style={styles.searchIcon} />
              <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>Type what you need (e.g. "Plumber chahye G-13")</Text>
              <View style={[styles.arrowIconWrapper, { backgroundColor: colors.primary }]}>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Section Heading */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Select a Category</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Tap to auto-populate request intents</Text>
            </View>

            {/* Beautiful Category Grid inspired by InDrive + Uber Dark UI */}
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.categoryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: item.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.categoryDesc, { color: colors.textMuted }]}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Trust & Pipeline Explanation Card */}
            <View style={[styles.pipelineExplanationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.pipelineTitle, { color: colors.text }]}>🤖 Powered by Google Antigravity</Text>
              <Text style={[styles.pipelineSubtitle, { color: colors.primary }]}>How our 5 sub-agents secure your job:</Text>
              
              <View style={styles.stepRow}>
                <View style={[styles.stepNumberWrapper, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                  <Text style={[styles.stepNumber, { color: colors.success }]}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}><Text style={[styles.boldText, { color: colors.text }]}>Linguistic Agent</Text> parses your intent in Roman Urdu/English.</Text>
              </View>

              <View style={styles.stepRow}>
                <View style={[styles.stepNumberWrapper, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                  <Text style={[styles.stepNumber, { color: colors.success }]}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}><Text style={[styles.boldText, { color: colors.text }]}>Geo Agent</Text> ranks nearby workers by distance & ratings.</Text>
              </View>

              <View style={styles.stepRow}>
                <View style={[styles.stepNumberWrapper, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                  <Text style={[styles.stepNumber, { color: colors.success }]}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}><Text style={[styles.boldText, { color: colors.text }]}>Bidding Agent</Text> negotiates optimal prices automatically.</Text>
              </View>

              <View style={styles.stepRow}>
                <View style={[styles.stepNumberWrapper, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                  <Text style={[styles.stepNumber, { color: colors.success }]}>4</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}><Text style={[styles.boldText, { color: colors.text }]}>Escrow Agent</Text> secures the funds in a locked milestone.</Text>
              </View>

              <View style={styles.stepRow}>
                <View style={[styles.stepNumberWrapper, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                  <Text style={[styles.stepNumber, { color: colors.success }]}>5</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.textMuted }]}><Text style={[styles.boldText, { color: colors.text }]}>Follow-Up Agent</Text> dispatches automated SMS confirmations.</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* WORKER DASHBOARD PERSPECTIVE */}
            <View style={[styles.heroCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.heroTextContent}>
                <Text style={[styles.heroBadge, { backgroundColor: colors.successLight, color: colors.success }]}>PROVIDER PORTAL ACTIVE</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>Secure Leads, Automatically Negotiated.</Text>
                <Text style={[styles.heroDescription, { color: colors.textMuted }]}>
                  Our Antigravity Bidding Agent represents your minimum threshold targets in all price agreements.
                </Text>
              </View>
              <View style={[styles.heroGlow, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]} />
            </View>

            {/* Active Leads List */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Local Leads (Sector G-13)</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Real-time matching near your active coordinates</Text>
            </View>

            <View style={[styles.pipelineExplanationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles" size={18} color={colors.success} style={{ marginRight: 6 }} />
                  <Text style={{ fontWeight: 'bold', color: colors.text }}>AC Installation Lead</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.success }}>2,500 PKR</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>
                "Mujhe kal subah G-13 me urgent AC lagwana hai koi technician bhejo."
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Client: Hassan A. (1.4 km away)</Text>
                <View style={{ backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.success }}>98% Match Rating</Text>
                </View>
              </View>
            </View>

            <View style={[styles.pipelineExplanationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, marginBottom: 16 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="sparkles" size={18} color={colors.success} style={{ marginRight: 6 }} />
                  <Text style={{ fontWeight: 'bold', color: colors.text }}>Electric Switchboard Repair</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.success }}>1,800 PKR</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>
                "Main board me short circuit ho rha hai urgently electrician chahye G-13."
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Client: Zainab M. (0.8 km away)</Text>
                <View style={{ backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.success }}>95% Match Rating</Text>
                </View>
              </View>
            </View>

            {/* Active Bidding ZOPA Negotiations Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Bargaining Traces</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>AI-to-AI ZOPA negotiations currently in progress</Text>
            </View>

            <View style={[styles.pipelineExplanationCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.warning }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Job #GIG-2918 (AC Servicing)</Text>
                <View style={{ backgroundColor: colors.warningLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.warning }}>Agent Bargaining</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginBottom: 8 }}>
                "Client budget was 1,500 PKR. Provider Arsalan target min is 2,000 PKR. Bidding agent negotiated a compromise agreement at 1,800 PKR."
              </Text>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Target: 2,000 PKR</Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.warning }}>Settled: 1,800 PKR</Text>
              </View>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f', // Sleek dark theme base
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerBranding: {
    flexDirection: 'column',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#4f46e5', // Indigo primary accent
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '900',
  },
  themeBtn: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyBtn: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    position: 'relative',
    overflow: 'hidden',
  },
  heroTextContent: {
    zIndex: 1,
  },
  heroBadge: {
    backgroundColor: '#4f46e520',
    color: '#4f46e5',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#4f46e5',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 26,
  },
  heroDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  heroGlow: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#4f46e5',
    opacity: 0.15,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#9ca3af',
    fontSize: 13,
    flex: 1,
  },
  arrowIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 14,
  },
  pipelineExplanationCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  pipelineTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  pipelineSubtitle: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumberWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#05966920',
    borderWidth: 0.5,
    borderColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumber: {
    color: '#059669',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
  },
  boldText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
