import { useEffect, useRef, useState } from 'react';
import { getLinkById } from '../services/backend.guardian';

export function useLinkPolling(linkId: string, onTerminal?: (status: string) => void) {
  const [status, setStatus] = useState<string>('pending');
  const [elapsed, setElapsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    let interval = 5000; // 5s start
    const tick = async () => {
      const res = await getLinkById(linkId);
      const total = Date.now() - startRef.current;
      setElapsed(total);
      if ((res as any)?.ok) {
        const st = (res as any).link?.status as string;
        setStatus(st);
        if (['active', 'declined', 'revoked'].includes(st)) {
          onTerminal?.(st);
          return; // stop
        }
      }
      // backoff after 30s
      if (total > 30000) interval = 10000;
      if (total > 120000) return; // stop after 2min
      timerRef.current = setTimeout(tick, interval);
    };

    timerRef.current = setTimeout(tick, interval);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [linkId]);

  return { status, elapsed };
}
































