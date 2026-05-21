'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Gift, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  onStart: () => void
}

interface SurveySettings {
  voucher_image_url: string | null
  voucher_title: string | null
  is_active: boolean
}

export default function SurveyLanding({ onStart }: Props) {
  const { t, lang } = useLang()
  const [settings, setSettings] = useState<SurveySettings | null>(null)

  useEffect(() => {
    fetch('/api/site-settings/survey-hcmute')
      .then((r) => r.json())
      .then((json) => setSettings(json.data ?? null))
      .catch(() => {})
  }, [])

  const bullets = [
    { icon: Clock, text: lang => lang === 'vi' ? 'Chỉ mất khoảng 5 phút' : 'Takes about 5 minutes' },
    { icon: CheckCircle2, text: lang => lang === 'vi' ? '11 câu hỏi thực tế, không có câu trả lời sai' : '11 practical questions — no wrong answers' },
    { icon: Gift, text: lang => lang === 'vi' ? 'Nhận voucher sau khi hoàn thành' : 'Receive a voucher after completing' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(11,95,255,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/images/tuto-logo.png" alt="tuto. Pro" className="h-10 w-auto" />
        </div>

        {/* Voucher banner */}
        <motion.div
          className="w-full rounded-2xl overflow-hidden shadow-lg mb-8 border border-border"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {settings?.voucher_image_url ? (
            <img
              src={settings.voucher_image_url}
              alt="Survey voucher"
              className="w-full object-cover"
              style={{ maxHeight: 220 }}
            />
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br from-primary/10 via-indigo-50 to-white">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Gift size={28} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-primary text-center">
                {t.surveyVoucherTagline}
              </p>
            </div>
          )}

          {/* Voucher tagline bar */}
          <div className="bg-primary px-5 py-3 flex items-center gap-2">
            <Gift size={16} className="text-white flex-shrink-0" />
            <p className="text-white text-sm font-medium leading-tight">
              {settings?.voucher_title ?? t.surveyVoucherTagline}
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white rounded-2xl border border-border shadow-card p-6 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-xl font-bold text-text mb-1">{t.surveyPageTitle}</h1>
          <p className="text-sm text-text-muted mb-5">{t.surveyPageDesc}</p>

          <ul className="space-y-3 mb-6">
            {bullets.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3 text-sm text-text"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-primary" />
                </span>
                <span>{text(lang)}</span>
              </motion.li>
            ))}
          </ul>

          <p className="text-xs text-text-muted bg-surface rounded-xl px-4 py-3 border border-border leading-relaxed">
            🎁 {t.surveyVoucherEmailNote}
          </p>
        </motion.div>

        <motion.button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white font-semibold text-base shadow-lg hover:bg-primary/90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          {t.surveyGoBtn}
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  )
}
