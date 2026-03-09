'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Lang, T } from '@/lib/i18n/translations'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: T
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: translations.vi,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with 'vi' on both server and client to avoid hydration mismatch.
  // After mount, read localStorage and switch if a preference is saved.
  const [lang, setLangState] = useState<Lang>('vi')

  useEffect(() => {
    const saved = localStorage.getItem('nursed_lang')
    if (saved === 'en' || saved === 'vi') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('nursed_lang', l)
  }

  const toggleLang = () => setLang(lang === 'en' ? 'vi' : 'en')

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
