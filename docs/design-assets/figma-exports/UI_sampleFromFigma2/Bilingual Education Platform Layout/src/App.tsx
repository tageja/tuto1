import { useState } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import { SplashScreen } from './components/SplashScreen';
import { LoginRegister } from './components/LoginRegister';
import { Dashboard } from './components/Dashboard';
import { InvestorPage } from './components/InvestorPage';

type Screen = 'splash' | 'login' | 'dashboard' | 'investor';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('investor');

  return (
    <LanguageProvider>
      <div className="size-full">
        {currentScreen === 'splash' && (
          <SplashScreen onComplete={() => setCurrentScreen('login')} />
        )}
        {currentScreen === 'login' && (
          <LoginRegister onComplete={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'dashboard' && <Dashboard />}
        {currentScreen === 'investor' && <InvestorPage />}
      </div>
    </LanguageProvider>
  );
}
