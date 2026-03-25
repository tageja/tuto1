'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FeedInvalidationContextValue {
  feedVersion: number;
  invalidateFeed: () => void;
}

const FeedInvalidationContext = createContext<FeedInvalidationContextValue>({
  feedVersion:    0,
  invalidateFeed: () => {},
});

export function FeedInvalidationProvider({ children }: { children: ReactNode }) {
  const [feedVersion, setFeedVersion] = useState(0);
  const invalidateFeed = useCallback(() => setFeedVersion((v) => v + 1), []);
  return (
    <FeedInvalidationContext.Provider value={{ feedVersion, invalidateFeed }}>
      {children}
    </FeedInvalidationContext.Provider>
  );
}

export function useFeedInvalidation() {
  return useContext(FeedInvalidationContext);
}
