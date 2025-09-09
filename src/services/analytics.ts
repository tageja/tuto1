import * as Sentry from '@sentry/react-native';

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

export const initMonitoring = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const environment = process.env.EXPO_PUBLIC_APP_ENVIRONMENT || 'development';
  const release = process.env.EXPO_PUBLIC_APP_VERSION || '0.0.0';
  if (dsn) {
    Sentry.init({ dsn, enableAutoSessionTracking: true, environment, release });
  }
};

let analyticsModule: any | null = null;
let analyticsTried = false;

async function ensureAnalyticsLoaded() {
  if (analyticsModule || analyticsTried) return analyticsModule;
  analyticsTried = true;
  try {
    // Lazy-load to avoid hard dependency during dev or CI
    analyticsModule = await import('expo-firebase-analytics');
  } catch (err) {
    analyticsModule = null;
  }
  return analyticsModule;
}

export const logEvent = async (name: string, params?: AnalyticsParams) => {
  try {
    const mod = await ensureAnalyticsLoaded();
    if (mod && typeof mod.logEvent === 'function') {
      await mod.logEvent(name, params as Record<string, any>);
    }
  } catch {}
  // Always add a Sentry breadcrumb as a reliable fallback
  Sentry.addBreadcrumb({ category: 'analytics', type: 'info', message: name, data: params });
};

export const setCurrentScreen = async (screenName: string) => {
  try {
    const mod = await ensureAnalyticsLoaded();
    if (mod && typeof mod.setCurrentScreen === 'function') {
      await mod.setCurrentScreen(screenName);
    } else if (mod && typeof mod.logEvent === 'function') {
      await mod.logEvent('screen_view', { screenName });
    }
  } catch {}
  Sentry.addBreadcrumb({ category: 'navigation', type: 'navigation', message: `screen:${screenName}` });
};

export const reportError = (error: unknown, context?: AnalyticsParams) => {
  Sentry.captureException(error, { extra: context });
};

type Props = Record<string, any>;

export function track(event: string, props: Props = {}) {
  try {
    // Hook any analytics SDK here (Sentry/Segment/etc.)
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.info(`[analytics] ${event}`, props);
    }
  } catch {}
}

// --- Performance helpers ---
export function mark(name: string): number {
  // Returns a start time for duration measurement
  // Use Date.now to avoid requiring Performance API across environments
  return Date.now();
}

export async function measureAndLog(name: string, startMs: number, extra?: AnalyticsParams) {
  const durationMs = Math.max(0, Date.now() - startMs);
  Sentry.addBreadcrumb({ category: 'performance', message: name, data: { durationMs, ...extra } });
  await logEvent(`perf_${name}`, { durationMs, ...(extra || {}) });
}






