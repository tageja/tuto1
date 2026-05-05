'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import Joyride, { type CallBackProps, STATUS, EVENTS, ACTIONS } from 'react-joyride'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import type { NursedProfile, StepType } from '@/lib/supabase'
import { TourContext } from './TourContext'
import { buildWelcomeTourSteps } from './welcomeTourSteps'
import { buildLessonTourSteps } from './lessonTourSteps'

const LESSON_TOUR_STORAGE_KEY = 'nursed_lesson_tour_seen'

interface Props {
  children: ReactNode
  forceSidebarOpen: () => void
  forceSidebarClose: () => void
}

function shouldAutoRunWelcomeTour(
  profile: NursedProfile,
  hasCompletedAnyLesson: boolean,
): boolean {
  if (!profile.onboarding_done) return false
  if (profile.tour_completed_at !== null) return false
  if (profile.tour_skipped_at !== null) return false
  if (hasCompletedAnyLesson) return false
  return true
}

function shouldRunLessonTour(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(LESSON_TOUR_STORAGE_KEY) !== '1'
}

function markLessonTourSeen(): void {
  localStorage.setItem(LESSON_TOUR_STORAGE_KEY, '1')
}

const JOYRIDE_STYLES = {
  options: {
    primaryColor: '#0B5FFF',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    overlayColor: 'rgba(0, 0, 0, 0.55)',
    arrowColor: '#FFFFFF',
    zIndex: 10000,
    width: 360,
  },
  buttonNext: {
    backgroundColor: '#0B5FFF',
    borderRadius: '12px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
  },
  buttonBack: {
    color: '#888888',
  },
  buttonSkip: {
    color: '#888888',
  },
  tooltip: {
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
}

export default function TourProvider({ children, forceSidebarOpen, forceSidebarClose }: Props) {
  const { profile } = useAuth()
  const { t, lang } = useLang()
  const router = useRouter()

  const [welcomeRunning, setWelcomeRunning] = useState(false)
  const [lessonRunning, setLessonRunning] = useState(false)
  const [welcomeSteps, setWelcomeSteps] = useState<ReturnType<typeof buildWelcomeTourSteps>>([])
  const [lessonSteps, setLessonSteps] = useState<ReturnType<typeof buildLessonTourSteps>>([])
  const [stepIndex, setStepIndex] = useState(0)

  const hasCheckedAutoRun = useRef(false)
  const sidebarOpenedForTour = useRef(false)

  const tourLocale = lang === 'vi'
    ? { back: 'Quay lại', close: 'Đóng', last: 'Hoàn thành', next: 'Tiếp', skip: 'Bỏ qua' }
    : { back: 'Back', close: 'Close', last: 'Finish', next: 'Next', skip: 'Skip' }

  // ── Load intro video URL ──────────────────────────────────────────────────
  const loadAndBuildWelcomeSteps = useCallback(async () => {
    let introVideoUrl: string | null = null
    try {
      const res = await fetch('/api/site-settings/homepage')
      const json = await res.json()
      introVideoUrl = json?.data?.intro_video_url ?? null
    } catch {
      // non-blocking — tour renders without video
    }
    setWelcomeSteps(buildWelcomeTourSteps(t, introVideoUrl))
  }, [t])

  // ── Auto-run check on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!profile || hasCheckedAutoRun.current) return
    hasCheckedAutoRun.current = true

    async function check() {
      try {
        const balanceRes = await fetch('/api/rewards/balance')
        const balanceJson = await balanceRes.json()
        const totalCompleted: number = balanceJson?.data?.totalLessonsCompleted ?? 0
        const hasCompletedAnyLesson = totalCompleted > 0

        if (hasCompletedAnyLesson && profile!.tour_completed_at === null && profile!.tour_skipped_at === null) {
          fetch('/api/profile/tour', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'skip' }),
          }).catch(() => {})
          return
        }

        if (shouldAutoRunWelcomeTour(profile!, hasCompletedAnyLesson)) {
          await loadAndBuildWelcomeSteps()
          setStepIndex(0)
          setWelcomeRunning(true)
        }
      } catch {
        // silent — don't block user
      }
    }

    check()
  }, [profile, loadAndBuildWelcomeSteps])

  // ── Rebuild steps when language changes ──────────────────────────────────
  useEffect(() => {
    if (welcomeRunning || lessonRunning) {
      loadAndBuildWelcomeSteps()
    }
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sidebar management for mobile ────────────────────────────────────────
  const openSidebarForStep = useCallback((index: number) => {
    // Steps 1-3 target sidebar items → ensure sidebar is open
    if (index >= 1 && index <= 3) {
      if (!sidebarOpenedForTour.current) {
        sidebarOpenedForTour.current = true
        forceSidebarOpen()
      }
    } else if (sidebarOpenedForTour.current && (index === 0 || index === 4)) {
      sidebarOpenedForTour.current = false
      forceSidebarClose()
    }
  }, [forceSidebarOpen, forceSidebarClose])

  // ── Welcome tour callback ─────────────────────────────────────────────────
  const handleWelcomeCallback = useCallback((data: CallBackProps) => {
    const { status, type, action, index } = data

    if (type === EVENTS.STEP_BEFORE) {
      openSidebarForStep(index)
    }

    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      setStepIndex(index + 1)
    } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      setStepIndex(index - 1)
    }

    const isFinished = status === STATUS.FINISHED
    const isSkipped = status === STATUS.SKIPPED

    if (isFinished || isSkipped) {
      setWelcomeRunning(false)
      if (sidebarOpenedForTour.current) {
        sidebarOpenedForTour.current = false
        forceSidebarClose()
      }

      const tourAction = isFinished ? 'complete' : 'skip'
      fetch('/api/profile/tour', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: tourAction }),
      }).catch(() => {})

      if (isFinished) {
        router.push('/learn/courses')
      }
    }
  }, [openSidebarForStep, forceSidebarClose, router])

  // ── Lesson tour callback ──────────────────────────────────────────────────
  const handleLessonCallback = useCallback((data: CallBackProps) => {
    const { status, type, action, index } = data

    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      setStepIndex(index + 1)
    } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      setStepIndex(index - 1)
    }

    const isFinished = status === STATUS.FINISHED
    const isSkipped = status === STATUS.SKIPPED

    if (isFinished || isSkipped) {
      setLessonRunning(false)
      markLessonTourSeen()
    }
  }, [])

  // ── Public API ────────────────────────────────────────────────────────────
  const runWelcomeTour = useCallback(async () => {
    await loadAndBuildWelcomeSteps()
    setStepIndex(0)
    setWelcomeRunning(true)
  }, [loadAndBuildWelcomeSteps])

  const runLessonTour = useCallback((presentStepTypes: StepType[]) => {
    if (!shouldRunLessonTour()) return
    setLessonSteps(buildLessonTourSteps(t, presentStepTypes))
    setStepIndex(0)
    setLessonRunning(true)
  }, [t])

  return (
    <TourContext.Provider value={{
      runWelcomeTour,
      runLessonTour,
      isWelcomeTourRunning: welcomeRunning,
      isLessonTourRunning: lessonRunning,
    }}>
      {children}

      {welcomeRunning && welcomeSteps.length > 0 && (
        <Joyride
          steps={welcomeSteps}
          run={welcomeRunning}
          stepIndex={stepIndex}
          callback={handleWelcomeCallback}
          continuous
          showProgress
          showSkipButton
          disableScrolling={false}
          styles={JOYRIDE_STYLES}
          locale={tourLocale}
        />
      )}

      {lessonRunning && lessonSteps.length > 0 && (
        <Joyride
          steps={lessonSteps}
          run={lessonRunning}
          stepIndex={stepIndex}
          callback={handleLessonCallback}
          continuous
          showProgress
          showSkipButton
          disableScrolling={false}
          styles={JOYRIDE_STYLES}
          locale={tourLocale}
        />
      )}
    </TourContext.Provider>
  )
}
