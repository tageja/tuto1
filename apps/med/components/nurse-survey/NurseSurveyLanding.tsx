'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, MessageSquareHeart, Gift, Heart, Sparkles } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  onStart: () => void
}

interface SurveySettings {
  voucher_image_url: string | null
  voucher_title: string | null
  is_active: boolean
}

export default function NurseSurveyLanding({ onStart }: Props) {
  const { t } = useLang()
  const [settings, setSettings] = useState<SurveySettings | null>(null)

  useEffect(() => {
    fetch('/api/site-settings/survey-nurses')
      .then((r) => r.json())
      .then((json) => setSettings(json.data ?? null))
      .catch(() => {})
  }, [])

  const bullets = [
    { icon: Clock, title: t.nsBullet1Title, desc: t.nsBullet1Desc, color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: MessageSquareHeart, title: t.nsBullet2Title, desc: t.nsBullet2Desc, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Gift, title: t.nsBullet3Title, desc: t.nsBullet3Desc, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[460px] h-[460px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(11,95,255,0.10) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-7">
          <img src="/images/tuto-logo.png" alt="tuto. Pro" className="h-10 w-auto" />
        </div>

        {/* Hero text */}
        <motion.div
          className="text-center mb-7"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 mb-4">
            <Heart size={13} className="text-rose-500" fill="currentColor" />
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">For Nurses · By tuto.</span>
          </div>
          <h1 className="text-2xl font-bold text-text leading-tight mb-1.5">{t.nsHeroLine1}</h1>
          <p className="text-base text-text-muted leading-snug">{t.nsHeroLine2}</p>
        </motion.div>

        {/* Voucher banner */}
        <motion.div
          className="w-full rounded-2xl overflow-hidden shadow-lg mb-6 border border-border"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          {settings?.voucher_image_url ? (
            <img
              src={settings.voucher_image_url}
              alt="Survey gift"
              className="w-full object-cover"
              style={{ maxHeight: 220 }}
            />
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br from-rose-50 via-white to-primary/5">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 border border-border">
                <Gift size={28} className="text-rose-500" />
              </div>
              <p className="text-sm font-semibold text-text text-center max-w-[260px]">
                {t.nsVoucherTagline}
              </p>
            </div>
          )}

          {/* Voucher tagline bar */}
          <div className="bg-gradient-to-r from-primary to-indigo-500 px-5 py-3 flex items-center gap-2">
            <Sparkles size={15} className="text-white flex-shrink-0" />
            <p className="text-white text-sm font-medium leading-tight">
              {settings?.voucher_title ?? t.nsVoucherTagline}
            </p>
          </div>
        </motion.div>

        {/* Bullets card */}
        <motion.div
          className="bg-white rounded-2xl border border-border shadow-card p-5 mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <ul className="space-y-3.5">
            {bullets.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
              >
                <span className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={color} />
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-text leading-tight">{title}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-snug">{desc}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {t.nsGoBtn}
          <ArrowRight size={18} />
        </motion.button>

        <p className="text-center text-[11px] text-text-muted mt-4">
          {t.nsVoucherEmailNote}
        </p>
      </motion.div>
    </div>
  )
}
