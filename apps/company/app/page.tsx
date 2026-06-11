import { cookies }      from 'next/headers';
import Image            from 'next/image';
import type { Locale }  from '@/lib/i18n';
import { t }            from '@/lib/i18n';
import LeadForm         from '@/components/LeadForm';

const SOCIAL_URL    = process.env.NEXT_PUBLIC_SOCIAL_URL    ?? 'https://tuto.asia';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'https://school.tuto.asia';
const COURSES_URL   = process.env.NEXT_PUBLIC_COURSES_URL   ?? 'https://pro.tuto.asia';

// ─── product screenshots (relative to /public) ───────────────────────────────
const SCREENSHOTS = {
  adminDash:       '/screenshots/admin-dashboard.png',
  adminAttendance: '/screenshots/admin-attendance.png',
  adminPayments:   '/screenshots/admin-payments.png',
  adminMessages:   '/screenshots/admin-messages.png',
  parentDash:      '/screenshots/parent-dashboard.png',
  parentProgress:  '/screenshots/parent-progress.png',
  teacherDash:     '/screenshots/teacher-dashboard.png',
  teacherAttendance:'/screenshots/teacher-attendance.png',
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('tuto_lang')?.value === 'en' ? 'en' : 'vi';
  const tr = (key: Parameters<typeof t>[1]) => t(locale, key);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-primary-light relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {tr('hero.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface leading-tight mb-6">
              {tr('hero.title')}
            </h1>
            <p className="text-lg text-muted mb-8 leading-relaxed">
              {tr('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#lead-form"
                className="inline-flex items-center justify-center bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
              >
                {tr('hero.cta1')}
              </a>
              <a
                href={SOCIAL_URL}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-primary text-primary font-semibold px-6 py-3 rounded-xl hover:bg-primary/5 transition-colors"
              >
                {tr('hero.cta2')}
              </a>
            </div>
            <p className="text-xs text-muted mt-4 italic">{tr('hero.note')}</p>
          </div>

          {/* Hero screenshot */}
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm">
            <Image
              src={SCREENSHOTS.adminDash}
              alt="Tuto school dashboard"
              width={800} height={540}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────────── */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title">{tr('products.title')}</h2>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {/* LMS/SIS */}
            <div className="card-hover flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-xl">🏫</div>
              <h3 className="font-bold text-lg text-on-surface mb-2">{tr('products.lms.name')}</h3>
              <p className="text-sm text-muted flex-1 leading-relaxed">{tr('products.lms.desc')}</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                <Image src={SCREENSHOTS.adminAttendance} alt="LMS attendance" width={480} height={300} className="w-full object-cover" />
              </div>
              <a
                href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer"
                className="mt-4 text-primary text-sm font-medium hover:underline"
              >
                {tr('products.lms.cta')} →
              </a>
            </div>

            {/* Community */}
            <div className="card-hover flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-xl">🌐</div>
              <h3 className="font-bold text-lg text-on-surface mb-2">{tr('products.community.name')}</h3>
              <p className="text-sm text-muted flex-1 leading-relaxed">{tr('products.community.desc')}</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                <Image src={SCREENSHOTS.parentDash} alt="Community feed" width={480} height={300} className="w-full object-cover" />
              </div>
              <a
                href={SOCIAL_URL} target="_blank" rel="noopener noreferrer"
                className="mt-4 text-primary text-sm font-medium hover:underline"
              >
                {tr('products.community.cta')} →
              </a>
            </div>

            {/* Courses */}
            <div className="card-hover flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-xl">📚</div>
              <h3 className="font-bold text-lg text-on-surface mb-2">{tr('products.courses.name')}</h3>
              <p className="text-sm text-muted flex-1 leading-relaxed">{tr('products.courses.desc')}</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                <Image src={SCREENSHOTS.teacherDash} alt="Teacher dashboard" width={480} height={300} className="w-full object-cover" />
              </div>
              <a
                href={COURSES_URL} target="_blank" rel="noopener noreferrer"
                className="mt-4 text-primary text-sm font-medium hover:underline"
              >
                {tr('products.courses.cta')} →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREENSHOT GALLERY ───────────────────────────────────────── */}
      <section className="py-16 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: SCREENSHOTS.adminDash,        alt: 'Admin dashboard' },
              { src: SCREENSHOTS.adminPayments,     alt: 'Payments' },
              { src: SCREENSHOTS.adminMessages,     alt: 'Messages' },
              { src: SCREENSHOTS.parentProgress,    alt: 'Parent progress view' },
              { src: SCREENSHOTS.teacherAttendance, alt: 'Teacher attendance' },
              { src: SCREENSHOTS.adminAttendance,   alt: 'Attendance' },
              { src: SCREENSHOTS.teacherDash,       alt: 'Teacher dashboard' },
              { src: SCREENSHOTS.parentDash,        alt: 'Parent dashboard' },
            ].map(({ src, alt }) => (
              <div key={src} className="rounded-xl overflow-hidden border border-border">
                <Image src={src} alt={alt} width={320} height={200} className="w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title">{tr('how.title')}</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {(
              [
                { icon: '🏫', titleKey: 'how.school.title',   itemsKey: 'how.school.items'   },
                { icon: '👨‍👩‍👧', titleKey: 'how.parent.title',   itemsKey: 'how.parent.items'   },
                { icon: '👩‍🏫', titleKey: 'how.teacher.title', itemsKey: 'how.teacher.items' },
                { icon: '🎯', titleKey: 'how.freelance.title',itemsKey: 'how.freelance.items'},
              ] as const
            ).map(({ icon, titleKey, itemsKey }) => (
              <div key={titleKey} className="card-hover">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-on-surface mb-3">{tr(titleKey)}</h3>
                <ul className="space-y-1.5">
                  {tr(itemsKey).split(' · ').map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <span className="text-accent mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SECTION ───────────────────────────────────────────────── */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{tr('ai.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
            {[tr('ai.item1'), tr('ai.item2')].map((item) => (
              <div key={item} className="bg-white/10 rounded-xl p-5">
                <p className="text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-blue-200 text-sm italic">{tr('ai.roadmap')}</p>
        </div>
      </section>

      {/* ── LEAD FORM ────────────────────────────────────────────────── */}
      <section id="lead-form" className="py-20 bg-surface">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="section-title">{tr('form.title')}</h2>
          <p className="text-center text-muted mb-10 text-base">{tr('form.subtitle')}</p>
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8">
            <LeadForm />
          </div>
        </div>
      </section>
    </div>
  );
}
