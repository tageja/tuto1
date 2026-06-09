'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Facebook-style auth gate for guest browsing.
 *
 * Guests can read the feed freely; the moment they try to interact (react,
 * comment, follow, post, save) the component calls `promptAuth()` which opens a
 * sign-in/sign-up sheet instead of silently doing nothing. After signing in the
 * user is returned to where they were.
 */
interface AuthGateValue {
  promptAuth: (reason?: string) => void;
}

const AuthGateContext = createContext<AuthGateValue>({ promptAuth: () => {} });

export function useAuthGate() {
  return useContext(AuthGateContext);
}

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();
  const pathname = usePathname();

  const promptAuth = useCallback((r?: string) => {
    setReason(r);
    setOpen(true);
  }, []);

  const loginHref = `/login?redirectTo=${encodeURIComponent(pathname || '/feed')}`;
  const registerHref = `/login?mode=register&redirectTo=${encodeURIComponent(pathname || '/feed')}`;

  return (
    <AuthGateContext.Provider value={{ promptAuth }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-text-primary">
              Tham gia cộng đồng Tuto
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {reason ?? 'Đăng nhập hoặc đăng ký để tương tác với bài viết, theo dõi và trò chuyện.'}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={loginHref}
                className="w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0952E0] transition-colors"
              >
                Đăng nhập
              </a>
              <a
                href={registerHref}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
              >
                Tạo tài khoản
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-2 text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  );
}
