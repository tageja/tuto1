import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState, useCallback } from 'react';

export function useNetwork() {
  const [isOffline, setIsOffline] = useState(false);
  const [lastChangeAt, setLastChangeAt] = useState<number>(Date.now());

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
      setLastChangeAt(Date.now());
    });
    return () => sub();
  }, []);

  const retryNow = useCallback(() => setLastChangeAt(Date.now()), []);

  return { isOffline, lastChangeAt, retryNow };
}




















