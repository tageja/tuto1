import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text } from 'react-native';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { UserProvider } from './src/contexts/UserContext';
import { SchoolProvider } from './src/contexts/SchoolContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { initMonitoring, mark, measureAndLog } from './src/services/analytics';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [queryClient] = useState(() => new QueryClient());
  const appStart = React.useRef(mark('app_start')).current;

  // Initialize monitoring once
  React.useEffect(() => {
    initMonitoring();
  }, []);

  // Load Inter font family with aliases that match theme.typography.fontFamily
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-Italic': Inter_400Regular,
  });

  const handleSplashEnd = () => {
    setShowSplash(false);
    void measureAndLog('time_to_splash_end', appStart);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <SchoolProvider>
            <QueryClientProvider client={queryClient}>
              <ErrorBoundary
                fallbackRender={({ error, resetErrorBoundary }) => (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Text style={{ fontSize: 18, marginBottom: 12 }}>Something went wrong</Text>
                    <Text selectable style={{ opacity: 0.7 }}>{String(error)}</Text>
                  </View>
                )}
              >
                {/* Show video splash, then proceed to app. Fonts load in background. */}
                {showSplash ? (
                  <SplashScreen onVideoEnd={handleSplashEnd} />
                ) : (
                  <AppNavigator />
                )}
              </ErrorBoundary>
            </QueryClientProvider>
          </SchoolProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}