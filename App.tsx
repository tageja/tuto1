import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { UserProvider } from './src/contexts/UserContext';
import { SchoolProvider } from './src/contexts/SchoolContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initMonitoring, mark, measureAndLog } from './src/services/analytics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  // CRITICAL: Hide splash screen IMMEDIATELY when React starts
  React.useEffect(() => {
    // Hide splash as soon as React mounts - don't wait for anything
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Initialize monitoring in background
  React.useEffect(() => {
    try {
      initMonitoring();
    } catch (e) {
      console.warn('Monitoring init failed:', e);
    }
  }, []);

  // Load fonts in background - don't block app
  useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-Italic': Inter_400Regular,
  });

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, marginBottom: 12, color: '#000' }}>Something went wrong</Text>
          <Text selectable style={{ opacity: 0.7, color: '#666' }}>{String(error)}</Text>
        </View>
      )}
    >
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <SchoolProvider>
              <QueryClientProvider client={queryClient}>
                <AppNavigator />
              </QueryClientProvider>
            </SchoolProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
