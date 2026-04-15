'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Hash, ArrowRight, Loader2 } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase'
import { getAuthCallbackUrl } from '@/lib/auth-utils'
import type { NursedHospital } from '@/lib/supabase'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [hospitals, setHospitals] = useState<Pick<NursedHospital, 'id' | 'name' | 'invite_code'>[]>([])
  const [resolvedHospitalId, setResolvedHospitalId] = useState<string | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch hospitals for invite-code lookup
  useEffect(() => {
    fetch('/api/hospitals')
      .then((r) => r.json())
      .then((j) => setHospitals(j.data ?? []))
      .catch(() => {})
  }, [])

  // Resolve invite code to hospital
  useEffect(() => {
    if (!inviteCode.trim()) { setResolvedHospitalId(null); setCodeError(null); return }
    const match = hospitals.find(
      (h) => h.invite_code?.toLowerCase() === inviteCode.trim().toLowerCase(),
    )
    if (match) {
      setResolvedHospitalId(match.id)
      setCodeError(null)
    } else {
      setResolvedHospitalId(null)
      setCodeError('Mã mời không hợp lệ / Invalid invite code')
    }
  }, [inviteCode, hospitals])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inviteCode && codeError) return
    setError(null)
    setLoading(true)

    const supabase = getBrowserClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
        data: {
          full_name: fullName,
          role: 'learner',
          hospital_id: resolvedHospitalId,
        },
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-3">Kiểm tra email của bạn</h1>
          <p className="text-[var(--text-muted)] leading-relaxed mb-2">
            Chúng tôi đã gửi email xác nhận đến <strong>{email}</strong>.
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed text-sm">
            Nhấn vào liên kết trong email để kích hoạt tài khoản và bắt đầu học.
          </p>
          <Link
            href="/auth/login"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-all"
          >
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-extrabold text-[var(--text)]">NurseEd</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Đăng ký / Register</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Tạo tài khoản miễn phí · Free account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] p-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Họ và tên / Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Thị Lan"
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Mật khẩu / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
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
              <p className="text-xs text-[var(--text-muted)] mt-1">Tối thiểu 8 ký tự / Min. 8 characters</p>
            </div>

            {/* Invite code (optional) */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Mã mời bệnh viện{' '}
                <span className="text-[var(--text-muted)] font-normal">(tùy chọn / optional)</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="VD: CHIR2026"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    codeError
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : resolvedHospitalId
                      ? 'border-green-300 focus:ring-green-200 focus:border-green-400'
                      : 'border-[var(--border)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
                  }`}
                />
              </div>
              {codeError && <p className="text-xs text-red-600 mt-1">{codeError}</p>}
              {resolvedHospitalId && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ {hospitals.find((h) => h.id === resolvedHospitalId)?.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!!inviteCode && !!codeError)}
              className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-[var(--primary)] font-semibold hover:underline">
              Đăng nhập
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
