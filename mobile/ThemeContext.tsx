import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark';
export type UserRole = 'client' | 'provider';
export type AppLanguage = 'en' | 'ur';

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
}

const englishTranslations: TranslationSet = {
  homeSubtitleClient: "Pakistan's 1st Agentic Economy",
  homeSubtitleWorker: "KaamGraph Provider Portal",
  homeTitleClient: "KaamGraph",
  homeTitleWorker: "Arsalan's Panel",
  heroBadge: "HACKATHON EDITION",
  heroTitle: "Trusted pricing, locked with AI Escrow.",
  heroDescription: "Describe your task in Roman Urdu or English and let our 5-Agent pipeline handle matching, bidding & payments.",
  searchPlaceholder: 'Type what you need (e.g. "Plumber chahye G-13")',
  selectCategory: "Select a Category",
  selectCategorySub: "Tap to auto-populate request intents",
  poweredBy: "Powered by Google Antigravity",
  howSubagentsSecure: "How our 5 sub-agents secure your job:",
  leadHeader: "Incoming Local Leads (Sector G-13)",
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
  premiumClient: "Premium Client • Islamabad",
  topRatedProvider: "Top Rated Provider • Sector G-13",
};

const urduTranslations: TranslationSet = {
  homeSubtitleClient: "پاکستان کی پہلی ایجنٹک معیشت",
  homeSubtitleWorker: "کام گراف فراہم کنندہ پورٹل",
  homeTitleClient: "کام گراف",
  homeTitleWorker: "ارسلان کا پینل",
  heroBadge: "ہیکاتھون ایڈیشن",
  heroTitle: "بھروسہ مند قیمتیں، جو کہ AI ایسکرو کے ساتھ محفوظ ہیں",
  heroDescription: "اپنی ضرورت رومن اردو یا انگریزی میں بتائیں اور ہمارے ۵-ایجنٹ پائپ لائن کو میچنگ، بولی اور ادائیگی سنبھالنے دیں",
  searchPlaceholder: "اپنی ضرورت ٹائپ کریں (جیسے: پلمبر چاہئے G-13)",
  selectCategory: "زمرہ منتخب کریں",
  selectCategorySub: "رکویسٹ کو خود بخود بھرنے کے لیے کلک کریں",
  poweredBy: "گوگل اینٹی گریویٹی کے ذریعے چلنے والا",
  howSubagentsSecure: "ہمارے ۵ سب ایجنٹس آپ کے کام کو کیسے محفوظ بناتے ہیں:",
  leadHeader: "آمدہ مقامی لیڈز (سیکٹر G-13)",
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
  premiumClient: "پریمیم کلائنٹ • اسلام آباد",
  topRatedProvider: "ٹاپ ریٹیڈ فراہم کنندہ • سیکٹر G-13",
};

interface ThemeContextProps {
  theme: ThemeType;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  userRole: UserRole;
  toggleUserRole: () => void;
  language: AppLanguage;
  toggleLanguage: () => void;
  t: TranslationSet;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [language, setLanguage] = useState<AppLanguage>('en');

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
      t 
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
