'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Lang, T } from '@/lib/i18n/translations'

const PHRASE_TRANSLATION_KEY = 'nursed_phrase_translation_enabled'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: T
  toggleLang: () => void
  phraseTranslationEnabled: boolean
  togglePhraseTranslation: () => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: translations.vi,
  toggleLang: () => {},
  phraseTranslationEnabled: true,
  togglePhraseTranslation: () => {},
})

function readSavedLang(): Lang {
  if (typeof window === 'undefined') return 'vi'
  const saved = localStorage.getItem('nursed_lang')
  return saved === 'en' || saved === 'vi' ? saved : 'vi'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readSavedLang)
  const [phraseTranslationEnabled, setPhraseTranslationEnabled] = useState(true)

  useEffect(() => {
    setLangState(readSavedLang())

    const savedPhrase = localStorage.getItem(PHRASE_TRANSLATION_KEY)
    if (savedPhrase === 'false') setPhraseTranslationEnabled(false)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('nursed_lang', l)
  }

  const toggleLang = () => setLang(lang === 'en' ? 'vi' : 'en')

  const togglePhraseTranslation = () => {
    const next = !phraseTranslationEnabled
    setPhraseTranslationEnabled(next)
    localStorage.setItem(PHRASE_TRANSLATION_KEY, String(next))
  }

  return (
    <LanguageContext.Provider value={{
      lang, setLang, t: translations[lang], toggleLang,
      phraseTranslationEnabled, togglePhraseTranslation,
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
