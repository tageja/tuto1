'use client';

import { useEffect, useRef, useState } from 'react';
import { handoffTo } from '@/lib/ecosystem';

/**
 * Ecosystem switcher for the School Dashboard.
 * Mirrors the social app's switcher — 9-dot grid icon that opens a compact
 * dropdown for navigating to Community (tuto.social) or Courses (pro.tuto.asia)
 * while carrying the signed-in session via secure fragment-based SSO.
 */
export default function EcosystemSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const items = [
    {
      key: 'school',
      label: 'Trường học',
      sub: 'Bảng điều khiển LMS',
      current: true,
      onClick: () => { window.location.href = '/'; },
    },
    {
      key: 'feed',
      label: 'Cộng đồng',
      sub: 'Bảng tin tuto.social',
      current: false,
      onClick: () => void handoffTo('feed'),
    },
    {
      key: 'courses',
      label: 'Học tại nhà',
      sub: 'Khoá học pro.tuto.asia',
      current: false,
      onClick: () => void handoffTo('courses'),
    },
  ] as const;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chuyển ứng dụng Tuto"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#0B5FFF] transition-colors"
      >
        {/* 9-dot grid icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5"  cy="5"  r="2" />
          <circle cx="12" cy="5"  r="2" />
          <circle cx="19" cy="5"  r="2" />
          <circle cx="5"  cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="5"  cy="19" r="2" />
          <circle cx="12" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-lg border border-gray-100 py-1 z-50"
        >
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Hệ sinh thái Tuto
          </div>
          {items.map((item) => (
            <button
              key={item.key}
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${item.current ? 'bg-blue-50/60' : ''}`}
            >
              <div className="flex-1">
                <p className={`text-sm font-semibold ${item.current ? 'text-[#0B5FFF]' : 'text-gray-800'}`}>
                  {item.label}
                  {item.current && (
                    <span className="ml-2 text-xs bg-[#0B5FFF] text-white rounded-full px-1.5 py-0.5 font-normal">Hiện tại</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
