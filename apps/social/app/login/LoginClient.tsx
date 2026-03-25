'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3000';

export default function LoginClient() {
  const searchParams  = useSearchParams();
  const fallback      = searchParams.get('fallback') === '1';
  const redirectTo    = searchParams.get('redirectTo') ?? '/feed';
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Redirect immediately to main platform login unless ?fallback=1
  useEffect(() => {
    if (fallback) return;

    const socialRedirect = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'}${redirectTo}`,
    );
    const destination = `${DASHBOARD_URL}/login?redirectTo=/community&socialRedirect=${socialRedirect}`;

    // Small delay so the user sees the message before redirect
    const timer = setTimeout(() => {
      window.location.href = destination;
    }, 1500);

    return () => clearTimeout(timer);
  }, [fallback, redirectTo]);

  // ── Fallback form (emergency access) ─────────────────────────────────────
  if (fallback) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.href = redirectTo;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <Image src="/images/tuto-logo.png" alt="tuto." width={90} height={28} priority />
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
            Đăng nhập dự phòng
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Chỉ sử dụng khi không thể truy cập trang chính.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            <a href={DASHBOARD_URL} className="text-primary hover:underline">
              ← Quay lại trang chính
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Primary experience: redirect with loading message ─────────────────────
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 px-4">
      <Image src="/images/tuto-logo.png" alt="tuto." width={100} height={32} priority />
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-medium text-gray-700">
          Bạn sẽ được chuyển đến trang đăng nhập Tuto...
        </p>
        <p className="text-sm text-gray-400">
          Sau khi đăng nhập, bạn sẽ tự động vào Cộng đồng.
        </p>
      </div>
      <a
        href={`${DASHBOARD_URL}/login?redirectTo=/community`}
        className="text-sm text-primary font-semibold hover:underline"
      >
        Nhấn vào đây nếu không tự chuyển hướng
      </a>
    </div>
  );
}
