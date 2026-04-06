'use client'

import { useState, useRef } from 'react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  en: string
  vi: string
  className?: string
  as?: 'span' | 'p'
}

export default function TranslatablePhrase({ en, vi, className = '', as: Tag = 'span' }: Props) {
  const { phraseTranslationEnabled } = useLang()
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const spanRef = useRef<HTMLElement>(null)

  if (!phraseTranslationEnabled || !vi) {
    return <Tag className={className}>{en}</Tag>
  }

  const show = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
    setVisible(true)
  }

  const hide = () => {
    setVisible(false)
    setPos(null)
  }

  return (
    <>
      <Tag
        ref={spanRef as React.RefObject<HTMLParagraphElement>}
        className={`translatable-phrase inline ${className}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={(e) => { e.preventDefault(); visible ? hide() : show(e as React.MouseEvent) }}
      >
        {en}
      </Tag>
      {visible && pos && (
        <span
          className="fixed z-50 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-1.5"
          style={{ left: pos.x, top: pos.y - 40, transform: 'translateX(-50%)' }}
        >
          <span>🇻🇳</span>
          <span>{vi}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </>
  )
}
