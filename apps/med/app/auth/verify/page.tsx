'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, AlertCircle } from 'lucide-react'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
          <span className="text-sm text-[var(--text-muted)]">Đang tải… / Loading…</span>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  useDocumentTitle('Verify email')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const errorParam = searchParams.get('error')
  const hasInvalidToken = Boolean(errorParam)

  if (hasInvalidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
            Liên kết không hợp lệ / Invalid link
          </h1>
          <p className="text-[var(--text-muted)] leading-relaxed mb-2">
            Liên kết xác nhận đã hết hạn hoặc không đúng. Vui lòng đăng ký lại hoặc yêu cầu email mới.
          </p>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            This verification link is invalid or has expired. Please register again or request a new email.
          </p>
          <div className="mt-8 flex flex-col gap-3 items-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-all"
            >
              Về trang đăng nhập · Back to login
            </Link>
            <Link href="/auth/register" className="text-sm text-[var(--primary)] hover:underline">
              Thử đăng ký lại · Try registering again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-[var(--primary)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
          Xác nhận email / Verify your email
        </h1>

        <p className="text-[var(--text-muted)] leading-relaxed mb-2">
          Chúng tôi đã gửi liên kết xác nhận tới email của bạn.
        </p>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          We sent a confirmation link to your email address. Click the link to activate your account
          and start learning.
        </p>

        <div className="mt-8 flex flex-col gap-3 items-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--primary-dark)] transition-all"
          >
            Về trang đăng nhập · Back to login
          </Link>
          <p className="text-xs text-[var(--text-muted)]">
            Không nhận được email? Kiểm tra thư mục spam, hoặc{' '}
            <Link href="/auth/register" className="text-[var(--primary)] hover:underline">
              thử lại
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
