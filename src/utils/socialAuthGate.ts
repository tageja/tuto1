import { Alert } from 'react-native';

/**
 * Mobile community-first auth gate.
 *
 * Guests can browse the social feed freely; the moment they try to interact
 * (react, comment, save, follow, post) this prompts them to sign in instead of
 * silently failing. Navigates to the root `Login` screen on confirmation.
 */
export function promptSocialSignIn(
  // Loosely typed: callers navigate to the root `Login` screen, which is not
  // part of the social stack's param list.
  navigation: { navigate: (name: any, params?: any) => void },
  message?: string,
): void {
  Alert.alert(
    'Tham gia cộng đồng Tuto',
    message ?? 'Đăng nhập hoặc đăng ký để tương tác với bài viết, theo dõi và trò chuyện.',
    [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Đăng nhập', onPress: () => navigation.navigate('Login', { mode: 'login' }) },
    ],
  );
}
