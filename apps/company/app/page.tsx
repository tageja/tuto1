import { cookies }      from 'next/headers';
import Image            from 'next/image';
import {
  School, Users, GraduationCap, Building2, Presentation, Briefcase,
  Check, ArrowRight, Smartphone,
}                       from 'lucide-react';
import type { Locale }  from '@/lib/i18n';
import { t }            from '@/lib/i18n';
import LeadForm         from '@/components/LeadForm';
import Reveal           from '@/components/Reveal';

const SOCIAL_URL    = process.env.NEXT_PUBLIC_SOCIAL_URL    ?? 'https://tuto.asia';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'https://school.tuto.asia';
const COURSES_URL   = process.env.NEXT_PUBLIC_COURSES_URL   ?? 'https://pro.tuto.asia';
const APP_STORE_URL = 'https://apps.apple.com/vn/app/tuto/id6757738235';

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
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light via-primary-light/40 to-white">
        {/* decorative blurred blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div aria-hidden className="pointer-events-none absolute top-40 -left-32 w-80 h-80 rounded-full bg-accent/15 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-5 ring-1 ring-primary/15">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {tr('hero.badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-6">
              {tr('hero.title')}
            </h1>
            <p className="text-lg text-muted mb-8 leading-relaxed max-w-xl">
              {tr('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#lead-form"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-primary/30 transition-all"
              >
                {tr('hero.cta1')} <ArrowRight size={18} />
              </a>
              <a
                href={SOCIAL_URL}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-primary/30 bg-white/60 text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white transition-colors"
              >
                {tr('hero.cta2')}
              </a>
            </div>
            {/* value props */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
              {[tr('hero.prop1'), tr('hero.prop2'), tr('hero.prop3')].map((prop) => (
                <span key={prop} className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface/80">
                  <Check size={15} strokeWidth={3} className="text-accent" /> {prop}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted mt-4 italic">{tr('hero.note')}</p>
          </div>

          {/* Hero screenshot in a browser frame */}
          <div className="browser-frame animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="browser-bar">
              <span className="browser-dot bg-[#FF5F57]" />
              <span className="browser-dot bg-[#FEBC2E]" />
              <span className="browser-dot bg-[#28C840]" />
              <span className="ml-3 text-[11px] text-muted truncate">school.tuto.asia</span>
            </div>
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
        <Reveal className="max-w-3xl mx-auto px-4 text-center">
          <span className="section-eyebrow">{tr('eyebrow.about')}</span>
          <h2 className="section-title">{tr('about.title')}</h2>
          <p className="text-lg text-muted leading-relaxed mt-6">{tr('about.body')}</p>
        </Reveal>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────────── */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <span className="section-eyebrow">{tr('eyebrow.products')}</span>
            <h2 className="section-title">{tr('products.title')}</h2>
          </div>

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
          <div className="text-center">
            <span className="section-eyebrow">{tr('eyebrow.gallery')}</span>
            <h2 className="section-title">{tr('gallery.title')}</h2>
          </div>
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
          <div className="text-center">
            <span className="section-eyebrow">{tr('eyebrow.how')}</span>
            <h2 className="section-title">{tr('how.title')}</h2>
          </div>

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

      {/* ── GET THE APP ──────────────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <Reveal className="max-w-4xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-8 py-12 md:py-16 text-center text-white">
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <Smartphone size={40} className="mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{tr('app.title')}</h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-8">{tr('app.subtitle')}</p>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="app-store-btn mx-auto">
              <Smartphone size={22} />
              <span className="font-semibold">{tr('app.cta')}</span>
            </a>
            <p className="text-xs text-blue-200/80 mt-4">{tr('app.note')}</p>
          </div>
        </Reveal>
      </section>

      {/* ── INVESTORS & PARTNERS ─────────────────────────────────────── */}
      <section id="investors" className="py-20 bg-white">
        <Reveal className="max-w-3xl mx-auto px-4 text-center">
          <span className="section-eyebrow">{tr('eyebrow.investors')}</span>
          <h2 className="section-title">{tr('investors.title')}</h2>
          <p className="text-lg text-muted leading-relaxed mt-6 mb-8">{tr('investors.body')}</p>
          <a
            href="#lead-form"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            {tr('investors.cta')} <ArrowRight size={18} />
          </a>
        </Reveal>
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
