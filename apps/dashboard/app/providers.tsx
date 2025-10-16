'use client';

import { I18nProvider } from '../contexts/I18nContext';
import { SchoolProvider } from '../contexts/SchoolContext';
import { AuthProvider } from '../contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <SchoolProvider>
          {children}
        </SchoolProvider>
      </I18nProvider>
    </AuthProvider>
  );
}


