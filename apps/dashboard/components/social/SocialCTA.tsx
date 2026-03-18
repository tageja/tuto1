'use client';

import Link from 'next/link';

interface Props {
  /** Override the default Social URL (useful in SSO-aware contexts) */
  href?: string;
  className?: string;
}

export default function SocialCTA({ href, className = '' }: Props) {
  const destination = href ?? (process.env.NEXT_PUBLIC_SOCIAL_URL || 'http://localhost:3001');

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B5FFF] to-[#3B82F6] ${className}`}
    >
      <div className="px-6 py-8 sm:px-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Text */}
        <div className="text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            Tham gia cộng đồng Tuto
          </h3>
          <p className="mt-1 text-sm sm:text-base text-blue-100">
            Kết nối với giáo viên, phụ huynh và học sinh — chia sẻ thành tích, sự kiện và cập nhật mỗi ngày.
          </p>
        </div>

        {/* CTA button */}
        <Link
          href={destination}
          target="_blank"
          rel="noopener"
          className="shrink-0 inline-flex items-center gap-2 bg-white text-primary font-semibold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all"
        >
          Khám phá ngay
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
