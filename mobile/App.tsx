import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// ─── Import Screens ─────────────────────────────────────────────────────────────────
import HomeScreen from './screens/HomeScreen';
// Placeholders for subsequent screens to keep TypeScript happy during navigation build
import SearchScreen from './screens/SearchScreen';
import ProvidersScreen from './screens/ProvidersScreen';
import BidScreen from './screens/BidScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import HistoryScreen from './screens/HistoryScreen';

// ─── Define Type-Safe Route Param List ──────────────────────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  Search: { category?: string } | undefined;
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
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f0f' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Providers" component={ProvidersScreen} />
          <Stack.Screen name="Bid" component={BidScreen} />
          <Stack.Screen name="Confirm" component={ConfirmScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
