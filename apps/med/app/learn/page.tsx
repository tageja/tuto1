'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight, CheckCircle2, Lock, Play, ArrowRight, Building2, X, Link2, Target,
} from 'lucide-react'
import type { NursedCourse } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { COURSE_ICONS } from './courses/page'
import { OnboardingModal } from '@/components/learn/OnboardingModal'
import { LearningCalendar } from '@/components/learn/LearningCalendar'

const HOSP_LINK_KEY = 'nursed_hospital_link'

const LEVEL_BADGE: Record<string, string> = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-blue-100 text-blue-700',
  B1: 'bg-amber-100 text-amber-700',
  B2: 'bg-rose-100 text-rose-700',
}

const COURSE_ORDER: string[] = [
  'Foundations of Nursing English',
  'Emergency Nursing Communication',
  'Ward and Inpatient Communication',
  'International Patient Communication',
  'Clinical Handover and Team Communication',
  'Career English for Nurses',
]

const COURSE_COLOR: Record<string, { bg: string; text: string; ring: string }> = {
  'Foundations of Nursing English':           { bg: 'bg-emerald-50',  text: 'text-emerald-600', ring: 'ring-emerald-200' },
  'Emergency Nursing Communication':          { bg: 'bg-red-50',      text: 'text-red-500',     ring: 'ring-red-200' },
  'Ward and Inpatient Communication':         { bg: 'bg-primary-light', text: 'text-primary',    ring: 'ring-primary/20' },
  'International Patient Communication':      { bg: 'bg-violet-50',   text: 'text-violet-600',  ring: 'ring-violet-200' },
  'Clinical Handover and Team Communication': { bg: 'bg-amber-50',    text: 'text-amber-600',   ring: 'ring-amber-200' },
  'Career English for Nurses':               { bg: 'bg-indigo-50',   text: 'text-indigo-600',  ring: 'ring-indigo-200' },
}

function sortCourses(data: NursedCourse[]) {
  return [...data].sort((a, b) => {
    const ai = COURSE_ORDER.indexOf(a.title)
    const bi = COURSE_ORDER.indexOf(b.title)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

// ─────────────────────────────────────────────────────────────────────────────

const PREFERRED_DAYS_WEEKDAYS: Record<string, number[]> = {
  everyday: [0, 1, 2, 3, 4, 5, 6],
  weekdays: [1, 2, 3, 4, 5],
  weekends: [0, 6],
}

export default function LearnDashboard() {
  const { t } = useLang()
  const { profile } = useAuth()
  const [allCourses, setAllCourses] = useState<NursedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [lastLesson, setLastLesson] = useState<{
    lessonId: string; courseId: string; title: string
    courseSlug?: string; lessonSlug?: string
  } | null>(null)
  const [streak, setStreak] = useState(0)
  const [lessonsCompleted, setLessonsCompleted] = useState(0)
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0)
  const [preferredDays, setPreferredDays] = useState<string | null>(null)
  const [activityDates, setActivityDates] = useState<string[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Hospital link state
  const [hospitalLink, setHospitalLink] = useState<{ hospital_id: string; name: string } | null>(null)
  const [inviteInput, setInviteInput] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then((j) => setAllCourses(sortCourses(j.data ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/rewards/balance')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setStreak(j.data.streak ?? 0)
          setLessonsCompleted(j.data.todayCount ?? 0)
          setTotalLessonsCompleted(j.data.totalLessonsCompleted ?? 0)
          setPreferredDays(j.data.preferredDays ?? null)
          setActivityDates(j.data.activityDates ?? [])
        }
      })
      .catch(() => {})
  }, [])

  // Show onboarding modal on first visit (when profile loaded and not yet done)
  useEffect(() => {
    if (profile && !profile.onboarding_done) setShowOnboarding(true)
  }, [profile])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('nursed_last_lesson')
      if (raw) setLastLesson(JSON.parse(raw))
      const hosp = localStorage.getItem(HOSP_LINK_KEY)
      if (hosp) setHospitalLink(JSON.parse(hosp))
    } catch {}
  }, [])

  const handleLinkHospital = async () => {
    const code = inviteInput.trim().toUpperCase()
    if (!code) return
    setLinking(true)
    setLinkError('')
    try {
      const res = await fetch(`/api/invite-codes/${code}`)
      const data = await res.json()
      if (data.success) {
        const link = { hospital_id: data.data.hospital_id, name: data.data.name }
        setHospitalLink(link)
        localStorage.setItem(HOSP_LINK_KEY, JSON.stringify(link))
        setInviteInput('')
        setShowLinkInput(false)
      } else {
        setLinkError(t.hospLinkError)
      }
    } catch {
      setLinkError(t.hospLinkError)
    } finally {
      setLinking(false)
    }
  }

  const handleUnlink = () => {
    setHospitalLink(null)
    localStorage.removeItem(HOSP_LINK_KEY)
  }

  const activeCourse = lastLesson
    ? allCourses.find((c) => c.id === lastLesson.courseId) ?? null
    : null

  // Derive nudge banner visibility
  const todayWeekday = new Date().getDay()
  const scheduledToday = preferredDays
    ? (PREFERRED_DAYS_WEEKDAYS[preferredDays] ?? []).includes(todayWeekday)
    : false
  const showNudge = scheduledToday && lessonsCompleted === 0

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── HERO — compact modern banner ─────────────────────────── */}
      <div className="rounded-2xl overflow-hidden bg-[#0B5FFF] shadow-md">
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
        <div className="px-5 py-4 flex items-center gap-4">
          {/* Left: greeting + subtitle */}
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-[11px] font-semibold tracking-widest uppercase mb-0.5">NurseEd</p>
            <h1 className="text-white text-lg font-bold leading-snug truncate">
              {t.learnWelcomeTitle}
            </h1>
            <p className="text-white/70 text-xs leading-relaxed mt-0.5 line-clamp-1">{t.learnWelcomeSubtitle}</p>
          </div>

          {/* Right: compact stat chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatChip icon="🔥" value={streak} label={t.statsDaysStreak} />
            <StatChip icon="✓" value={totalLessonsCompleted} label={t.statsLessonsCompleted} today={lessonsCompleted > 0 ? `+${lessonsCompleted} ${t.statsTodayLessons}` : undefined} />
            <StatChip icon="📚" value={allCourses.filter(c => c.published).length} label={t.statsCoursesEnrolled} />
          </div>
        </div>

        {/* Bottom: nudge strip — shown inside hero if today is scheduled and no lesson yet */}
        {showNudge && (
          <div className="flex items-center gap-2 px-5 py-2 bg-white/10 border-t border-white/10">
            <Target size={13} className="text-white/80 flex-shrink-0" />
            <p className="text-white/90 text-xs font-medium">{t.nudgeBannerToday}</p>
          </div>
        )}
      </div>

      {/* ── HOSPITAL LINK ────────────────────────────────────────── */}
      {hospitalLink ? (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary-light border border-primary/20">
          <Building2 size={14} className="text-primary flex-shrink-0" />
          <p className="text-sm text-primary flex-1 font-medium">
            {t.hospLinkedBadge.replace('{name}', hospitalLink.name)}
          </p>
          <button onClick={handleUnlink} className="text-xs text-primary hover:opacity-80 flex items-center gap-1">
            <X size={12} />
            {t.hospUnlink}
          </button>
        </div>
      ) : (
        <div>
          {showLinkInput ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={inviteInput}
                onChange={e => setInviteInput(e.target.value.toUpperCase())}
                placeholder={t.hospLinkPlaceholder}
                className="input flex-1 text-sm uppercase tracking-widest"
                maxLength={8}
                onKeyDown={e => e.key === 'Enter' && handleLinkHospital()}
              />
              <button
                onClick={handleLinkHospital}
                disabled={linking || !inviteInput.trim()}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-60"
              >
                {linking ? t.hospLinking : t.hospLinkBtn}
              </button>
              <button onClick={() => { setShowLinkInput(false); setLinkError('') }} className="p-2 text-text-muted hover:text-text">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLinkInput(true)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
            >
              <Link2 size={14} />
              {t.hospLinkTitle}
            </button>
          )}
          {linkError && <p className="text-xs text-red-500 mt-1">{linkError}</p>}
        </div>
      )}

      {/* ── CONTINUE LEARNING ────────────────────────────────────── */}
      {lastLesson && (
        <section>
          <SectionHeading title={t.continueLearningTitle} />
          <ContinueLearningCard lesson={lastLesson} course={activeCourse} />
        </section>
      )}

      {/* ── LEARNING CALENDAR (moved here — between Continue and Path) ── */}
      <LearningCalendar
        preferredDays={preferredDays as 'everyday' | 'weekdays' | 'weekends' | null}
        activityDates={activityDates}
        streak={streak}
        lessonsThisMonth={activityDates.length}
      />

      {/* ── LEARNING PATH ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <SectionHeading title={t.learningPathTitle} className="mb-0" />
            <p className="text-sm text-[var(--text-muted)] mt-1">{t.learningPathDesc}</p>
          </div>
          <Link
            href="/learn/courses"
            className="text-sm text-[var(--primary)] font-medium hover:underline flex items-center gap-1 flex-shrink-0 ml-4"
          >
            {t.linkViewAll} <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-40 h-52 rounded-2xl bg-[var(--surface)] animate-pulse" />
            ))}
          </div>
        ) : (
          <LearningPathRow courses={allCourses} />
        )}
      </section>

    </div>

    {/* ── ONBOARDING MODAL ─────────────────────────────────────── */}
    {showOnboarding && (
      <OnboardingModal
        onComplete={(prefs) => {
          setPreferredDays(prefs.preferred_days)
          setShowOnboarding(false)
        }}
      />
    )}
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ title, className = '' }: { title: string; className?: string }) {
  return (
    <h2 className={`text-base font-semibold text-[var(--text)] mb-4 ${className}`}>{title}</h2>
  )
}

function StatChip({ icon, value, label, today }: { icon: string; value: number; label: string; today?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-white/12 border border-white/20 min-w-[52px]">
      <span className="text-sm leading-none mb-0.5">{icon}</span>
      <p className="text-white font-bold text-sm leading-none">{value}</p>
      <p className="text-white/60 text-[9px] leading-tight mt-0.5 text-center whitespace-nowrap">{label}</p>
      {today && (
        <p className="text-yellow-300 text-[8px] leading-tight font-semibold whitespace-nowrap">{today}</p>
      )}
    </div>
  )
}

function ContinueLearningCard({
  lesson,
  course,
}: {
  lesson: { lessonId: string; courseId: string; title: string; courseSlug?: string; lessonSlug?: string }
  course: NursedCourse | null
}) {
  const { t } = useLang()
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  useEffect(() => {
    if (!course?.id) return
    fetch(`/api/progress/course?courseId=${course.id}`)
      .then(r => r.json())
      .then(j => {
        const rows: { completed: boolean }[] = j.data ?? []
        const done = rows.filter(r => r.completed).length
        setProgress({ done, total: rows.length })
      })
      .catch(() => {})
  }, [course?.id])

  const colors = course ? (COURSE_COLOR[course.title] ?? { bg: 'bg-primary-light', text: 'text-primary', ring: 'ring-primary/20' }) : { bg: 'bg-primary-light', text: 'text-primary', ring: 'ring-primary/20' }
  const icon = course ? (COURSE_ICONS[course.title] ?? '📖') : '📖'
  const pct = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : null

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-3xl flex-shrink-0 ring-2 ${colors.ring}`}>
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {course && (
          <p className={`text-xs font-semibold uppercase tracking-wide ${colors.text} mb-0.5`}>
            {course.title_vi || course.title}
          </p>
        )}
        <p className="text-sm font-semibold text-[var(--text)] truncate">{lesson.title}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex-1 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
              style={{ width: pct !== null ? `${pct}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
            {progress ? `${progress.done}/${progress.total} lessons` : t.continueLearningInProgress}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/learn/courses/${lesson.courseSlug ?? lesson.courseId}/lessons/${lesson.lessonSlug ?? lesson.lessonId}`}
        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
      >
        <Play size={14} fill="white" />
        {t.btnContinue}
      </Link>
    </div>
  )
}

function LearningPathRow({ courses }: { courses: NursedCourse[] }) {
  return (
    <div className="relative">
      {/* Horizontal scroll wrapper */}
      <div className="flex items-stretch gap-0 overflow-x-auto pb-2 -mx-1 px-1">
        {courses.map((course, idx) => (
          <div key={course.id} className="flex items-center flex-shrink-0">
            <PathStepCard course={course} index={idx} />
            {/* Connector arrow — not after last */}
            {idx < courses.length - 1 && (
              <div className="flex-shrink-0 px-1">
                <ArrowRight size={16} className={course.published ? 'text-[var(--primary)]' : 'text-[var(--border)]'} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PathStepCard({ course, index }: { course: NursedCourse; index: number }) {
  const { t } = useLang()
  const isActive = course.published
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const colors = COURSE_COLOR[course.title] ?? { bg: 'bg-surface', text: 'text-text-muted', ring: 'ring-border' }

  const inner = (
    <div
      className={`w-36 rounded-2xl border-2 p-4 flex flex-col items-center text-center gap-3 transition-all duration-200 select-none ${
        isActive
          ? `border-[var(--primary)] bg-white shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`
          : `border-[var(--border)] bg-[var(--surface)] opacity-65 cursor-default`
      }`}
    >
      {/* Step number */}
      <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center self-start -mb-1 ${
        isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
      }`}>
        {index + 1}
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-3xl ring-2 ${colors.ring}`}>
        {icon}
      </div>

      {/* Title */}
      <p className="text-xs font-medium text-[var(--text)] leading-tight line-clamp-3">
        {course.title_vi || course.title}
      </p>

      {/* Status */}
      <div className="mt-auto">
        {isActive ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--primary)] bg-[var(--primary-light)] px-2 py-0.5 rounded-full">
            <CheckCircle2 size={9} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
            <Lock size={9} /> {t.courseComingSoon}
          </span>
        )}
      </div>

      {/* Level badge */}
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LEVEL_BADGE[course.level] ?? 'bg-surface text-text-muted'}`}>
        {course.level}
      </span>
    </div>
  )

  if (isActive) {
    return (
      <Link href={`/learn/courses/${course.slug ?? course.id}`}>
        {inner}
      </Link>
    )
  }
  return inner
}
