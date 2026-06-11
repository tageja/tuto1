"use client";

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { handoffTo } from '../../lib/ecosystem';
import { Menu, X } from 'lucide-react';

const SOCIAL_URL = process.env.NEXT_PUBLIC_SOCIAL_URL ?? 'http://localhost:3001';

import Hero from "../../components/landing/Hero";
import OpenAppShowcase from "../../components/landing/OpenAppShowcase";
import RoleGateway from "../../components/landing/RoleGateway";
import FeatureGrid from "../../components/landing/FeatureGrid";
import LiveKpis from "../../components/landing/LiveKpis";
import CTASection from "../../components/landing/CTASection";
import Footer from "../../components/landing/Footer";
import SchoolAccessModals from "../../components/landing/SchoolAccessModals";

export default function WebHomePage() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCommunityClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirectTo=/community');
      return;
    }
    // Tokens in URL fragment — never sent to server, not in access logs
    const fragment = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    window.location.href = `${SOCIAL_URL}/auth/sso-exchange#${fragment.toString()}`;
  }, [router]);

  const handleCoursesClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    void handoffTo('courses');
  }, []);

  // Teachers should go to teacher dashboard, not landing page
  useEffect(() => {
    if (!user) return;
    const role = user.role?.toLowerCase?.() ?? user.role;
    if (role === 'teacher') {
      router.replace('/school/teacher');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image src="/images/tuto-logo.png" alt="tuto." width={100} height={32} priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-primary">
              {t('landing.nav.home')}
            </Link>
            <Link href="/find-school" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              {t('landing.nav.findSchool')}
            </Link>
            <Link href="/find-teacher" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              {t('landing.nav.findTeacher')}
            </Link>
            <a
              href={`${SOCIAL_URL}/auth/sso`}
              onClick={handleCommunityClick}
              className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('landing.nav.community')}
            </a>
            <Link href="/school" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              {t('landing.nav.schoolDashboard')}
            </Link>
            <a
              href="#"
              onClick={handleCoursesClick}
              className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              {t('landing.nav.courses')}
            </a>
          </nav>

          {/* Actions */}
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
              <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors shadow-md">
                {t('landing.nav.dashboard')}
              </Link>
            ) : (
              <Link href="/login" className="px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-md">
                {t('landing.nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <Link href="/" className="block text-base font-bold text-primary">
                {t('landing.nav.home')}
              </Link>
              <Link href="/find-school" className="block text-base font-semibold text-gray-600">
                {t('landing.nav.findSchool')}
              </Link>
              <Link href="/find-teacher" className="block text-base font-semibold text-gray-600">
                {t('landing.nav.findTeacher')}
              </Link>
              <a
                href={`${SOCIAL_URL}/auth/sso`}
                onClick={handleCommunityClick}
                className="block text-base font-semibold text-gray-600 flex items-center gap-2 cursor-pointer"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                {t('landing.nav.community')}
              </a>
              <Link href="/school" className="block text-base font-semibold text-gray-600">
                {t('landing.nav.schoolDashboard')}
              </Link>
              <a
                href="#"
                onClick={handleCoursesClick}
                className="block text-base font-semibold text-gray-600 cursor-pointer"
              >
                {t('landing.nav.courses')}
              </a>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <button onClick={() => setLang('vi')} className={`font-semibold ${lang === 'vi' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>VI</button>
                  <button onClick={() => setLang('en')} className={`font-semibold ${lang === 'en' ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>EN</button>
                </div>
                <Link href="/login" className="text-primary font-bold">
                  {t('landing.nav.login')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <Hero />
        <OpenAppShowcase />
        <RoleGateway />
        <FeatureGrid />
        <LiveKpis />
        <CTASection />
      </main>

      <Footer />
      <SchoolAccessModals />
    </div>
  );
}
