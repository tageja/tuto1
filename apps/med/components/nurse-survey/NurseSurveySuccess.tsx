'use client'

import { motion } from 'framer-motion'
import { Heart, Mail, Sparkles, ArrowLeft, Gift, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  mvpInterested: boolean
}

export default function NurseSurveySuccess({ mvpInterested }: Props) {
  const { t } = useLang()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.06) 0%, rgba(11,95,255,0.05) 35%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Heart icon */}
        <motion.div
          className="relative w-20 h-20 mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        >
          <div className="absolute inset-0 rounded-full bg-rose-50 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart size={36} className="text-rose-500" fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        {/* Confetti */}
        {[...Array(14)].map((_, i) => {
          const angle = (i / 14) * 360
          const dist = 80 + (i % 4) * 18
          const x = Math.cos((angle * Math.PI) / 180) * dist
          const y = Math.sin((angle * Math.PI) / 180) * dist
          const colors = ['#F43F5E', '#0B5FFF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
          return (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full left-1/2 top-[5rem]"
              style={{ backgroundColor: colors[i % colors.length] }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x, y, scale: [0, 1.2, 0.8], opacity: [1, 1, 0] }}
              transition={{ duration: 1, delay: 0.2 + i * 0.04, ease: 'easeOut' }}
            />
          )
        })}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h1 className="text-2xl font-bold text-text mb-2">{t.nsSuccessTitle}</h1>
          <p className="text-text-muted mb-7 leading-relaxed">{t.nsSuccessSubtitle}</p>

          {/* MVP invite (if opted in) */}
          {mvpInterested && (
            <motion.div
              className="bg-gradient-to-br from-primary/5 via-white to-indigo-50 rounded-2xl border border-primary/20 shadow-card p-5 mb-4 text-left"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary mb-1">
                    🎉 {t.nsSuccessMvpTitle}
                  </p>
                  <p className="text-sm text-text leading-relaxed">
                    {t.nsSuccessMvpDesc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Voucher card */}
          <motion.div
            className="bg-white rounded-2xl border border-border shadow-card p-5 mb-4 text-left"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                <Gift size={18} className="text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text mb-1">
                  Quà cảm ơn từ tuto.
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                  {t.nsSuccessGiftDesc}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Trust note */}
          <motion.div
            className="flex items-center justify-center gap-2 text-xs text-text-muted mb-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <ShieldCheck size={13} />
            <span>Thông tin của bạn được bảo mật. Chỉ dùng cho nghiên cứu này.</span>
          </motion.div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface hover:text-text transition-all"
          >
            <ArrowLeft size={15} />
            {t.nsSuccessClose}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
