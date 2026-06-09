'use client';

import React, { useEffect, useRef, useState } from 'react';
import { handoffTo } from '@/lib/ecosystem';

/**
 * Compact "ecosystem switcher" that lets users move between the three Tuto
 * surfaces (Community feed, School dashboard, Courses) while carrying their
 * session via SSO. Deliberately understated: an apps-grid icon that opens a
 * small menu, so the LMS/Courses entries are always visible but never loud.
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

  const items: { key: string; label: string; sub: string; onClick: () => void; current?: boolean }[] = [
    {
      key: 'feed',
      label: 'Cộng đồng',
      sub: 'Bảng tin tuto.social',
      onClick: () => { window.location.href = '/feed'; },
      current: true,
    },
    {
      key: 'school',
      label: 'Trường học',
      sub: 'Bảng điều khiển LMS',
      onClick: () => void handoffTo('school'),
    },
    {
      key: 'courses',
      label: 'Học tại nhà',
      sub: 'Khoá học pro.tuto.asia',
      onClick: () => void handoffTo('courses'),
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Chuyển ứng dụng Tuto"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:bg-surface hover:text-primary transition-colors"
      >
        {/* apps-grid icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="5" r="2" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="12" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 bg-white rounded-card shadow-lg border border-gray-100 py-1 z-50"
        >
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Hệ sinh thái Tuto
          </div>
          {items.map((item) => (
            <button
              key={item.key}
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className="w-full text-left flex flex-col px-4 py-2 hover:bg-surface transition-colors"
            >
              <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                {item.label}
                {item.current && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5">
                    Đang xem
                  </span>
                )}
              </span>
              <span className="text-xs text-text-secondary">{item.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
