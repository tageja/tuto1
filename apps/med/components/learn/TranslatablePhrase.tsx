'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  en: string
  vi?: string
  className?: string
  as?: 'span' | 'p'
}

interface TooltipPos {
  x: number
  y: number
  above: boolean
}

export default function TranslatablePhrase({ en, vi, className = '', as: Tag = 'span' }: Props) {
  const { phraseTranslationEnabled } = useLang()
  const [pos, setPos] = useState<TooltipPos | null>(null)
  const [mounted, setMounted] = useState(false)

  // Ensure portal only renders on client
  useEffect(() => { setMounted(true) }, [])

  if (!phraseTranslationEnabled || !vi) {
    return <Tag className={className}>{en}</Tag>
  }

  const show = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    // Place below if near top of viewport, above otherwise
    const spaceAbove = rect.top
    const above = spaceAbove > 60
    const y = above ? rect.top : rect.bottom
    setPos({ x: cx, y, above })
  }

  const hide = () => setPos(null)

  const tooltip = pos && mounted && (
    <span
      className="fixed z-[9999] px-3 py-2 bg-gray-900 text-white text-xs rounded-xl shadow-2xl whitespace-nowrap pointer-events-none flex items-center gap-2 font-medium"
      style={{
        left: pos.x,
        transform: 'translateX(-50%)',
        ...(pos.above
          ? { top: pos.y - 44 }
          : { top: pos.y + 8 }),
      }}
    >
      <span className="text-base leading-none">🇻🇳</span>
      <span>{vi}</span>
      {/* Arrow */}
      {pos.above ? (
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900" />
      ) : (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-gray-900" />
      )}
    </span>
  )

  return (
    <>
      <Tag
        className={`translatable-phrase inline ${className}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={(e) => { e.preventDefault(); pos ? hide() : show(e as React.MouseEvent) }}
      >
        {en}
      </Tag>
      {mounted && tooltip && createPortal(tooltip, document.body)}
    </>
  )
}
