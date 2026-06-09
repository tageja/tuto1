import Header                      from '@/components/layout/Header';
import { FeedInvalidationProvider } from '@/contexts/FeedInvalidationContext';
import { FeedRefreshListener }      from '@/components/feed/FeedRefreshListener';
import { AuthGateProvider }         from '@/contexts/AuthGateContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGateProvider>
      <FeedInvalidationProvider>
        <FeedRefreshListener />
        <Header />
        {children}
      </FeedInvalidationProvider>
    </AuthGateProvider>
  );
}
