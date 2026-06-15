import { cookies }      from 'next/headers';
import Image            from 'next/image';
import {
  School, Users, GraduationCap, Building2, Presentation, Briefcase,
  Check, ArrowRight,
}                       from 'lucide-react';
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

      {/* ── ABOUT / MISSION ──────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title">{tr('about.title')}</h2>
          <p className="text-lg text-muted leading-relaxed mt-6">{tr('about.body')}</p>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────────── */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title">{tr('products.title')}</h2>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {/* LMS/SIS */}
            <div className="card-hover flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary"><School size={22} /></div>
              <h3 className="font-bold text-lg text-on-surface mb-2">{tr('products.lms.name')}</h3>
              <p className="text-sm text-muted flex-1 leading-relaxed">{tr('products.lms.desc')}</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                <Image src={SCREENSHOTS.adminAttendance} alt="LMS attendance" width={480} height={300} className="w-full object-cover" />
              </div>
              <a
                href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
              >
                {tr('products.lms.cta')} <ArrowRight size={16} />
              </a>
            </div>

            {/* Community */}
            <div className="card-hover flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary"><Users size={22} /></div>
              <h3 className="font-bold text-lg text-on-surface mb-2">{tr('products.community.name')}</h3>
              <p className="text-sm text-muted flex-1 leading-relaxed">{tr('products.community.desc')}</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                <Image src={SCREENSHOTS.parentDash} alt="Community feed" width={480} height={300} className="w-full object-cover" />
              </div>
              <a
                href={SOCIAL_URL} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
              >
                {tr('products.community.cta')} <ArrowRight size={16} />
              </a>
            </div>

            {/* Courses */}
            <div className="card-hover flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary"><GraduationCap size={22} /></div>
              <h3 className="font-bold text-lg text-on-surface mb-2">{tr('products.courses.name')}</h3>
              <p className="text-sm text-muted flex-1 leading-relaxed">{tr('products.courses.desc')}</p>
              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                <Image src={SCREENSHOTS.teacherDash} alt="Teacher dashboard" width={480} height={300} className="w-full object-cover" />
              </div>
              <a
                href={COURSES_URL} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
              >
                {tr('products.courses.cta')} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCREENSHOT GALLERY ───────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title">{tr('gallery.title')}</h2>
          <p className="text-center text-muted mb-12 max-w-2xl mx-auto">{tr('gallery.subtitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: SCREENSHOTS.adminDash,         label: tr('gallery.cap.dashboard') },
              { src: SCREENSHOTS.adminPayments,     label: tr('gallery.cap.payments') },
              { src: SCREENSHOTS.adminMessages,     label: tr('gallery.cap.messages') },
              { src: SCREENSHOTS.parentProgress,    label: tr('gallery.cap.progress') },
              { src: SCREENSHOTS.teacherAttendance, label: tr('gallery.cap.attendance') },
              { src: SCREENSHOTS.adminAttendance,   label: tr('gallery.cap.records') },
              { src: SCREENSHOTS.teacherDash,       label: tr('gallery.cap.teacher') },
              { src: SCREENSHOTS.parentDash,        label: tr('gallery.cap.parent') },
            ].map(({ src, label }) => (
              <figure key={src} className="group rounded-xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
                <Image src={src} alt={label} width={320} height={200} className="w-full object-cover" />
                <figcaption className="px-3 py-2 text-xs font-medium text-muted border-t border-border">{label}</figcaption>
              </figure>
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
                { Icon: Building2,    titleKey: 'how.school.title',    itemsKey: 'how.school.items'    },
                { Icon: Users,        titleKey: 'how.parent.title',    itemsKey: 'how.parent.items'    },
                { Icon: Presentation, titleKey: 'how.teacher.title',   itemsKey: 'how.teacher.items'   },
                { Icon: Briefcase,    titleKey: 'how.freelance.title', itemsKey: 'how.freelance.items' },
              ] as const
            ).map(({ Icon, titleKey, itemsKey }) => (
              <div key={titleKey} className="card-hover">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary"><Icon size={22} /></div>
                <h3 className="font-bold text-on-surface mb-3">{tr(titleKey)}</h3>
                <ul className="space-y-1.5">
                  {tr(itemsKey).split(' · ').map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <Check size={16} strokeWidth={3} className="text-accent mt-0.5 shrink-0" />
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

      {/* ── INVESTORS & PARTNERS ─────────────────────────────────────── */}
      <section id="investors" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title">{tr('investors.title')}</h2>
          <p className="text-lg text-muted leading-relaxed mt-6 mb-8">{tr('investors.body')}</p>
          <a
            href="#lead-form"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
          >
            {tr('investors.cta')} <ArrowRight size={18} />
          </a>
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
