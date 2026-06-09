import Header                      from '@/components/layout/Header';
import { FeedInvalidationProvider } from '@/contexts/FeedInvalidationContext';
import { FeedRefreshListener }      from '@/components/feed/FeedRefreshListener';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeedInvalidationProvider>
      <FeedRefreshListener />
      <Header />
      {children}
    </FeedInvalidationProvider>
  );
}
