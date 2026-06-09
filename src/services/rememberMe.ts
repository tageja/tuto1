import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Remember-me preference for the mobile app.
 *
 * Supabase always persists the session to AsyncStorage (persistSession: true),
 * so "remember me" is implemented as a user preference that decides whether a
 * persisted session survives a cold app launch:
 *   - true  (default): keep the user signed in across launches
 *   - false: sign the user out on the next cold launch (Splash)
 *
 * Existing users who signed in before this preference existed have no stored
 * value; we treat that as `true` to preserve the previous always-persist
 * behaviour and avoid surprising sign-outs.
 */
const REMEMBER_ME_KEY = '@tuto/remember_me';

export async function setRememberMe(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(REMEMBER_ME_KEY, value ? 'true' : 'false');
  } catch {
    // Non-fatal: preference simply falls back to the default on read.
  }
}

export async function getRememberMe(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

export async function clearRememberMe(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REMEMBER_ME_KEY);
  } catch {
    // Non-fatal.
  }
}
