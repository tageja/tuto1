import Link from 'next/link';
import Image from 'next/image';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
      <Image src="/images/tuto-logo.png" alt="Tuto" width={64} height={64} className="mb-6 opacity-60" />
      <h1 className="text-xl font-bold text-text-primary mb-2">Xác thực thất bại</h1>
      <p className="text-text-secondary text-sm mb-6">
        Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.
      </p>
      <Link href="/login" className="btn-primary">
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
