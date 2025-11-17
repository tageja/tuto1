import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from './LanguageContext';
import LoginScreen from './LoginScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLoginComplete = () => {
    setIsLoggedIn(true);
    // Navigate to dashboard or home screen
    console.log('Login completed!');
  };

  return (
    <LanguageProvider>
      <StatusBar style="dark" />
      <LoginScreen onComplete={handleLoginComplete} />
    </LanguageProvider>
  );
}
