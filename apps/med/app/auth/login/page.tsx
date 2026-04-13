'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/learn/courses'
  const errorParam = searchParams.get('error')

  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = getBrowserClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-extrabold text-[var(--text)]">NurseEd</span>
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
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
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
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Mật khẩu / Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
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
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
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

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="text-[var(--primary)] font-semibold hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          © 2026 NurseEd · med.tuto.asia
        </p>
      </div>
    </div>
  )
}
