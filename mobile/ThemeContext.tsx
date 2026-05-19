// KaamGraph / Mobile / mobile/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark';
export type UserRole = 'client' | 'provider';
export type AppLanguage = 'en' | 'ur';

export const ISLAMABAD_SECTORS = [
  { name: 'G-13 Sector', lat: 33.6411, lng: 72.9723, urdu: 'جی-13 سیکٹر', icon: 'navigate-circle-outline' },
  { name: 'G-11 Markaz', lat: 33.6655, lng: 72.9922, urdu: 'جی-11 مرکز', icon: 'locate-outline' },
  { name: 'F-11 Sector', lat: 33.6841, lng: 72.9863, urdu: 'ایف-11 سیکٹر', icon: 'pin-outline' },
  { name: 'E-11 Heights', lat: 33.6995, lng: 72.9754, urdu: 'ای-11 ہائٹس', icon: 'business-outline' },
  { name: 'I-8 Sector', lat: 33.6702, lng: 73.0722, urdu: 'آئی-8 سیکٹر', icon: 'home-outline' },
  { name: 'Blue Area', lat: 33.7112, lng: 73.0583, urdu: 'بلیو ایریا', icon: 'compass-outline' },
  { name: 'Saddar RWP', lat: 33.5934, lng: 73.0531, urdu: 'صدر راولپنڈی', icon: 'trail-sign-outline' },
];

export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  terminalBackground: string;
  terminalHeader: string;
  inputBackground: string;
  statusBar: 'light' | 'dark';
}

const darkColors: ThemeColors = {
  background: '#0f0f0f',
  cardBackground: '#16161a',
  text: '#ffffff',
  textMuted: '#94a3b8',
  border: '#262629',
  primary: '#6366f1',
  primaryLight: 'rgba(99, 102, 241, 0.12)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.12)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.12)',
  danger: '#e11d48',
  dangerLight: 'rgba(225, 29, 72, 0.12)',
  terminalBackground: '#0c0c0e',
  terminalHeader: '#16181c',
  inputBackground: '#0d1117',
  statusBar: 'light',
};

const lightColors: ThemeColors = {
  background: '#f8fafc',
  cardBackground: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  primary: '#4f46e5',
  primaryLight: 'rgba(79, 70, 229, 0.08)',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.08)',
  warning: '#d97706',
  warningLight: 'rgba(217, 119, 6, 0.08)',
  danger: '#dc2626',
  dangerLight: 'rgba(220, 38, 38, 0.08)',
  terminalBackground: '#0f172a',
  terminalHeader: '#1e293b',
  inputBackground: '#f1f5f9',
  statusBar: 'dark',
};

// ─── Localization Dictionaries ──────────────────────────────────────────────────────
export interface TranslationSet {
  // HomeScreen
  homeSubtitleClient: string;
  homeSubtitleWorker: string;
  homeTitleClient: string;
  homeTitleWorker: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  searchPlaceholder: string;
  selectCategory: string;
  selectCategorySub: string;
  poweredBy: string;
  howSubagentsSecure: string;
  leadHeader: string;
  leadSub: string;
  activeNegotiationHeader: string;
  activeNegotiationSub: string;

  // ProfileScreen
  accountModeSelector: string;
  clientShellActive: string;
  workerShellActive: string;
  clientShellDesc: string;
  workerShellDesc: string;
  toWorker: string;
  toClient: string;
  escrowVal: string;
  earningsVal: string;
  completedGigs: string;
  ratingLabel: string;
  appearanceMode: string;
  darkActive: string;
  lightActive: string;
  accountOptions: string;
  paymentMethods: string;
  payoutMethods: string;
  cnicVerification: string;
  notifications: string;
  languagePref: string;
  supportHeader: string;
  supportHelpline: string;
  termsRules: string;
  logOut: string;
  verifiedBadgeClient: string;
  verifiedBadgeWorker: string;
  premiumClient: string;
  topRatedProvider: string;

  // HomeScreen groups & hero
  groupEssentials: string;
  groupHomeServices: string;
  groupHealthCare: string;
  searchHint: string;
  heroBadgeText: string;
  heroTitleText: string;
  heroDescText: string;
  workerOnline: string;
  workerWallet: string;
  workerGigs: string;
  workerLeadsFeed: string;
  workerCounterOffer: string;
  // Tabs
  tabHome: string;
  tabSearch: string;
  tabHistory: string;
  tabProfile: string;
}

const englishTranslations: TranslationSet = {
  homeSubtitleClient: "Pakistan's 1st Agentic Economy",
  homeSubtitleWorker: "KaamGraph Provider Portal",
  homeTitleClient: "KaamGraph",
  homeTitleWorker: "Arsalan's Panel",
  heroBadge: "HACKATHON EDITION",
  heroTitle: "Trusted pricing, locked with AI Escrow.",
  heroDescription: "Describe your task in Roman Urdu or English and let our 5-Agent pipeline handle matching, bidding & payments.",
  searchPlaceholder: 'Type what you need (e.g. "Plumber chahye")',
  selectCategory: "Select a Category",
  selectCategorySub: "Tap to auto-populate request intents",
  poweredBy: "Powered by Google Antigravity",
  howSubagentsSecure: "How our 5 sub-agents secure your job:",
  leadHeader: "Incoming Local Leads",
  leadSub: "Real-time matching near your active coordinates",
  activeNegotiationHeader: "Active Bargaining Traces",
  activeNegotiationSub: "AI-to-AI ZOPA negotiations currently in progress",
  accountModeSelector: "Account Mode Selector",
  clientShellActive: "Client Shell Active",
  workerShellActive: "Worker Shell Active",
  clientShellDesc: "Hire nearby providers, auto-negotiate, and lock secure escrows.",
  workerShellDesc: "Receive job leads, auto-bid in Roman Urdu, and track earnings wallet.",
  toWorker: "To Worker",
  toClient: "To Client",
  escrowVal: "PKR In Escrow",
  earningsVal: "PKR Earned (Month)",
  completedGigs: "Completed Gigs",
  ratingLabel: "Rating (⭐)",
  appearanceMode: "Appearance Mode",
  darkActive: "Dark Mode Active",
  lightActive: "Light Mode Active",
  accountOptions: "Account Options",
  paymentMethods: "Payment Methods & Wallet",
  payoutMethods: "Payout Methods & Bank Details",
  cnicVerification: "CNIC & Police Verification",
  notifications: "Notification Settings",
  languagePref: "Language Preferences (Urdu/Eng)",
  supportHeader: "Support & Legal",
  supportHelpline: "24/7 Live Support Helpline",
  termsRules: "Terms of Service & Escrow Rules",
  logOut: "Log Out Account",
  verifiedBadgeClient: "NADRA CNIC Verified (Tasdeeq AI)",
  verifiedBadgeWorker: "NADRA & Police Clearance Approved",
  premiumClient: "Premium Client",
  topRatedProvider: "Top Rated Provider",
  groupEssentials: "⚡ Daily Essentials",
  groupHomeServices: "🏡 Home Services",
  groupHealthCare: "❤️ Health Care",
  searchHint: "Mujhe AC wala chahye Tulsa road par...",
  heroBadgeText: "🔥 PAKISTAN'S 1ST AGENTIC ECONOMY",
  heroTitleText: "Verified services near you, locked with AI Escrow.",
  heroDescText: "Describe in Roman Urdu or English — our 5-Agent pipeline matches, bids & pays automatically.",
  workerOnline: "ONLINE • Scanning",
  workerWallet: "ACTIVE WALLET",
  workerGigs: "COMPLETED GIGS",
  workerLeadsFeed: "💼 Neighbor Requests Feed",
  workerCounterOffer: "Counter Offer",
  tabHome: "Home",
  tabSearch: "AI Match",
  tabHistory: "Escrows",
  tabProfile: "Profile",
};

const urduTranslations: TranslationSet = {
  homeSubtitleClient: "پاکستان کی پہلی ایجنٹک معیشت",
  homeSubtitleWorker: "کام گراف فراہم کنندہ پورٹل",
  homeTitleClient: "کام گراف",
  homeTitleWorker: "ارسلان کا پینل",
  heroBadge: "ہیکاتھون ایڈیشن",
  heroTitle: "بھروسہ مند قیمتیں، جو کہ AI ایسکرو کے ساتھ محفوظ ہیں",
  heroDescription: "اپنی ضرورت رومن اردو یا انگریزی میں بتائیں اور ہمارے ۵-ایجنٹ پائپ لائن کو میچنگ، بولی اور ادائیگی سنبھالنے دیں",
  searchPlaceholder: "اپنی ضرورت ٹائپ کریں (جیسے: پلمبر چاہئے)",
  selectCategory: "زمرہ منتخب کریں",
  selectCategorySub: "رکویسٹ کو خود بخود بھرنے کے لیے کلک کریں",
  poweredBy: "گوگل اینٹی گریویٹی کے ذریعے چلنے والا",
  howSubagentsSecure: "ہمارے ۵ سب ایجنٹس آپ کے کام کو کیسے محفوظ بناتے ہیں:",
  leadHeader: "آمدہ مقامی لیڈز",
  leadSub: "آپ کے فعال پتے کے قریب لائیو کام کے مواقع",
  activeNegotiationHeader: "لائیو بولی کی تفصیلات",
  activeNegotiationSub: "ایجنٹس کے درمیان خودکار قیمت کے مذاکرات جاری ہیں",
  accountModeSelector: "اکاؤنٹ موڈ سلیکٹر",
  clientShellActive: "کلائنٹ موڈ فعال ہے",
  workerShellActive: "ورکر موڈ فعال ہے",
  clientShellDesc: "قریبی فراہم کنندگان کو تلاش کریں اور محفوظ ایسکرو لاک کریں۔",
  workerShellDesc: "نئی جابز حاصل کریں، رومن اردو میں بولی لگائیں اور والیٹ چیک کریں۔",
  toWorker: "ورکر بنیں",
  toClient: "کلائنٹ بنیں",
  escrowVal: "ایسکرو میں رقم",
  earningsVal: "مہینے کی کمائی (روپے)",
  completedGigs: "مکمل شدہ کام",
  ratingLabel: "ریٹنگ (⭐)",
  appearanceMode: "ظاہری شکل",
  darkActive: "ڈارک موڈ فعال ہے",
  lightActive: "لائٹ موڈ فعال ہے",
  accountOptions: "اکاؤنٹ کے اختیارات",
  paymentMethods: "ادائیگی کے طریقے اور والیٹ",
  payoutMethods: "پیسے نکالنے کے طریقے اور بینک تفصیلات",
  cnicVerification: "شناختی کارڈ اور پولیس تصدیق",
  notifications: "نوٹیفیکیشن کی ترتیبات",
  languagePref: "زبان کی ترتیبات (اردو / English)",
  supportHeader: "سپورٹ اور قانونی معلومات",
  supportHelpline: "۲۴/۷ لائیو ہیلپ لائن سپورٹ",
  termsRules: "شرائط و ضوابط اور ایسکرو قوانین",
  logOut: "اکاؤنٹ لاگ آؤٹ کریں",
  verifiedBadgeClient: "نادرا شناختی کارڈ تصدیق شدہ (Tasdeeq AI)",
  verifiedBadgeWorker: "نادرا اور پولیس تصدیق منظور شدہ",
  premiumClient: "پریمیم کلائنٹ",
  topRatedProvider: "ٹاپ ریٹیڈ فراہم کنندہ",
  groupEssentials: "⚡ روزمرہ کی ضروریات",
  groupHomeServices: "🏡 گھریلو خدمات",
  groupHealthCare: "❤️ صحت کی سہولیات",
  searchHint: "مجھے AC والا چاہیے ٹلسہ روڈ پر...",
  heroBadgeText: "🔥 پاکستان کی پہلی ایجنٹک معیشت",
  heroTitleText: "آپ کے قریب قابل بھروسہ خدمات، AI Escrow کے ساتھ محفوظ۔",
  heroDescText: "رومن اردو یا انگریزی میں بتائیں — ہمارے 5-ایجنٹ سسٹم خود میچنگ، بولی اور ادائیگی کریں گے۔",
  workerOnline: "آن لائن • اسکینننگ",
  workerWallet: "فعال والٹ",
  workerGigs: "مکمل کام",
  workerLeadsFeed: "💼 قریبی درخواستیں",
  workerCounterOffer: "جوابی پیشکش",
  tabHome: "ہوم",
  tabSearch: "میچنگ",
  tabHistory: "ایسکرو",
  tabProfile: "پروفائل",
};

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
}

export interface BookingDetails {
  id: string;
  provider: any;
  service: string;
  date: string;
  time: string;
  address: string;
  issue: string;
  status: 'Pending' | 'Accepted' | 'In progress' | 'Completed' | 'Cancelled';
  timelineLogs: { title: string; time: string; done: boolean }[];
  escrowReleased: boolean;
}

interface ThemeContextProps {
  theme: ThemeType;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  userRole: UserRole;
  toggleUserRole: () => void;
  language: AppLanguage;
  toggleLanguage: () => void;
  selectedLocationIndex: number;
  setSelectedLocationIndex: (idx: number) => void;
  t: TranslationSet;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  activeBooking: BookingDetails | null;
  setActiveBooking: React.Dispatch<React.SetStateAction<BookingDetails | null>>;
  chatHistory: any[];
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0);

  // Global user state management for high fidelity simulation
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Hassan',
    email: 'alikhan125466ak@gmail.com',
    phone: '03175084821',
    isLoggedIn: false, // Starts on LoginScreen
  });
  const [activeBooking, setActiveBooking] = useState<BookingDetails | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      id: 'chat-1',
      title: 'Mujhy AC thek karwana ha',
      timestamp: '5/19/2026, 4:08:47 PM',
      messages: [
        { id: 'm1', sender: 'user', text: 'Mujhy AC thek karwana ha' },
        { id: 'm2', sender: 'bot', text: 'Ji, AC Technician hazir hai! Hum aapke budget aur coordinates ke hisab se behtareen worker dhoond rahe hain.' }
      ]
    }
  ]);

  useEffect(() => {
    if (systemScheme) {
      setTheme(systemScheme as ThemeType);
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleUserRole = () => {
    setUserRole((prev) => (prev === 'client' ? 'provider' : 'client'));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const t = language === 'en' ? englishTranslations : urduTranslations;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark, 
      colors, 
      toggleTheme, 
      userRole, 
      toggleUserRole, 
      language, 
      toggleLanguage, 
      selectedLocationIndex,
      setSelectedLocationIndex,
      t,
      userProfile,
      setUserProfile,
      activeBooking,
      setActiveBooking,
      chatHistory,
      setChatHistory
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
