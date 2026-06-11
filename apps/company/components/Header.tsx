'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const { t, locale, setLocale } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary shrink-0">
          <span className="bg-primary text-white px-2 py-0.5 rounded-lg text-base">tuto</span>
          <span className="text-on-surface hidden sm:block">global</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
          <Link href="/#products" className="hover:text-primary transition-colors">{t('nav.products')}</Link>
          <Link href="/#how"      className="hover:text-primary transition-colors">{t('nav.about')}</Link>
          <Link href="/terms"     className="hover:text-primary transition-colors">{t('nav.terms')}</Link>
          <Link href="/privacy"   className="hover:text-primary transition-colors">{t('nav.privacy')}</Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
            className="text-xs font-semibold text-muted border border-border rounded-md px-2.5 py-1.5 hover:border-primary hover:text-primary transition-colors"
          >
            {t('nav.language')}
          </button>
          <Link
            href="/#lead-form"
            className="hidden sm:inline-flex bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
          >
            {t('nav.tryFree')}
          </Link>
        </div>
      </div>
    </header>
  );
}
