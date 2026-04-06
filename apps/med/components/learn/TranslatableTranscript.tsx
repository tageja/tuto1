'use client'

import { useState, useMemo, useCallback } from 'react'
import { useLang } from '@/contexts/LanguageContext'

export interface TranscriptSegment {
  en: string
  vi: string
}

interface Props {
  text: string
  segments?: TranscriptSegment[]
  enabled?: boolean
}

type Part = { type: 'plain'; text: string } | { type: 'segment'; text: string; vi: string }

function parseTextWithSegments(text: string, segments: TranscriptSegment[]): Part[] {
  if (!segments?.length) return [{ type: 'plain', text }]

  // Sort by length descending so longer phrases match first (avoid "Hello" matching inside "Hello there")
  const sorted = [...segments].sort((a, b) => b.en.length - a.en.length)

  const parts: Part[] = []
  let lastIndex = 0

  // Build list of (startIndex, endIndex, segment) for all matches
  const matches: { start: number; end: number; vi: string }[] = []
  for (const seg of sorted) {
    if (!seg.en?.trim()) continue
    let pos = 0
    while (pos < text.length) {
      const idx = text.indexOf(seg.en, pos)
      if (idx === -1) break
      matches.push({ start: idx, end: idx + seg.en.length, vi: seg.vi })
      pos = idx + 1
    }
  }

  // Sort by length descending (prefer longer matches), then by start
  matches.sort((a, b) => {
    const lenA = a.end - a.start
    const lenB = b.end - b.start
    if (lenB !== lenA) return lenB - lenA
    return a.start - b.start
  })
  const merged: { start: number; end: number; vi: string }[] = []
  for (const m of matches) {
    const overlap = merged.find((x) => m.start < x.end && m.end > x.start)
    if (!overlap) merged.push(m)
  }
  merged.sort((a, b) => a.start - b.start)

  // Build parts
  for (const m of merged) {
    if (m.start > lastIndex) {
      parts.push({ type: 'plain', text: text.slice(lastIndex, m.start) })
    }
    parts.push({ type: 'segment', text: text.slice(m.start, m.end), vi: m.vi })
    lastIndex = m.end
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'plain', text: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'plain', text }]
}

const STORAGE_KEY = 'nursed_phrase_translation_enabled'

export function getPhraseTranslationDefault(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'false') return false
  if (stored === 'true') return true
  return true
}

export function setPhraseTranslationEnabled(enabled: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }
}

export default function TranslatableTranscript({ text, segments, enabled: enabledProp }: Props) {
  const { phraseTranslationEnabled } = useLang()
  const enabled = enabledProp !== undefined ? enabledProp : phraseTranslationEnabled

  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const parts = useMemo(() => parseTextWithSegments(text, enabled ? segments ?? [] : []), [text, segments, enabled])
  const hasSegments = parts.some((p) => p.type === 'segment')

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>, vi: string) => {
      setHovered(vi)
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    setHovered(null)
    setTooltipPos(null)
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>, vi: string) => {
      e.preventDefault()
      setHovered((prev) => (prev === vi ? null : vi))
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
    },
    []
  )

  if (!hasSegments) {
    return <p className="text-sm text-text leading-relaxed">{text}</p>
  }

  return (
    <p className="text-sm text-text leading-relaxed relative">
      {parts.map((part, i) => {
        if (part.type === 'plain') {
          return <span key={i}>{part.text}</span>
        }
        return (
          <span
            key={i}
            onMouseEnter={(e) => handleMouseEnter(e, part.vi)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(e, part.vi)}
            className="cursor-help border-b border-dashed border-primary/50 hover:bg-primary/10 rounded px-0.5 transition-colors"
          >
            {part.text}
          </span>
        )
      })}
      {hovered && tooltipPos && (
        <span
          className="fixed z-50 px-2 py-1.5 text-xs font-medium bg-text text-bg rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 36,
            transform: 'translateX(-50%)',
          }}
        >
          {hovered}
        </span>
      )}
    </p>
  )
}
