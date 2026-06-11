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
        {/* pb-16 ensures content isn't hidden behind the MobileTabBar */}
        <div className="pb-16 lg:pb-0">
          {children}
        </div>
      </FeedInvalidationProvider>
    </AuthGateProvider>
  );
}
