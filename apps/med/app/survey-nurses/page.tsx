'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import NurseSurveyLanding from '@/components/nurse-survey/NurseSurveyLanding'
import NurseSurveyForm from '@/components/nurse-survey/NurseSurveyForm'
import NurseSurveySuccess from '@/components/nurse-survey/NurseSurveySuccess'

type Screen = 'splash' | 'form' | 'success'

export default function SurveyNursesPage() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [mvpInterested, setMvpInterested] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {screen === 'splash' && <LandingNav />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {screen === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <NurseSurveyLanding onStart={() => setScreen('form')} />
            </motion.div>
          )}

          {screen === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <NurseSurveyForm onComplete={(mvp) => { setMvpInterested(mvp); setScreen('success') }} />
            </motion.div>
          )}

          {screen === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <NurseSurveySuccess mvpInterested={mvpInterested} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {screen !== 'form' && <LandingFooter />}
    </div>
  )
}
