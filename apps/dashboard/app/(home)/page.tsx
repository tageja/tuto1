"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

export default function WebHomePage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    upcomingBookings: 0,
    activePosts: 0,
    avgRating: 0,
  });
  const { t, lang, setLang } = useI18n();
  const { signOut, firebaseUser } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const teachersRes = await fetch('/api/teachers?maxRecords=8&status=Active');
        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(data.teachers || []);
          setStats((prev) => ({ ...prev, totalTeachers: data.teachers?.length || 0 }));
        }

        const postsRes = await fetch('/api/posts?maxRecords=6&status=Active');
        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.posts || []);
          setStats((prev) => ({ ...prev, activePosts: data.posts?.length || 0 }));
        }

        const bookingsRes = await fetch('/api/bookings?maxRecords=5&upcoming=true');
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.bookings || []);
          setStats((prev) => ({ ...prev, upcomingBookings: data.bookings?.length || 0 }));
        }

        if (teachers.length > 0) {
          const avgRating = teachers.reduce((sum, t) => sum + (t.rating || 0), 0) / teachers.length;
          setStats((prev) => ({ ...prev, avgRating: Math.round(avgRating * 10) / 10 }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Header */}
      <header style={{
        position: 'sticky' as const,
        top: 0,
        zIndex: 50,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex' as const,
          alignItems: 'center' as const,
          justifyContent: 'space-between' as const,
        }}>
          <Image src="/images/tuto-logo.png" alt="tuto." width={120} height={40} priority />
          <nav style={{ display: 'flex' as const, gap: '32px' }}>
            <Link href="/" style={{ fontSize: '15px', fontWeight: 500, color: '#0B5FFF', textDecoration: 'none' }}>
              {t('home')}
            </Link>
            <Link href="/find-teacher" style={{ fontSize: '15px', fontWeight: 500, color: '#4B5563', textDecoration: 'none' }}>
              {t('findTeacher')}
            </Link>
            <Link href="/bookings" style={{ fontSize: '15px', fontWeight: 500, color: '#4B5563', textDecoration: 'none' }}>
              {t('bookClass')}
            </Link>
            <Link href="/feed" style={{ fontSize: '15px', fontWeight: 500, color: '#4B5563', textDecoration: 'none' }}>
              {t('communityTitle')}
            </Link>
            <Link href="/school" style={{ fontSize: '15px', fontWeight: 500, color: '#4B5563', textDecoration: 'none' }}>
              {t('schoolDashboard') || 'School Dashboard'}
            </Link>
          </nav>
          <div style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '16px' }}>
            <button style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '6px', fontSize: '14px', color: '#6B7280', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('help')}
            </button>
            <div style={{ fontSize: '14px', color: '#6B7280', display: 'flex' as const, gap: '6px' }}>
              <button
                onClick={() => setLang('en')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: lang === 'en' ? 600 : 500,
                  color: lang === 'en' ? '#111827' : '#9CA3AF',
                }}
              >
                EN
              </button>
              <span style={{ color: '#D1D5DB' }}>|</span>
              <button
                onClick={() => setLang('vi')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: lang === 'vi' ? 600 : 500,
                  color: lang === 'vi' ? '#111827' : '#9CA3AF',
                }}
              >
                VI
              </button>
            </div>
            <Link href="/bookings/new" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '6px', background: '#0B5FFF', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('newBooking')}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 100%)', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid' as const, gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' as const }}>
          <div style={{ maxWidth: '560px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#111827', lineHeight: 1.2, marginBottom: '20px' }}>
              {t('heroTitle')}
            </h1>
            <p style={{ fontSize: '18px', color: '#6B7280', lineHeight: 1.6, marginBottom: '32px' }}>
              {t('heroSubtitle')}
            </p>
            <div style={{ display: 'flex' as const, gap: '16px' }}>
              <Link href="/find-teacher" style={{ background: '#0B5FFF', color: '#FFFFFF', border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                <svg style={{ display: 'inline', width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('findTeacher')}
              </Link>
              <Link href="/teachers/apply" style={{ background: 'transparent', color: '#0B5FFF', border: '2px solid #0B5FFF', padding: '12px 28px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                <svg style={{ display: 'inline', width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('becomeTeacher') || 'Become a Tutor'}
              </Link>
            </div>
          </div>
          <div style={{ maxHeight: '480px', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' as const }}>
            <Image
              src="/images/home-illustration.png"
              alt="Education Platform"
              width={640}
              height={800}
              style={{ width: '100%', height: 'auto', position: 'relative' as const, top: '-150px' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid' as const, gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', display: 'flex' as const, alignItems: 'center' as const, gap: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, flexShrink: 0, background: '#EEF2FF' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6366F1">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{t('activeTeachers')}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{stats.totalTeachers}</div>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', display: 'flex' as const, alignItems: 'center' as const, gap: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, flexShrink: 0, background: '#F3E8FF' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9333EA">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{t('upcomingClasses')}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{stats.upcomingBookings}</div>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', display: 'flex' as const, alignItems: 'center' as const, gap: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, flexShrink: 0, background: '#D1FAE5' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#059669">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{t('communityPosts')}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{stats.activePosts}</div>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', display: 'flex' as const, alignItems: 'center' as const, gap: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, flexShrink: 0, background: '#FEF3C7' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#F59E0B">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{t('averageRating')}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{stats.avgRating}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Popular Subjects */}
      <section style={{ padding: '80px 24px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', textAlign: 'center' as const, marginBottom: '12px' }}>
            {t('popularSubjects')}
          </h2>
          <p style={{ fontSize: '18px', color: '#6B7280', textAlign: 'center' as const, marginBottom: '60px' }}>
            {t('roleBannerDesc')}
          </p>
          
          {/* Subjects Pills */}
          <div style={{ display: 'flex' as const, flexWrap: 'wrap' as const, gap: '12px', justifyContent: 'center' as const, marginBottom: '60px' }}>
            {[
              t('subjectMath'), t('subjectEnglish'), t('subjectPhysics'), t('subjectChemistry'),
              t('subjectBiology'), t('subjectHistory'), t('subjectGeography'), t('subjectLiterature'),
              t('subjectComputerScience'), t('subjectArt'), t('subjectMusic'), t('subjectEconomics'),
            ].map((s) => (
              <a 
                key={s} 
                href={`#subject-${s}`}
                style={{
                  display: 'inline-flex' as const,
                  alignItems: 'center' as const,
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0B5FFF';
                  e.currentTarget.style.color = '#0B5FFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 95, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#111827';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                }}
              >
                {s}
              </a>
            ))}
          </div>

          {/* Feature Cards */}
          <div style={{ display: 'grid' as const, gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', textAlign: 'center' as const }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto 20px', background: '#EEF2FF' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#6366F1" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>{t('featureTeachersTitle')}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6 }}>{t('featureTeachersDesc')}</p>
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', textAlign: 'center' as const }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto 20px', background: '#F3E8FF' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9333EA" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>{t('featureBookingsTitle')}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6 }}>{t('featureBookingsDesc')}</p>
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', textAlign: 'center' as const }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto 20px', background: '#D1FAE5' }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>{t('featurePaymentsTitle')}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6 }}>{t('featurePaymentsDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Tuto Works Section */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#111827', textAlign: 'center' as const, marginBottom: '12px' }}>
            {t('howTutoWorks')}
          </h2>
          <p style={{ fontSize: '18px', color: '#6B7280', textAlign: 'center' as const, marginBottom: '60px' }}>
            {t('getStarted') || 'Get started in three simple steps'}
          </p>
          <div style={{ display: 'grid' as const, gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#0B5FFF', color: '#FFFFFF', fontSize: '32px', fontWeight: 700, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto 20px' }}>1</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>{t('findTeacher')}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280' }}>{t('findTeacherNear')}</p>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#6366F1', color: '#FFFFFF', fontSize: '32px', fontWeight: 700, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto 20px' }}>2</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>{t('bookClass')}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280' }}>{t('bookFreeTrial')}</p>
            </div>
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#8B5CF6', color: '#FFFFFF', fontSize: '32px', fontWeight: 700, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto 20px' }}>3</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>{t('viewProgress')}</h3>
              <p style={{ fontSize: '15px', color: '#6B7280' }}>{t('progressReports')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', background: 'linear-gradient(135deg, #0B5FFF 0%, #6366F1 100%)', borderRadius: '24px', padding: '60px 40px', textAlign: 'center' as const, color: '#FFFFFF' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>{t('getStarted')}</h2>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.95 }}>{t('heroSubtitle')}</p>
          <div style={{ display: 'flex' as const, gap: '16px', justifyContent: 'center' as const }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#FFFFFF', color: '#0B5FFF', border: 'none', padding: '14px 32px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                {t('getStarted')}
              </button>
            </Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'transparent', color: '#FFFFFF', border: '2px solid #FFFFFF', padding: '12px 32px', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                {t('contactUs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', padding: '60px 24px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid' as const, gridTemplateColumns: '2fr repeat(6, 1fr)', gap: '32px', marginBottom: '40px' }}>
            {/* Brand Column */}
            <div style={{ maxWidth: '300px' }}>
              <Image src="/images/tuto-logo.png" alt="Tuto" width={120} height={40} />
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '16px 0' }}>{t('heroSubtitle')}</p>
              <div style={{ display: 'flex' as const, gap: '12px', marginTop: '20px' }}>
                <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E5E7EB', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, color: '#6B7280', textDecoration: 'none' }}>f</a>
                <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E5E7EB', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, color: '#6B7280', textDecoration: 'none' }}>x</a>
                <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E5E7EB', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, color: '#6B7280', textDecoration: 'none' }}>in</a>
              </div>
            </div>

            {/* About Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{t('footerSectionAbout')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link href="/about" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('aboutTuto')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/trust-safety" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('trustSafety')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/how-it-works" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('howTutoWorks')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/impact" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('impactCommunity')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/newsroom" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('newsroom')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/careers" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('careers')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/investors" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('investors')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/contact" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('contactUs')}</Link></li>
              </ul>
            </div>

            {/* Parents Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{t('footerSectionParents')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link href="/find-teacher" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('findTeacherNear')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/trial" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('bookFreeTrial')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/pricing" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('pricingPackages')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/ratings-policy" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('reviewsPolicy')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/roadmaps" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('learningRoadmaps')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/safeguarding" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('safeguarding')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/help/parents" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('parentHelpCentre')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/download" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('appDownload')}</Link></li>
              </ul>
            </div>

            {/* Students Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{t('footerSectionStudents')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link href="/adaptive-homework" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('adaptiveHomework')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/practice" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('practiceLibrary')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/events" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('speakingClubs')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/planner" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('studyPlanner')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/scholarships" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('scholarships')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/badges" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('certificates')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/help/students" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('studentSupport')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/code-of-conduct" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('codeOfConduct')}</Link></li>
              </ul>
            </div>

            {/* Schools Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{t('footerSectionSchools')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link href="/schools" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('tutoForSchools')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/schools/analytics" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('adminDashboard')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/schools/lesson-planner" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('curriculumPlanner')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/schools/assessments" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('assessments')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/schools/onboarding" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('onboardingTraining')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/schools/case-studies" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('caseStudies')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/schools/pricing" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('pricingSchools')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/help/schools" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('schoolSupport')}</Link></li>
              </ul>
            </div>

            {/* Institutes Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{t('footerSectionInstitutes')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link href="/institutes/partner" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('partnerWithTuto')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/institutes/crm" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('leadManagement')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/institutes/scheduling" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('classScheduling')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/institutes/ads" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('adsFeatured')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/institutes/recruit" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('teacherRecruitment')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/institutes/reviews" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('ratingsGuidelines')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/institutes/billing" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('billingPayouts')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/help/partners" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('partnerHelpCentre')}</Link></li>
              </ul>
            </div>

            {/* Teachers Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{t('footerSectionTeachers')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link href="/teachers/apply" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('becomeTeacher')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/teachers/onboarding" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('onboardingVerification')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/teachers/payments" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('paymentsSchedule')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/teachers/calendar" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('calendarAvailability')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/teachers/resources" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('teachingResources')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/teachers/community" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('communityEvents')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/teachers/quality" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('qualityStandards')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/help/teachers" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('teacherSupport')}</Link></li>
              </ul>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>{t('footerSectionQuickLinks')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link href="/help" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('helpCentre')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/blog" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('blogGuides')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/developers" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('developerPortal')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/status" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('systemStatus')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/legal/terms" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('termsOfService')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/legal/privacy" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('privacyPolicy')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/legal/cookies" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('cookiePreferences')}</Link></li>
                <li style={{ marginBottom: '10px' }}><Link href="/sitemap" style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', lineHeight: 1.35 }}>{t('sitemap')}</Link></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={{ display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingTop: '32px', borderTop: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>© {new Date().getFullYear()} Tuto. All rights reserved.</p>
            <div style={{ display: 'flex' as const, gap: '24px' }}>
              <Link href="/legal/privacy" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>{t('footerPrivacy')}</Link>
              <Link href="/legal/terms" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>{t('footerTerms')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
