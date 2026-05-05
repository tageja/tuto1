'use client'

import { useState, useCallback } from 'react'
import { Menu, Languages } from 'lucide-react'
import LearnerSidebar from '@/components/learn/LearnerSidebar'
import FeedbackButton from '@/components/learn/FeedbackButton'
import FeedbackModal from '@/components/learn/FeedbackModal'
import TourProvider from '@/components/learn/tour/TourProvider'
import { useLang } from '@/contexts/LanguageContext'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const { phraseTranslationEnabled, togglePhraseTranslation } = useLang()

  const forceSidebarOpen = useCallback(() => setSidebarOpen(true), [])
  const forceSidebarClose = useCallback(() => setSidebarOpen(false), [])

  return (
    <TourProvider forceSidebarOpen={forceSidebarOpen} forceSidebarClose={forceSidebarClose}>
      <div className="flex min-h-screen bg-surface">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
          {/* Top bar — mobile hamburger + global translation toggle */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-surface text-text-muted md:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <img src="/images/tuto-logo.png" alt="tuto." className="h-7 w-auto md:hidden" />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Global phrase translation toggle */}
            <button
              onClick={togglePhraseTranslation}
              title={phraseTranslationEnabled ? 'Hide Vietnamese tooltips' : 'Show Vietnamese tooltips'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                phraseTranslationEnabled
                  ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                  : 'bg-bg text-text-muted border-border hover:bg-surface'
              }`}
            >
              <Languages size={14} />
              <span>VI hints</span>
              <span className={`w-1.5 h-1.5 rounded-full ${phraseTranslationEnabled ? 'bg-primary' : 'bg-text-muted'}`} />
            </button>
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
          <FeedbackButton onClick={() => setFeedbackOpen(true)} />
          <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </main>
      </div>
    </TourProvider>
  )
}
