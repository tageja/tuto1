/**
 * Auth Callback Page
 * Loading page shown during OAuth redirect
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      // The route.ts file handles the actual callback
      // This page is just shown briefly during redirect
      setTimeout(() => {
        router.push('/home');
      }, 1000);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}





