import React, { useState } from 'react';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { UserProvider } from './src/contexts/UserContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/screens/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  return (
    <LanguageProvider>
      <UserProvider>
        {showSplash ? (
          <SplashScreen onVideoEnd={handleSplashEnd} />
        ) : (
          <AppNavigator />
        )}
      </UserProvider>
    </LanguageProvider>
  );
}