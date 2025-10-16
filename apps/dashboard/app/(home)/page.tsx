"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Field from '../../components/ui/Field';
import { useI18n } from '../../contexts/I18nContext';
import { useSchool } from '../../contexts/SchoolContext';
import LoadingState from '../../components/shared/LoadingState';
import StatsCard from '../../components/shared/StatsCard';

export default function WebHomePage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState({
    totalTeachers: 0,
    upcomingBookings: 0,
    activePosts: 0,
    avgRating: 0,
  });
  const { t, lang, setLang } = useI18n();
  const { selectedSchool, joinedSchools, joinByCode } = useSchool();

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch teachers
        const teachersRes = await fetch('/api/teachers?maxRecords=8&status=Active');
        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(data.teachers || []);
          setStats((prev) => ({ ...prev, totalTeachers: data.teachers?.length || 0 }));
        }

        // Fetch posts
        const postsRes = await fetch('/api/posts?maxRecords=6&status=Active');
        if (postsRes.ok) {
          const data = await postsRes.json();
          setPosts(data.posts || []);
          setStats((prev) => ({ ...prev, activePosts: data.posts?.length || 0 }));
        }

        // Fetch upcoming bookings
        const bookingsRes = await fetch('/api/bookings?maxRecords=5&upcoming=true');
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data.bookings || []);
          setStats((prev) => ({ ...prev, upcomingBookings: data.bookings?.length || 0 }));
        }

        // Calculate average rating
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
  }, [teachers.length]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]" id="main">
      {/* Sticky header */}
      <header className="header">
        <div className="container" style={{paddingTop:12, paddingBottom:12}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <Image src="/api/assets/images/tuto-logo.png" alt="Tuto" width={120} height={48} />
              <div>
                <div style={{fontWeight:800}}></div>
                <div className="muted" style={{fontSize:12}}> community, schools, teachers, bookings & reviews</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">{t('help')}</Button>
              <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}>{lang === 'vi' ? 'VI / EN' : 'EN / VI'}</Button>
              <Link href="/bookings/new">
                <Button variant="primary" size="sm">{t('newBooking')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="container toolbar">
        <div style={{flex:1}}>
          <Field placeholder={t('searchPlaceholder')} aria-label="Search" />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode((e.target as any).value)}
              placeholder={selectedSchool ? `School: ${selectedSchool}` : 'Enter join code'}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                if (!joinCode.trim()) return;
                const res = await joinByCode(joinCode.trim());
                if ((res as any).ok && res.schoolName) {
                  window.location.href = '/school/dashboard';
                }
              }}
            >Join School</Button>
          </div>
          <Button variant="secondary" size="sm">{t('filters')}</Button>
          <Button variant="secondary" size="sm">{t('exportCSV')}</Button>
          <Button variant="primary" size="sm">{t('inviteTeacher')}</Button>
        </div>
      </div>

      {/* Hero full-bleed + expanded layout */}
      <section className="full-bleed hero section">
        <div className="hero__accent" />
        <div className="container hero__inner">
          <div data-animate>
            <div className="badge mb-4">{t('builtForSchools')}</div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--primary)] leading-tight mb-3">{t('heroTitle')}</h1>
            <p className="muted text-lg mb-6 max-w-[56ch]">{t('heroSubtitle')}</p>
            <div className="flex items-center gap-3">
              <Link href="/login" className="cta cta--primary">{t('getStarted')}</Link>
              <Link href="#features" className="cta cta--outline">{t('explore')}</Link>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {[t('pillAttendance'), t('pillBookings'), t('pillPayments'), t('pillReports'), t('pillModeration')].map((p) => (
                <span key={p} className="badge">{p}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-center" data-animate>
            <Image src="/api/assets/images/home-illustration.png" alt="Illustration" width={640} height={480} className="rounded-2xl shadow-2xl" priority />
          </div>
        </div>
      </section>

      {loading && (
        <div className="container section">
          <LoadingState message="Đang tải bảng điều khiển..." />
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Overview */}
          <section className="container section">
            <h2 className="text-2xl font-bold mb-6">{t('statsOverview')}</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem'}}>
              <StatsCard
                title={t('activeTeachers')}
                value={stats.totalTeachers}
                icon={
                  <svg width="24" height="24" className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <StatsCard
                title={t('upcomingClasses')}
                value={stats.upcomingBookings}
                icon={
                  <svg width="24" height="24" className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <StatsCard
                title={t('communityPosts')}
                value={stats.activePosts}
                icon={
                  <svg width="24" height="24" className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                }
              />
              <StatsCard
                title={t('averageRating')}
                value={`${stats.avgRating}/5`}
                icon={
                  <svg width="24" height="24" className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
              />
            </div>
          </section>
        </>
      )}

      {/* Feature cards */}
      <section id="features" className="container section grid-3">
        {[ 
          { title: t('featureTeachersTitle'), desc: t('featureTeachersDesc') },
          { title: t('featureBookingsTitle'), desc: t('featureBookingsDesc') },
          { title: t('featurePaymentsTitle'), desc: t('featurePaymentsDesc') },
        ].map((c) => (
          <div key={c.title} className="card" data-animate>
            <h3 className="h1 text-[var(--text)]">{c.title}</h3>
            <p className="muted">{c.desc}</p>
          </div>
        ))}
      </section>

      {/* Highlight banner */}
      <section className="container section">
        <div className="banner" data-animate>
          <div className="title">{t('roleBannerTitle')}</div>
          <p className="desc">{t('roleBannerDesc')}</p>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="container section">
        <h2 className="h1">{t('popularSubjects')}</h2>
        <div style={{display:'flex', flexWrap:'wrap', gap:12}}>
          {[
            t('subjectMath'), t('subjectEnglish'), t('subjectPhysics'), t('subjectChemistry'),
            t('subjectBiology'), t('subjectHistory'), t('subjectGeography'), t('subjectLiterature'),
            t('subjectComputerScience'), t('subjectArt'), t('subjectMusic'), t('subjectEconomics'),
          ].map((s) => (
            <a key={s} href={`#subject-${s}`} className="pill">{s}</a>
          ))}
        </div>
      </section>

      {!loading && (
        <>
          {/* Featured Teachers */}
          <section id="teachers" className="container section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t('featuredTeachersTitle')}</h2>
              <Link href="/find-teacher" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                {t('viewAll')}
                <svg width="16" height="16" className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.slice(0, 4).map((teacher) => (
                <Card key={teacher.id}>
                  <Link href={`/teachers/${teacher.id}`}>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {teacher.avatar ? (
                          <img 
                            src={teacher.avatar} 
                            alt={teacher.name} 
                            className="w-14 h-14 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {teacher.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{teacher.name}</h3>
                          <p className="text-xs text-gray-500">
                            {teacher.subjects.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('experience')}:</span>
                          <span className="font-medium">{teacher.experience} {t('years')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('rating')}:</span>
                          <span className="font-medium">⭐ {teacher.rating}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('hourlyRate')}:</span>
                          <span className="font-medium">{teacher.hourlyRate}k{t('perHour')}</span>
                        </div>
                      </div>
                      <Button variant="primary" className="w-full mt-4">
                        {t('viewProfile')}
                      </Button>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          {/* Community Posts */}
          <section id="community" className="container section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t('communityTitle')}</h2>
              <Link href="/feed" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                {t('viewAll')}
                <svg width="16" height="16" className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post) => (
                <Card key={post.id}>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {post.author.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{post.author.name}</p>
                        <p className="text-xs text-gray-500">{post.author.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {post.content.text}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                      <span>👍 {post.interactions.likesCount}</span>
                      <span>💬 {post.interactions.commentsCount}</span>
                      <span>📤 {post.interactions.sharesCount}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Site Footer - multi-column */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Image src="/api/assets/images/tuto-logo.png" alt="Tuto" width={120} height={48} />
              <p className="muted">{t('heroSubtitle')}</p>
              <div className="social">
                <a href="#" aria-label="Facebook">f</a>
                <a href="#" aria-label="X">x</a>
                <a href="#" aria-label="LinkedIn">in</a>
              </div>
            </div>
            <nav className="footer-cols" aria-label="Footer">
              {/* Column A — About */}
              <section aria-labelledby="footer-about">
                <h3 id="footer-about">{t('footerSectionAbout')}</h3>
                <ul>
                  <li><a href="/about">{t('aboutTuto')}</a></li>
                  <li><a href="/trust-safety">{t('trustSafety')}</a></li>
                  <li><a href="/how-it-works">{t('howTutoWorks')}</a></li>
                  <li><a href="/impact">{t('impactCommunity')}</a></li>
                  <li><a href="/newsroom">{t('newsroom')}</a></li>
                  <li><a href="/careers">{t('careers')}</a></li>
                  <li><a href="/investors">{t('investors')}</a></li>
                  <li><a href="/contact">{t('contactUs')}</a></li>
                </ul>
              </section>
              {/* Column B — Parents */}
              <section aria-labelledby="footer-parents">
                <h3 id="footer-parents">{t('footerSectionParents')}</h3>
                <ul>
                  <li><a href="/find-teacher">{t('findTeacherNear')}</a></li>
                  <li><a href="/trial">{t('bookFreeTrial')}</a></li>
                  <li><a href="/pricing">{t('pricingPackages')}</a></li>
                  <li><a href="/ratings-policy">{t('reviewsPolicy')}</a></li>
                  <li><a href="/roadmaps">{t('learningRoadmaps')}</a></li>
                  <li><a href="/safeguarding">{t('safeguarding')}</a></li>
                  <li><a href="/help/parents">{t('parentHelpCentre')}</a></li>
                  <li><a href="/download">{t('appDownload')}</a></li>
                </ul>
              </section>
              {/* Column C — Students */}
              <section aria-labelledby="footer-students">
                <h3 id="footer-students">{t('footerSectionStudents')}</h3>
                <ul>
                  <li><a href="/adaptive-homework">{t('adaptiveHomework')}</a></li>
                  <li><a href="/practice">{t('practiceLibrary')}</a></li>
                  <li><a href="/events">{t('speakingClubs')}</a></li>
                  <li><a href="/planner">{t('studyPlanner')}</a></li>
                  <li><a href="/scholarships">{t('scholarships')}</a></li>
                  <li><a href="/badges">{t('certificates')}</a></li>
                  <li><a href="/help/students">{t('studentSupport')}</a></li>
                  <li><a href="/code-of-conduct">{t('codeOfConduct')}</a></li>
                </ul>
              </section>
              {/* Column D — Schools */}
              <section aria-labelledby="footer-schools">
                <h3 id="footer-schools">{t('footerSectionSchools')}</h3>
                <ul>
                  <li><a href="/schools">{t('tutoForSchools')}</a></li>
                  <li><a href="/schools/analytics">{t('adminDashboard')}</a></li>
                  <li><a href="/schools/lesson-planner">{t('curriculumPlanner')}</a></li>
                  <li><a href="/schools/assessments">{t('assessments')}</a></li>
                  <li><a href="/schools/onboarding">{t('onboardingTraining')}</a></li>
                  <li><a href="/schools/case-studies">{t('caseStudies')}</a></li>
                  <li><a href="/schools/pricing">{t('pricingSchools')}</a></li>
                  <li><a href="/help/schools">{t('schoolSupport')}</a></li>
                </ul>
              </section>
              {/* Column E — Institutes */}
              <section aria-labelledby="footer-institutes">
                <h3 id="footer-institutes">{t('footerSectionInstitutes')}</h3>
                <ul>
                  <li><a href="/institutes/partner">{t('partnerWithTuto')}</a></li>
                  <li><a href="/institutes/crm">{t('leadManagement')}</a></li>
                  <li><a href="/institutes/scheduling">{t('classScheduling')}</a></li>
                  <li><a href="/institutes/ads">{t('adsFeatured')}</a></li>
                  <li><a href="/institutes/recruit">{t('teacherRecruitment')}</a></li>
                  <li><a href="/institutes/reviews">{t('ratingsGuidelines')}</a></li>
                  <li><a href="/institutes/billing">{t('billingPayouts')}</a></li>
                  <li><a href="/help/partners">{t('partnerHelpCentre')}</a></li>
                </ul>
              </section>
              {/* Column F — Teachers */}
              <section aria-labelledby="footer-teachers">
                <h3 id="footer-teachers">{t('footerSectionTeachers')}</h3>
                <ul>
                  <li><a href="/teachers/apply">{t('becomeTeacher')}</a></li>
                  <li><a href="/teachers/onboarding">{t('onboardingVerification')}</a></li>
                  <li><a href="/teachers/payments">{t('paymentsSchedule')}</a></li>
                  <li><a href="/teachers/calendar">{t('calendarAvailability')}</a></li>
                  <li><a href="/teachers/resources">{t('teachingResources')}</a></li>
                  <li><a href="/teachers/community">{t('communityEvents')}</a></li>
                  <li><a href="/teachers/quality">{t('qualityStandards')}</a></li>
                  <li><a href="/help/teachers">{t('teacherSupport')}</a></li>
                </ul>
              </section>
              {/* Column G — Quick Links */}
              <section aria-labelledby="footer-quick">
                <h3 id="footer-quick">{t('footerSectionQuickLinks')}</h3>
                <ul>
                  <li><a href="/help">{t('helpCentre')}</a></li>
                  <li><a href="/blog">{t('blogGuides')}</a></li>
                  <li><a href="/developers">{t('developerPortal')}</a></li>
                  <li><a href="/status">{t('systemStatus')}</a></li>
                  <li><a href="/legal/terms">{t('termsOfService')}</a></li>
                  <li><a href="/legal/privacy">{t('privacyPolicy')}</a></li>
                  <li><a href="/legal/cookies">{t('cookiePreferences')}</a></li>
                  <li><a href="/sitemap">{t('sitemap')}</a></li>
                </ul>
              </section>
            </nav>
          </div>
          <div className="footer-bottom">
            <div>© {new Date().getFullYear()} Tuto</div>
            <div style={{display:'flex', gap:12}}>
              <a href="#privacy">{t('footerPrivacy')}</a>
              <a href="#terms">{t('footerTerms')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
