import { createContext, useContext } from 'react'
import type { StepType } from '@/lib/supabase'

export interface TourContextValue {
  runWelcomeTour: () => void
  runLessonTour: (presentStepTypes: StepType[]) => void
  isWelcomeTourRunning: boolean
  isLessonTourRunning: boolean
}

export const TourContext = createContext<TourContextValue>({
  runWelcomeTour: () => {},
  runLessonTour: () => {},
  isWelcomeTourRunning: false,
  isLessonTourRunning: false,
})

export function useTour() {
  return useContext(TourContext)
}
