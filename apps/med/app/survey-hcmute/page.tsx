'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'
import SurveyLanding from '@/components/survey/SurveyLanding'
import SurveyForm from '@/components/survey/SurveyForm'
import SurveySuccess from '@/components/survey/SurveySuccess'

type Screen = 'splash' | 'form' | 'success'

export default function SurveyHCMUTEPage() {
  const [screen, setScreen] = useState<Screen>('splash')

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
              <SurveyLanding onStart={() => setScreen('form')} />
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
              <SurveyForm onComplete={() => setScreen('success')} />
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
              <SurveySuccess />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {screen !== 'form' && <LandingFooter />}
    </div>
  )
}
