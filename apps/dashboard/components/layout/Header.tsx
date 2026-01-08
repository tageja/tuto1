'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };
  
  const linkClass = (path: string) => 
    `text-sm font-semibold transition-colors ${
      isActive(path) ? 'text-[#0B5FFF]' : 'text-gray-600 hover:text-[#0B5FFF]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Image src="/images/tuto-logo.png" alt="tuto." width={100} height={32} priority />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={linkClass('/')}>
            {t('landing.nav.home')}
          </Link>
          <Link href="/find-school" className={linkClass('/find-school')}>
            {t('landing.nav.findSchool')}
          </Link>
          <Link href="/find-teacher" className={linkClass('/find-teacher')}>
            {t('landing.nav.findTeacher')}
          </Link>
          <Link href="/feed" className={linkClass('/feed')}>
            {t('landing.nav.communityFeed')}
          </Link>
          <Link href="/school" className={linkClass('/school')}>
            {t('landing.nav.schoolDashboard')}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <button 
              onClick={() => setLang('vi')}
              className={`hover:text-gray-900 transition-colors ${lang === 'vi' ? 'text-gray-900 font-bold' : ''}`}
            >
              VI
            </button>
            <span>/</span>
            <button 
              onClick={() => setLang('en')}
              className={`hover:text-gray-900 transition-colors ${lang === 'en' ? 'text-gray-900 font-bold' : ''}`}
            >
              EN
            </button>
          </div>
          
          {user ? (
            <Link href="/dashboard" className="px-5 py-2.5 bg-[#0B5FFF] text-white rounded-full text-sm font-bold hover:bg-[#0B5FFF]/90 transition-colors shadow-md">
              {t('landing.nav.dashboard')}
            </Link>
          ) : (
            <Link href="/login" className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-md">
              {t('landing.nav.login')}
            </Link>
          )}
        </div>

        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6">
          <nav className="flex flex-col gap-4">
            <Link href="/" className={linkClass('/')}>
              {t('landing.nav.home')}
            </Link>
            <Link href="/find-school" className={linkClass('/find-school')}>
              {t('landing.nav.findSchool')}
            </Link>
            <Link href="/find-teacher" className={linkClass('/find-teacher')}>
              {t('landing.nav.findTeacher')}
            </Link>
            <Link href="/feed" className={linkClass('/feed')}>
              {t('landing.nav.communityFeed')}
            </Link>
            <Link href="/school" className={linkClass('/school')}>
              {t('landing.nav.schoolDashboard')}
            </Link>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                <button 
                  onClick={() => setLang('vi')}
                  className={`hover:text-gray-900 transition-colors ${lang === 'vi' ? 'text-gray-900 font-bold' : ''}`}
                >
                  VI
                </button>
                <span>/</span>
                <button 
                  onClick={() => setLang('en')}
                  className={`hover:text-gray-900 transition-colors ${lang === 'en' ? 'text-gray-900 font-bold' : ''}`}
                >
                  EN
                </button>
              </div>
              {user ? (
                <Link href="/dashboard" className="px-4 py-2 bg-[#0B5FFF] text-white rounded-full text-sm font-bold">
                  {t('landing.nav.dashboard')}
                </Link>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-bold">
                  {t('landing.nav.login')}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
