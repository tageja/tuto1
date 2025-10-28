// Simple debug logger that can be toggled via EXPO_PUBLIC_DEBUG_LOG (defaults to on)
const DEBUG_ENABLED = (process.env.EXPO_PUBLIC_DEBUG_LOG ?? '1') !== '0';

export const logDebug = (...args: any[]) => {
  if (!DEBUG_ENABLED) return;
  // eslint-disable-next-line no-console
  console.log('[DEBUG]', ...args);
};

export const logWarn = (...args: any[]) => {
  if (!DEBUG_ENABLED) return;
  // eslint-disable-next-line no-console
  console.warn('[DEBUG]', ...args);
};

export const logError = (...args: any[]) => {
  // Always log errors regardless
  // eslint-disable-next-line no-console
  console.error('[DEBUG]', ...args);
};



























