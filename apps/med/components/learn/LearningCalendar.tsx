'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type PreferredDays = 'everyday' | 'weekdays' | 'weekends' | null

interface LearningCalendarProps {
  preferredDays: PreferredDays
  activityDates: string[]   // YYYY-MM-DD for the current month (from parent)
  streak: number
  lessonsThisMonth: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCHEDULED_WEEKDAYS: Record<NonNullable<PreferredDays>, number[]> = {
  everyday: [0, 1, 2, 3, 4, 5, 6],
  weekdays: [1, 2, 3, 4, 5],
  weekends: [0, 6],
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarWeeks(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function toYYYYMMDD(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

// ─── Day cell ─────────────────────────────────────────────────────────────────

interface DayCellProps {
  day: number | null
  isToday: boolean
  isScheduled: boolean
  isCompleted: boolean
  isPast: boolean    // past day in the viewed month (not future, not today)
  isFuture: boolean
  dotDelay: number
}

function DayCell({ day, isToday, isScheduled, isCompleted, isFuture, dotDelay }: DayCellProps) {
  if (!day) return <div className="flex flex-col items-center py-1" />

  // Determine circle style priority: today > completed > scheduled > default
  let circleClass = 'w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all'

  if (isToday) {
    circleClass += ' bg-orange-500 text-white font-bold shadow-sm'
  } else if (isCompleted) {
    // Completed learning day — solid primary fill
    circleClass += ' bg-[var(--primary)] text-white font-semibold'
  } else if (isScheduled && !isFuture) {
    // Scheduled past day with no learning — faint red/muted to show missed
    circleClass += ' bg-red-50 text-red-400 ring-1 ring-red-200'
  } else if (isScheduled && isFuture) {
    // Scheduled future day — gentle blue tint
    circleClass += ' bg-blue-50 text-blue-500 ring-1 ring-blue-200'
  } else {
    circleClass += isFuture
      ? ' text-[var(--text-muted)]/40'
      : ' text-[var(--text-muted)]'
  }

  return (
    <div className="flex flex-col items-center py-1 gap-0.5">
      <motion.div
        className={circleClass}
        initial={isCompleted ? { scale: 0.7, opacity: 0 } : false}
        animate={isCompleted ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: dotDelay }}
      >
        {day}
      </motion.div>
      {/* Completion checkmark dot beneath the number */}
      <div className="h-1.5 flex items-center justify-center">
        {isCompleted && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: dotDelay + 0.05 }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Main calendar component ──────────────────────────────────────────────────

export function LearningCalendar({
  preferredDays,
  activityDates,
  streak,
  lessonsThisMonth,
}: LearningCalendarProps) {
  const { t } = useLang()

  const realToday = useMemo(() => new Date(), [])
  const [viewYear,  setViewYear]  = useState(realToday.getFullYear())
  const [viewMonth, setViewMonth] = useState(realToday.getMonth())
  const [viewDates, setViewDates] = useState<string[]>(activityDates)
  const [loading,   setLoading]   = useState(false)

  const isCurrentMonth =
    viewYear === realToday.getFullYear() && viewMonth === realToday.getMonth()

  // When parent refreshes activityDates (current month), sync it
  useEffect(() => {
    if (isCurrentMonth) setViewDates(activityDates)
  }, [activityDates, isCurrentMonth])

  // Fetch activity dates whenever the viewed month changes (and it's not current)
  useEffect(() => {
    if (isCurrentMonth) return
    setLoading(true)
    fetch(`/api/calendar/activity?year=${viewYear}&month=${viewMonth}`)
      .then(r => r.json())
      .then(j => { if (j.success) setViewDates(j.dates ?? []) })
      .catch(() => setViewDates([]))
      .finally(() => setLoading(false))
  }, [viewYear, viewMonth, isCurrentMonth])

  const goToPrevMonth = () => {
    setViewYear(y => viewMonth === 0 ? y - 1 : y)
    setViewMonth(m => m === 0 ? 11 : m - 1)
  }

  const goToNextMonth = () => {
    setViewYear(y => viewMonth === 11 ? y + 1 : y)
    setViewMonth(m => m === 11 ? 0 : m + 1)
  }

  const todayStr = toYYYYMMDD(
    realToday.getFullYear(),
    realToday.getMonth(),
    realToday.getDate(),
  )

  const activitySet = useMemo(() => new Set(viewDates), [viewDates])
  const scheduledWeekdays = preferredDays ? SCHEDULED_WEEKDAYS[preferredDays] : null
  const weeks = useMemo(() => buildCalendarWeeks(viewYear, viewMonth), [viewYear, viewMonth])

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Count completed days in the viewed month for footer
  const viewedMonthLessons = isCurrentMonth ? lessonsThisMonth : viewDates.length

  let dotIndex = 0

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          {t.calendarTitle}
        </p>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-semibold text-[var(--text)]">{monthLabel}</p>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 px-3 mt-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-semibold text-[var(--text-muted)] uppercase py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-3 pb-3 relative min-h-[160px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
          >
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day, di) => {
                  if (!day) return <div key={di} className="flex flex-col items-center py-1" />

                  const dateStr    = toYYYYMMDD(viewYear, viewMonth, day)
                  const dayOfWeek  = new Date(viewYear, viewMonth, day).getDay()
                  const isToday    = dateStr === todayStr
                  const isScheduled = scheduledWeekdays ? scheduledWeekdays.includes(dayOfWeek) : false
                  const isCompleted = activitySet.has(dateStr)

                  // Future = strictly after today (works for any viewed month)
                  const cellDate = new Date(viewYear, viewMonth, day)
                  const todayDate = new Date(
                    realToday.getFullYear(),
                    realToday.getMonth(),
                    realToday.getDate(),
                  )
                  const isFuture = cellDate > todayDate
                  const isPast   = cellDate < todayDate

                  const currentDotDelay = isCompleted ? 0.08 + dotIndex * 0.04 : 0
                  if (isCompleted) dotIndex++

                  return (
                    <DayCell
                      key={di}
                      day={day}
                      isToday={isToday}
                      isScheduled={isScheduled}
                      isCompleted={isCompleted}
                      isPast={isPast}
                      isFuture={isFuture}
                      dotDelay={currentDotDelay}
                    />
                  )
                })}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[var(--border)] flex-wrap">
        {scheduledWeekdays && (
          <>
            <LegendItem
              swatch={<div className="w-4 h-4 rounded-full bg-blue-50 ring-1 ring-blue-200" />}
              label="Scheduled"
            />
            <LegendItem
              swatch={<div className="w-4 h-4 rounded-full bg-red-50 ring-1 ring-red-200" />}
              label="Missed"
            />
          </>
        )}
        <LegendItem
          swatch={<div className="w-4 h-4 rounded-full bg-[var(--primary)]" />}
          label="Completed"
        />
        <LegendItem
          swatch={<div className="w-4 h-4 rounded-full bg-orange-500" />}
          label="Today"
        />
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-6 px-5 py-3 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-sm font-bold text-orange-500 leading-none">{streak}</p>
            <p className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">{t.streakDays}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-[var(--border)]" />
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-sm font-bold text-[var(--primary)] leading-none">{viewedMonthLessons}</p>
            <p className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">
              {t.calendarMonthlyLessons.replace('{n}', String(viewedMonthLessons))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {swatch}
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
    </div>
  )
}
