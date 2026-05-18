'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase'
import { getAuthCallbackUrl } from '@/lib/auth-utils'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

type Mode = 'password' | 'magic'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  useDocumentTitle('Sign in')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/learn/courses'
  const errorParam = searchParams.get('error')

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  useEffect(() => {
    if (errorParam === 'callback_failed') setError('Xác minh email thất bại. Vui lòng thử lại.')
    if (errorParam === 'missing_code') setError('Liên kết không hợp lệ. Vui lòng đăng nhập lại.')
  }, [errorParam])

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = getBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email hoặc mật khẩu không đúng.'
        : authError.message)
      return
    }
    router.push(next)
    router.refresh()
  }

  async function handleGoogleLogin() {
    setError(null)
    setGoogleLoading(true)
    const supabase = getBrowserClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl(next),
      },
    })
    if (authError) {
      setError(authError.message)
      setGoogleLoading(false)
    }
    // On success, browser is redirected — no further action needed
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = getBrowserClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(next),
      },
    })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    setMagicSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-baseline gap-1.5 mb-4">
            <span className="text-2xl font-extrabold text-[var(--primary)] leading-none">tuto.</span>
            <span className="text-xl font-semibold text-[var(--text-muted)] leading-none">Pro</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Đăng nhập / Sign in</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Chào mừng trở lại · Welcome back</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] p-8">
          {/* Mode tabs */}
          <div className="flex rounded-xl border border-[var(--border)] p-1 mb-6 gap-1">
            <button
              onClick={() => { setMode('password'); setError(null); setMagicSent(false) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'password' ? 'bg-[var(--primary)] text-white shadow' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Mật khẩu
            </button>
            <button
              onClick={() => { setMode('magic'); setError(null); setMagicSent(false) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'magic' ? 'bg-[var(--primary)] text-white shadow' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Magic link
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {magicSent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="font-semibold text-[var(--text)] mb-2">Kiểm tra email của bạn</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Chúng tôi đã gửi liên kết đăng nhập đến <strong>{email}</strong>.
                Nhấn vào liên kết để đăng nhập.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="mt-5 text-sm text-[var(--primary)] hover:underline"
              >
                Thử email khác
              </button>
            </div>
          ) : mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ten@benhvien.vn"
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Mật khẩu / Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <p className="text-sm text-[var(--text-muted)] text-center">
                Nhập email — chúng tôi gửi liên kết đăng nhập ngay lập tức, không cần mật khẩu.
              </p>
              <div>
                <label htmlFor="magic-email" className="block text-sm font-medium text-[var(--text)] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="magic-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ten@benhvien.vn"
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? 'Đang gửi...' : 'Gửi magic link'}
              </button>
            </form>
          )}

          {!magicSent && (
            <div className="mt-5">
              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-muted)] shrink-0">hoặc / or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="mt-3 w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)] bg-white hover:bg-[var(--surface)] transition-all disabled:opacity-60"
              >
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                {googleLoading ? 'Đang chuyển hướng...' : 'Tiếp tục với Google'}
              </button>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-[var(--primary)] font-semibold hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          © 2026 tuto. Pro · pro.tuto.asia
        </p>
      </div>
    </div>
  )
}
