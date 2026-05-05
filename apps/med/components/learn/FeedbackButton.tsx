'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface FeedbackButtonProps {
  onClick: () => void
}

export default function FeedbackButton({ onClick }: FeedbackButtonProps) {
  const { t } = useLang()

  return (
    <motion.button
      onClick={onClick}
      aria-label={t.feedbackOpenButton}
      className={[
        'fixed z-[90] flex items-center justify-center',
        'w-12 h-12 rounded-full bg-primary text-white',
        'shadow-lg shadow-primary/30',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        // Mobile: bottom-20 to clear lesson player CTAs; Desktop: bottom-8
        'bottom-20 right-4 md:bottom-8 md:right-8',
      ].join(' ')}
      whileHover={{ scale: 1.05, boxShadow: '0 12px 28px rgba(11,95,255,0.35)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <MessageSquare size={20} />
    </motion.button>
  )
}
