/**
 * Theme utilities: dashboard is light-only. Dark/system removed.
 * Keeps API compatible (Theme type) but always applies light.
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'tuto.theme';

/** Always returns 'light'; dashboard no longer supports dark/system. */
export function getTheme(): Theme {
  return 'light';
}

/** Always removes .dark from document; never adds it. */
export function applyThemeToDOM(_theme?: Theme): void {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.remove('dark');
}

/** Ignores argument; always sets light and applies to DOM. */
export function setTheme(_theme?: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  } catch (e) {}
  applyThemeToDOM('light');
}

/** Sync theme to Supabase; always sends 'light'. */
export async function syncThemeToSupabase(userId: string, theme?: Theme): Promise<void> {
  try {
    const response = await fetch(`/api/school/settings/profile?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'light' }),
    });
    const result = await response.json();
    if (!result.success) {
      console.error('Failed to sync theme to Supabase:', result.error);
    }
  } catch (error) {
    console.error('Error syncing theme to Supabase:', error);
  }
}

/** Apply light theme on load; returns 'light'. */
export function initializeTheme(): Theme {
  setTheme('light');
  return 'light';
}

/** No-op; dashboard no longer follows system preference. Returns cleanup that does nothing. */
export function setupSystemPreferenceListener(): () => void {
  return () => {};
}
