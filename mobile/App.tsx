import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Import Screens ─────────────────────────────────────────────────────────────────
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProvidersScreen from './screens/ProvidersScreen';
import BidScreen from './screens/BidScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

// ─── Define Type-Safe Route Param List ──────────────────────────────────────────────
export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Search: { category?: string } | undefined;
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121214',
          borderTopColor: '#262629',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#6366f1', // Indigo active accent
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: string = '';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName as any} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'AI Match' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'Escrows' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f0f' },
          }}
        >
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Providers" component={ProvidersScreen} />
          <Stack.Screen name="Bid" component={BidScreen} />
          <Stack.Screen name="Confirm" component={ConfirmScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
