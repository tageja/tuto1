'use client'

/*
 * ProfilePageClient — the learner's identity card.
 *
 * Brainstorm: A Vietnamese nurse opens this page after 3 weeks of study.
 * She hasn't uploaded a photo or set her position yet. The page should feel
 * like a warm invitation — "this is your space, personalise it."
 * - Profile header: big, personal, editable inline — not a boring settings form.
 * - Stats row: her progress told in 4 numbers. Should feel like achievement, not homework.
 * - Badges: the ones she's earned should glow; locked ones feel like "next challenge."
 * - Courses in progress: the progress bar should make her want to close the gap to 100%.
 * - Empty sections (endorsements, coupons) must feel like invitations, not failures.
 *
 * Plan:
 * 1. Profile header (avatar, name, position, bio, hospital, role, join date)
 * 2. Stats row (balance ⭐, streak 🔥, lessons ✅, total earned)
 * 3. Learning preferences (display + edit via OnboardingModal)
 * 4. Courses in progress (horizontal scroll cards with progress bar)
 * 5. Completed courses (compact list)
 * 6. Badges & achievements (grid: earned coloured, locked greyed)
 * 7. Redeemed coupons (compact list)
 * 8. Practice groups (pill list)
 * 9. Endorsements received (card list)
 */

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Pencil, Check, X, Star, Flame, BookOpen, Award,
  Lock, Users, MessageSquare, Gift, ChevronRight,
  Settings2, Hospital,
} from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import AvatarUpload from './AvatarUpload'
import { OnboardingModal } from './OnboardingModal'
import type { ProfileAggregate } from '@/lib/db/profile'

// ─── Fade-in animation variant ────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
}

// ─── Inline editable field ────────────────────────────────────────────────────

function EditableField({
  value,
  placeholder,
  onSave,
  multiline = false,
  className = '',
}: {
  value: string
  placeholder: string
  onSave: (v: string) => Promise<void>
  multiline?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return }
    setSaving(true)
    await onSave(draft)
    setSaving(false)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) handleSave()
    if (e.key === 'Escape') { setDraft(value); setEditing(false) }
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true) }}
        className={`group flex items-center gap-1.5 text-left hover:text-primary transition-colors ${className}`}
      >
        <span>{value || <span className="text-text-muted italic">{placeholder}</span>}</span>
        <Pencil size={13} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
      </button>
    )
  }

  return (
    <div className="flex items-start gap-2">
      {multiline ? (
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className={`flex-1 rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${className}`}
        />
      ) : (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`flex-1 rounded-lg border border-primary/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
        />
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
      >
        <Check size={14} />
      </button>
      <button
        onClick={() => { setDraft(value); setEditing(false) }}
        className="p-1.5 rounded-lg border border-border text-text-muted hover:bg-surface"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children, index }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  index: number
}) {
  return (
    <motion.section
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="bg-bg border border-border rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <h2 className="text-base font-semibold text-text">{title}</h2>
      </div>
      {children}
    </motion.section>
  )
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="flex-1 min-w-[100px] flex flex-col items-center gap-1 px-4 py-3 bg-surface rounded-xl border border-border">
      <span className="text-2xl">{icon}</span>
      <span className="text-xl font-bold text-text">{value}</span>
      <span className="text-[11px] text-text-muted text-center leading-tight">{label}</span>
    </div>
  )
}

// ─── Badge tile ───────────────────────────────────────────────────────────────

function BadgeTile({ icon, name, locked }: { icon: string | null; name: string; locked: boolean }) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center',
        locked
          ? 'bg-surface border-border opacity-50 grayscale'
          : 'bg-gradient-to-b from-yellow-50 to-orange-50 border-yellow-200',
      ].join(' ')}
    >
      <span className="text-2xl relative">
        {icon ?? '🏅'}
        {locked && (
          <Lock size={10} className="absolute -bottom-1 -right-1 text-text-muted" />
        )}
      </span>
      <span className="text-[11px] font-medium text-text leading-tight line-clamp-2">{name}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  data: ProfileAggregate
}

export default function ProfilePageClient({ data: initialData }: Props) {
  const { t, lang } = useLang()
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2500)
  }, [])

  const patchProfile = useCallback(async (patch: Record<string, string>) => {
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    if (res.ok) {
      setData(prev => ({ ...prev, profile: { ...prev.profile, ...patch } }))
      showToast(t.profileSaveSuccess)
    } else {
      showToast(t.profileSaveError)
    }
  }, [t, showToast])

  const { profile, stats, badges, allBadgeDefinitions, earnedBadgeIds, coursesInProgress, coursesCompleted, recentRedemptions, groupsJoined, endorsementsReceived } = data

  const joinDate = new Date(profile.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' })

  const intensityLabel = profile.learning_intensity === 'mini' ? t.onboardingOptMini : profile.learning_intensity === 'deep' ? t.onboardingOptDeep : '—'
  const daysLabel = profile.preferred_days === 'everyday' ? t.onboardingOptEveryday : profile.preferred_days === 'weekdays' ? t.onboardingOptWeekdays : profile.preferred_days === 'weekends' ? t.onboardingOptWeekends : '—'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

      {/* ── 1. Profile Header ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="bg-gradient-to-br from-primary/5 via-blue-50 to-indigo-50 border border-primary/10 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <AvatarUpload
            avatarUrl={profile.avatar_url}
            onUploaded={url => setData(prev => ({ ...prev, profile: { ...prev.profile, avatar_url: url } }))}
          />

          <div className="flex-1 space-y-2 min-w-0">
            {/* Name */}
            <EditableField
              value={profile.full_name ?? ''}
              placeholder={t.profileEditName}
              onSave={v => patchProfile({ full_name: v })}
              className="text-xl font-bold text-text"
            />

            {/* Position */}
            <EditableField
              value={profile.position ?? ''}
              placeholder={t.profilePosition}
              onSave={v => patchProfile({ position: v })}
              className="text-sm text-text-muted"
            />

            {/* Hospital + Role chips */}
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.hospital && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  <Hospital size={11} />
                  {profile.hospital.name}
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                {profile.role}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface border border-border text-text-muted text-xs">
                {t.profileJoinedDate.replace('{date}', joinDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{t.profileBio}</p>
          <EditableField
            value={profile.bio ?? ''}
            placeholder={t.profileBio}
            onSave={v => patchProfile({ bio: v })}
            multiline
            className="text-sm text-text w-full"
          />
        </div>
      </motion.div>

      {/* ── 2. Stats Row ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex gap-3 flex-wrap">
        <StatPill icon="⭐" value={stats.starBalance} label={t.profileStatsBalance} />
        <StatPill icon="🔥" value={stats.streak} label={t.profileStatsStreak} />
        <StatPill icon="✅" value={stats.lessonsCompleted} label={t.profileStatsLessons} />
        <StatPill icon="🏆" value={stats.starsEarned} label={t.profileStatsEarned} />
      </motion.div>

      {/* ── 3. Learning Preferences ── */}
      <Section title={t.profilePrefsTitle} icon={<Settings2 size={16} />} index={2}>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.learning_intensity && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{intensityLabel}</span>
          )}
          {profile.preferred_days && (
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">{daysLabel}</span>
          )}
          {!profile.learning_intensity && !profile.preferred_days && (
            <span className="text-sm text-text-muted italic">{t.onboardingBtnSkip}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPrefsOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Pencil size={13} />
            {t.profilePrefsEdit}
          </button>
          <button
            onClick={async () => {
              await fetch('/api/profile/tour', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset' }),
              })
              localStorage.removeItem('nursed_lesson_tour_seen')
              window.location.href = '/learn'
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-sm font-medium text-text-muted hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
          >
            {t.tourReplayLink}
          </button>
        </div>
      </Section>

      {/* ── 4. Courses In Progress ── */}
      <Section title={t.profileCoursesInProgress} icon={<BookOpen size={16} />} index={3}>
        {coursesInProgress.length === 0 ? (
          <p className="text-sm text-text-muted">{t.profileCoursesEmpty}</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {coursesInProgress.map(course => (
              <div
                key={course.courseId}
                className="shrink-0 w-52 bg-surface border border-border rounded-xl p-4 flex flex-col gap-2"
              >
                <p className="text-xs font-semibold text-text line-clamp-2">{course.courseTitle}</p>
                {course.lessonTitle && (
                  <p className="text-[11px] text-text-muted line-clamp-1">{course.lessonTitle}</p>
                )}
                <div className="mt-auto">
                  <div className="flex justify-between text-[11px] text-text-muted mb-1">
                    <span>{course.completionPct}%</span>
                    <ChevronRight size={12} />
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${course.completionPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── 5. Completed Courses ── */}
      <Section title={t.profileCoursesCompleted} icon={<Check size={16} />} index={4}>
        {coursesCompleted.length === 0 ? (
          <p className="text-sm text-text-muted">{t.profileCoursesEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {coursesCompleted.map(course => (
              <li key={course.courseId} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                <span className="text-green-500 shrink-0">✅</span>
                <span className="text-sm font-medium text-text flex-1">{course.courseTitle}</span>
                {course.completedAt && (
                  <span className="text-[11px] text-text-muted">
                    {new Date(course.completedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── 6. Badges & Achievements ── */}
      <Section title={t.profileBadgesTitle} icon={<Award size={16} />} index={5}>
        {allBadgeDefinitions.length === 0 ? (
          <p className="text-sm text-text-muted">{t.profileBadgesLocked}</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {allBadgeDefinitions.map(def => {
              const earned = badges.find(b => b.id === def.id)
              const locked = !earnedBadgeIds.includes(def.id)
              const displayName = lang === 'vi' && def.name_vi ? def.name_vi : def.name
              return (
                <BadgeTile
                  key={def.id}
                  icon={earned?.icon ?? def.icon}
                  name={displayName}
                  locked={locked}
                />
              )
            })}
          </div>
        )}
      </Section>

      {/* ── 7. Redeemed Coupons ── */}
      <Section title={t.profileCouponsTitle} icon={<Gift size={16} />} index={6}>
        {recentRedemptions.length === 0 ? (
          <p className="text-sm text-text-muted">{t.profileCouponsEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {recentRedemptions.map((r, i) => (
              <li key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{r.couponName}</p>
                  {r.brand && <p className="text-[11px] text-text-muted">{r.brand}</p>}
                </div>
                {r.couponCode && (
                  <code className="text-xs bg-surface border border-border rounded px-2 py-0.5 font-mono text-primary shrink-0">
                    {r.couponCode}
                  </code>
                )}
                <span className="text-[11px] text-orange-600 font-semibold shrink-0">−{r.starsSpent}⭐</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── 8. Practice Groups ── */}
      <Section title={t.profileGroupsTitle} icon={<Users size={16} />} index={7}>
        {groupsJoined.length === 0 ? (
          <p className="text-sm text-text-muted">{t.profileGroupsEmpty}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groupsJoined.map(g => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium"
              >
                <Users size={12} />
                {g.name ?? 'Practice Group'}
                <span className="text-[11px] text-blue-400">({g.memberCount})</span>
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* ── 9. Endorsements Received ── */}
      <Section title={t.profileEndorsementsTitle} icon={<MessageSquare size={16} />} index={8}>
        {endorsementsReceived.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">🤝</p>
            <p className="text-sm text-text-muted">{t.profileEndorsementsEmpty}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {endorsementsReceived.map((e, i) => (
              <li key={i} className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-text leading-relaxed">"{e.message}"</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-semibold text-primary">— {e.from_name ?? 'Anonymous'}</span>
                  <span className="text-[11px] text-text-muted">
                    {new Date(e.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Onboarding modal for preferences ── */}
      {prefsOpen && (
        <OnboardingModal
          onComplete={async () => {
            setPrefsOpen(false)
            router.refresh()
          }}
        />
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-text text-bg text-sm font-medium rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
