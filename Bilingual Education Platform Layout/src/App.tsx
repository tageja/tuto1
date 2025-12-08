import { useState } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import { SplashScreen } from './components/SplashScreen';
import { LoginRegister } from './components/LoginRegister';
import { Dashboard } from './components/Dashboard';
import { InvestorPage } from './components/InvestorPage';
import { SchoolDashboard } from './components/SchoolDashboard';
import { MobileSchoolDashboard } from './components/mobile/MobileSchoolDashboard';
import { AppNavigator } from './components/AppNavigator';
import { Toaster } from './components/ui/sonner';

type Screen = 'splash' | 'login' | 'dashboard' | 'investor' | 'school' | 'mobile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('mobile');

  return (
    <LanguageProvider>
      <div className="size-full">
        {currentScreen === 'splash' && (
          <SplashScreen onComplete={() => setCurrentScreen('login')} />
        )}
        {currentScreen === 'login' && (
          <LoginRegister onComplete={() => setCurrentScreen('school')} />
        )}
        {currentScreen === 'dashboard' && <Dashboard />}
        {currentScreen === 'investor' && <InvestorPage />}
        {currentScreen === 'school' && <SchoolDashboard />}
        {currentScreen === 'mobile' && <MobileSchoolDashboard />}
        <AppNavigator onNavigate={setCurrentScreen} />
        <Toaster />
      </div>
    </LanguageProvider>
  );
}