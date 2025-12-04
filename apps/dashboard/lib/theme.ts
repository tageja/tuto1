/**
 * Theme utility functions for managing light/dark/system theme modes
 * Persists to localStorage and Supabase user_profiles table
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'tuto.theme';

/**
 * Get the current theme preference from localStorage
 * Falls back to 'system' if not set
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    // localStorage not available or blocked
  }
  
  return 'system';
}

/**
 * Apply theme to DOM by adding/removing .dark class
 * Respects system preference when theme is 'system'
 */
export function applyThemeToDOM(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = theme === 'dark' || (theme === 'system' && systemDark);
  
  if (shouldBeDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Set theme preference and apply to DOM
 * Also persists to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // localStorage not available or blocked
  }
  
  applyThemeToDOM(theme);
}

/**
 * Sync theme to Supabase user_profiles table
 * Should be called after user authentication
 */
export async function syncThemeToSupabase(userId: string, theme: Theme): Promise<void> {
  try {
    const response = await fetch(`/api/school/settings/profile?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
    
    const result = await response.json();
    if (!result.success) {
      console.error('Failed to sync theme to Supabase:', result.error);
    }
  } catch (error) {
    console.error('Error syncing theme to Supabase:', error);
  }
}

/**
 * Initialize theme on page load
 * Reads from localStorage and applies to DOM
 * Should be called in a useEffect on mount
 */
export function initializeTheme(): Theme {
  const theme = getTheme();
  applyThemeToDOM(theme);
  return theme;
}

/**
 * Set up system preference listener
 * Updates theme when OS preference changes (only when theme is 'system')
 * Returns cleanup function
 */
export function setupSystemPreferenceListener(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = () => {
    const currentTheme = getTheme();
    if (currentTheme === 'system') {
      applyThemeToDOM('system');
    }
  };
  
  // Modern browsers
  if (mql.addEventListener) {
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }
  
  // Legacy browsers
  if (mql.addListener) {
    mql.addListener(handleChange);
    return () => mql.removeListener(handleChange);
  }
  
  return () => {};
}

