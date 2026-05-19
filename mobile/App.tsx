// GigConnect AI / App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, LogBox } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './ThemeContext';

// Suppress known non-critical third-party platform/web warnings
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  'Blocked aria-hidden on an element',
  'Slow network is detected',
]);

if (typeof window !== 'undefined') {
  const ignoreWarns = [
    'props.pointerEvents is deprecated',
    'Blocked aria-hidden on an element',
    'Slow network is detected',
  ];
  
  const originalWarn = console.warn;
  console.warn = function (...args) {
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    if (ignoreWarns.some(w => msg.includes(w))) return;
    originalWarn.apply(console, args);
  };

  const originalErr = console.error;
  console.error = function (...args) {
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    if (ignoreWarns.some(w => msg.includes(w))) return;
    originalErr.apply(console, args);
  };
}

// ─── Import Screens ─────────────────────────────────────────────────────────────────
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import MapScreen from './screens/MapScreen';
import WorkerLeadsScreen from './screens/WorkerLeadsScreen';
import WorkerMapScreen from './screens/WorkerMapScreen';
import BookScreen from './screens/BookScreen';
import ReviewBookingScreen from './screens/ReviewBookingScreen';
import ProvidersScreen from './screens/ProvidersScreen';
import BidScreen from './screens/BidScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

// ─── Define Type-Safe Route Param List ──────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  Home: undefined;
  Search: { category?: string } | undefined;
  Map: undefined;
  Book: { provider: any; serviceType: string } | undefined;
  Review: { provider: any; serviceType: string; selectedDate: string; selectedTime: string } | undefined;
  History: undefined;
  Profile: undefined;
  Providers: {
    serviceType: string;
    budget: number;
    location: string;
    time: string;
    rawRequest: string;
    jobId: string;
    providersList: any[];
    initialBid: any;
  };
  Bid: {
    jobId: string;
    providerId: string;
    providerName: string;
    serviceType: string;
    clientBudget: number;
    providerMin: number;
    agreedPrice: number;
    action: string;
    reason?: string;
    priceBreakdown?: any;
    bidReasoning?: string;
  };
  Confirm: {
    jobId: string;
    bookingId: string;
    escrowId: string;
    total: number;
    fee: number;
    netToProvider: number;
    providerName: string;
    serviceType: string;
    providerSms: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// ─── Bottom Tab Navigator Setup ─────────────────────────────────────────────────────
function TabNavigator() {
  const { t, userRole, language, colors } = useTheme();
  const isWorker = userRole === 'provider';
  const activeColor = isWorker ? colors.success : colors.primary;

  const screenOptions = ({ route }: any) => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.cardBackground,
      borderTopColor: isWorker ? colors.success : colors.border,
      borderTopWidth: isWorker ? 1.5 : 1,
      paddingBottom: 8,
      paddingTop: 8,
      height: 60,
    },
    tabBarActiveTintColor: activeColor,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' as const },
    tabBarIcon: ({ color, focused }: any) => {
      let iconName = '';
      if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
      else if (route.name === 'Search') iconName = focused ? 'sparkles' : 'sparkles-outline';
      else if (route.name === 'Leads') iconName = focused ? 'briefcase' : 'briefcase-outline';
      else if (route.name === 'Map') iconName = focused ? 'map' : 'map-outline';
      else if (route.name === 'Zone') iconName = focused ? 'radio' : 'radio-outline';
      else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
      else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
      return <Ionicons name={iconName as any} size={20} color={color} />;
    },
  });

  if (isWorker) {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t.tabHome }} />
        <Tab.Screen name="Leads" component={WorkerLeadsScreen} options={{ tabBarLabel: language === 'en' ? 'Leads' : 'جابز' }} />
        <Tab.Screen name="Zone" component={WorkerMapScreen} options={{ tabBarLabel: language === 'en' ? 'My Zone' : 'میرا زون' }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: t.tabHistory }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t.tabProfile }} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t.tabHome }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: t.tabSearch }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: language === 'en' ? 'Map' : 'نقشہ' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: t.tabHistory }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t.tabProfile }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { colors, theme } = useTheme();
  
  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          {/* Authentication portal routes */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />

          {/* Tab Navigation houses core dashboards */}
          <Stack.Screen name="Main" component={TabNavigator} />
          
          {/* Fallback routes for direct nested targeting */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Book" component={BookScreen} />
          <Stack.Screen name="Review" component={ReviewBookingScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          
          {/* Detail screens are pushed on top for transaction flows */}
          <Stack.Screen name="Providers" component={ProvidersScreen} />
          <Stack.Screen name="Bid" component={BidScreen} />
          <Stack.Screen name="Confirm" component={ConfirmScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
