'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

type LearningIntensity = 'mini' | 'deep'
type PreferredDays = 'everyday' | 'weekdays' | 'weekends'

interface Prefs {
  intensity: LearningIntensity
  preferred_days: PreferredDays
}

interface OnboardingModalProps {
  onComplete: (prefs: Prefs) => void
}

// ─── Confetti particle component ──────────────────────────────────────────────

function ConfettiBurst() {
  const particles = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * 360
    const dist = 60 + Math.random() * 40
    const x = Math.cos((angle * Math.PI) / 180) * dist
    const y = Math.sin((angle * Math.PI) / 180) * dist
    const colors = ['#0B5FFF', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#F43F5E']
    const color = colors[i % colors.length]
    return { x, y, color, delay: i * 0.03 }
  })

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: [0, 1.2, 0.8], opacity: [1, 1, 0] }}
          transition={{ duration: 0.7, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ─── Option card ──────────────────────────────────────────────────────────────

function OptionCard({
  emoji,
  label,
  sublabel,
  selected,
  onClick,
}: {
  emoji: string
  label: string
  sublabel: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all duration-150 select-none ${
        selected
          ? 'border-[var(--primary)] bg-[var(--primary-light)] shadow-sm'
          : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--surface)]'
      }`}
    >
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${selected ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
          {label}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{sublabel}</p>
      </div>
      {selected && (
        <CheckCircle2 size={18} className="flex-shrink-0 text-[var(--primary)]" />
      )}
    </button>
  )
}

// ─── Step dots ────────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-6">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === current ? 20 : 8,
            backgroundColor: i === current ? 'var(--primary)' : '#D1D5DB',
          }}
          style={{ height: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      ))}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { t } = useLang()
  const [step, setStep] = useState(0)
  const [intensity, setIntensity] = useState<LearningIntensity | null>(null)
  const [preferredDays, setPreferredDays] = useState<PreferredDays | null>(null)
  const [saving, setSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [direction, setDirection] = useState(1)

  const handleNext = () => {
    if (!intensity) return
    setDirection(1)
    setStep(1)
  }

  const handleFinish = async () => {
    if (!intensity || !preferredDays) return
    setSaving(true)
    try {
      await fetch('/api/profile/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity, preferred_days: preferredDays }),
      })
      setShowConfetti(true)
      setTimeout(() => {
        onComplete({ intensity, preferred_days: preferredDays })
      }, 900)
    } catch {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    // Does NOT set onboarding_done — modal will re-appear next visit
    onComplete({ intensity: intensity ?? 'mini', preferred_days: preferredDays ?? 'everyday' })
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-[420px] rounded-3xl bg-white shadow-2xl p-8 overflow-hidden"
      >
        {showConfetti && <ConfettiBurst />}

        {/* Header */}
        <div className="text-center mb-2">
          <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-widest mb-1">{t.logoSub}</p>
          <h2 className="text-xl font-bold text-[var(--text)] leading-tight">{t.onboardingTitle}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.onboardingSubtitle}</p>
        </div>

        <StepDots current={step} total={2} />

        {/* Animated step content */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 ? (
            <motion.div
              key="step-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <p className="text-sm font-semibold text-[var(--text)] mb-3">{t.onboardingQ1}</p>
              <div className="flex flex-col gap-3">
                <OptionCard
                  emoji="🌱"
                  label={t.onboardingOptMini}
                  sublabel="10–15 min / day"
                  selected={intensity === 'mini'}
                  onClick={() => setIntensity('mini')}
                />
                <OptionCard
                  emoji="🔥"
                  label={t.onboardingOptDeep}
                  sublabel="30–45 min, fewer days"
                  selected={intensity === 'deep'}
                  onClick={() => setIntensity('deep')}
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!intensity}
                className="mt-5 w-full py-3 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm transition-opacity disabled:opacity-40"
              >
                {t.onboardingBtnNext}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <p className="text-sm font-semibold text-[var(--text)] mb-3">{t.onboardingQ2}</p>
              <div className="flex flex-col gap-3">
                <OptionCard
                  emoji="📅"
                  label={t.onboardingOptEveryday}
                  sublabel="7 days a week"
                  selected={preferredDays === 'everyday'}
                  onClick={() => setPreferredDays('everyday')}
                />
                <OptionCard
                  emoji="🗓️"
                  label={t.onboardingOptWeekdays}
                  sublabel="Mon – Fri"
                  selected={preferredDays === 'weekdays'}
                  onClick={() => setPreferredDays('weekdays')}
                />
                <OptionCard
                  emoji="🌅"
                  label={t.onboardingOptWeekends}
                  sublabel="Sat – Sun"
                  selected={preferredDays === 'weekends'}
                  onClick={() => setPreferredDays('weekends')}
                />
              </div>

              <button
                onClick={handleFinish}
                disabled={!preferredDays || saving}
                className="mt-5 w-full py-3 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm transition-opacity disabled:opacity-40"
              >
                {saving ? '...' : t.onboardingBtnFinish}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            {t.onboardingBtnSkip}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
