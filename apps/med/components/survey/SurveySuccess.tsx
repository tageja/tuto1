'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function SurveySuccess() {
  const { t } = useLang()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(11,95,255,0.08) 0%, transparent 65%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Success icon */}
        <motion.div
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        >
          <CheckCircle2 size={40} className="text-green-500" />
        </motion.div>

        {/* Confetti dots */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 360
          const dist = 70 + (i % 3) * 20
          const x = Math.cos((angle * Math.PI) / 180) * dist
          const y = Math.sin((angle * Math.PI) / 180) * dist
          const colors = ['#0B5FFF', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#F43F5E']
          return (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full left-1/2 top-[10rem]"
              style={{ backgroundColor: colors[i % colors.length] }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x, y, scale: [0, 1.2, 0.8], opacity: [1, 1, 0] }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.04, ease: 'easeOut' }}
            />
          )
        })}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-text mb-2">{t.surveySuccessTitle}</h1>
          <p className="text-text-muted mb-6">{t.surveySuccessSubtitle}</p>

          {/* Voucher note card */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text mb-1">
                  🎁 Voucher của bạn đang trên đường đến!
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {t.surveySuccessVoucherNote}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface hover:text-text transition-all"
          >
            <ArrowLeft size={15} />
            {t.surveySuccessClose}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
