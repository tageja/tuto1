import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function VerifyPage() {
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
