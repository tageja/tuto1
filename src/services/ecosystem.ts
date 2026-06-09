import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';

/**
 * Mobile ecosystem bridges. Opens the Home-Learning / Courses platform
 * (NurseEd at pro.tuto.asia) in an in-app browser, carrying the current
 * Supabase session via the courses app's `/auth/sso` route so the user is
 * auto-signed-in. Falls back to a plain open when there is no session.
 */
const COURSES_URL =
  ((Constants.expoConfig?.extra as { coursesUrl?: string } | undefined)?.coursesUrl) ??
  'https://pro.tuto.asia';

export async function openCourses(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && session?.refresh_token) {
      const params = new URLSearchParams({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      await WebBrowser.openBrowserAsync(`${COURSES_URL}/auth/sso?${params.toString()}`);
      return;
    }
  } catch {
    // Fall through to a plain open.
  }
  await WebBrowser.openBrowserAsync(COURSES_URL);
}
