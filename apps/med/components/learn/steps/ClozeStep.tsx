'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import AudioReplayBar from '@/components/learn/AudioReplayBar'

interface ClozeToken {
  text: string
  isBlank: boolean
  answer?: string
}

interface Props {
  step: NursedLessonStep
  onComplete: () => void
  contextAudio?: { url: string; transcript: string }
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

/** New format: [word] = blank where "word" is the correct answer */
function parseBracketFormat(text: string): ClozeToken[] {
  const parts = text.split(/(\[[^\]]+\])/)
  return parts.map((part) => {
    const match = part.match(/^\[(.+)\]$/)
    if (match) return { text: '', isBlank: true, answer: match[1] }
    return { text: part, isBlank: false }
  })
}

/** Old format: ___ = blank, answers reconstructed by aligning positions with full script.
 *  Splits directly on _{2,} so punctuation attached to blanks (___, ___. ___?) all work. */
function parseUnderscoreFormat(cloze: string, script: string): ClozeToken[] {
  const parts = cloze.split(/(_{2,})/)
  const scriptWords = script.split(/\s+/)

  let scriptPos = 0
  const tokens: ClozeToken[] = []

  for (const part of parts) {
    if (/^_{2,}$/.test(part)) {
      const raw = scriptWords[scriptPos] ?? ''
      const answer = raw.replace(/^[^a-zA-Z0-9\u00C0-\u024F]+|[^a-zA-Z0-9\u00C0-\u024F]+$/g, '') || raw
      scriptPos++
      tokens.push({ text: '', isBlank: true, answer })
    } else if (part) {
      const wordCount = (part.match(/\S+/g) ?? []).length
      scriptPos += wordCount
      tokens.push({ text: part, isBlank: false })
    }
  }
  return tokens
}

function parseClozeTokens(clozeText: string, script?: string): ClozeToken[] {
  if (clozeText.includes('[') && /\[[^\]]+\]/.test(clozeText)) {
    return parseBracketFormat(clozeText)
  }
  if (clozeText.includes('___') && script) {
    return parseUnderscoreFormat(clozeText, script)
  }
  return [{ text: clozeText, isBlank: false }]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickDecoys(blanks: ClozeToken[], script: string, count: number): string[] {
  const answers = new Set(blanks.map((b) => (b.answer ?? '').toLowerCase()))
  const candidates = [...new Set(
    script
      .split(/\s+/)
      .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, ''))
      .filter((w) => w.length > 2 && !answers.has(w.toLowerCase()))
  )]
  return shuffle(candidates).slice(0, count)
}

// ─── DnD primitive components ─────────────────────────────────────────────────

interface ChipProps {
  id: string
  label: string
  ghost?: boolean
}

function DraggableChip({ id, label, ghost }: ChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined

  return (
    <span
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`inline-flex items-center justify-center px-3 py-2 rounded-2xl border border-primary/40 bg-primary-light text-primary text-sm font-medium select-none cursor-grab active:cursor-grabbing touch-none shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[44px] min-w-[44px] ${
        isDragging || ghost ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {label}
    </span>
  )
}

function OverlayChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center px-3 py-2 rounded-2xl border-2 border-primary bg-primary text-white text-sm font-medium shadow-lg select-none cursor-grabbing rotate-2 min-h-[44px]">
      {label}
    </span>
  )
}

interface SlotProps {
  id: string
  value: string | null
  checked: boolean
  correct?: boolean
  expectedAnswer?: string
}

function DroppableSlot({ id, value, checked, correct, expectedAnswer }: SlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const baseClass = 'inline-flex items-center min-w-[5rem] px-2.5 py-1 mx-1 rounded-xl border text-sm font-medium align-middle transition-all duration-150'

  let colorClass: string
  if (checked) {
    colorClass = correct
      ? 'border-success bg-green-50 text-success cursor-default'
      : 'border-error bg-red-50 text-error cursor-default'
  } else if (value) {
    colorClass = isOver
      ? 'border-primary border-2 bg-primary/20 text-primary scale-105'
      : 'border-primary bg-primary-light text-primary cursor-grab active:cursor-grabbing shadow-sm'
  } else {
    colorClass = isOver
      ? 'border-primary border-2 bg-primary/10 scale-105'
      : 'border-dashed border-2 border-border text-transparent'
  }

  return (
    <span ref={setNodeRef} className={`${baseClass} ${colorClass}`}>
      {value ?? '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
      {checked && correct && <CheckCircle size={13} className="ml-1 shrink-0 text-success" />}
      {checked && !correct && (
        <>
          <XCircle size={13} className="ml-1 shrink-0 text-error" />
          {expectedAnswer && (
            <span className="ml-1 text-xs text-success font-semibold">({expectedAnswer})</span>
          )}
        </>
      )}
    </span>
  )
}

// ─── Main Word Bank Cloze (DnD) ───────────────────────────────────────────────

interface WordBankProps {
  tokens: ClozeToken[]
  script: string
  step: NursedLessonStep
  onComplete: () => void
  contextAudio?: { url: string; transcript: string }
}

function WordBankCloze({ tokens, script, step, onComplete, contextAudio }: WordBankProps) {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()

  const blanks = useMemo(() => tokens.filter((tk) => tk.isBlank), [tokens])
  const blankCount = blanks.length

  const chipPool = useMemo(() => {
    const answers = blanks.map((b) => b.answer ?? '').filter(Boolean)
    const configDecoys = (step.config?.decoys as string[] | undefined) ?? []
    const autoDecoys = configDecoys.length === 0 ? pickDecoys(blanks, script, Math.max(3, blankCount)) : configDecoys
    return shuffle([...answers, ...autoDecoys])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [placed, setPlaced] = useState<(string | null)[]>(Array(blankCount).fill(null))
  const [bank, setBank] = useState<string[]>(chipPool)
  const [activeChip, setActiveChip] = useState<{ id: string; label: string } | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<number, boolean>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  )

  function onDragStart(e: DragStartEvent) {
    const id = e.active.id as string
    const label = id.startsWith('bank-') ? id.slice(5) : id.startsWith('slot-') ? (placed[Number(id.slice(5))] ?? '') : ''
    setActiveChip({ id, label })
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveChip(null)
    const { active, over } = e
    if (!over) return

    const srcId = active.id as string
    const dstId = over.id as string

    const isFromBank = srcId.startsWith('bank-')
    const isFromSlot = srcId.startsWith('slot-')
    const isToSlot = dstId.startsWith('slot-')
    const isToBank = dstId === 'bank-area'

    const chip = isFromBank
      ? bank.find((_, i) => `bank-${bank[i]}-${i}` === srcId) ?? srcId.slice(5).split('-')[0]
      : isFromSlot
      ? placed[Number(srcId.slice(5))] ?? ''
      : ''

    if (!chip) return

    if (isToSlot) {
      const slotIdx = Number(dstId.slice(5))
      const displaced = placed[slotIdx]

      setPlaced((prev) => {
        const next = [...prev]
        if (isFromSlot) {
          const fromIdx = Number(srcId.slice(5))
          next[fromIdx] = displaced ?? null
        }
        next[slotIdx] = chip
        return next
      })

      setBank((prev) => {
        let next = [...prev]
        if (isFromBank) {
          const parts = srcId.split('-')
          const bankIdx = Number(parts[parts.length - 1])
          next = next.filter((_, i) => i !== bankIdx)
        }
        if (displaced) next = [...next, displaced]
        return next
      })
    } else if (isToBank && isFromSlot) {
      const slotIdx = Number(srcId.slice(5))
      setPlaced((prev) => { const n = [...prev]; n[slotIdx] = null; return n })
      setBank((prev) => [...prev, chip])
    }
  }

  function tapChip(chip: string, bankIdx: number) {
    const emptyIdx = placed.findIndex((p) => p === null)
    if (emptyIdx === -1) return
    setPlaced((prev) => { const n = [...prev]; n[emptyIdx] = chip; return n })
    setBank((prev) => prev.filter((_, i) => i !== bankIdx))
  }

  function tapSlot(slotIdx: number) {
    const chip = placed[slotIdx]
    if (!chip || checked) return
    setPlaced((prev) => { const n = [...prev]; n[slotIdx] = null; return n })
    setBank((prev) => [...prev, chip])
  }

  function handleCheck() {
    const res: Record<number, boolean> = {}
    blanks.forEach((token, bi) => {
      res[bi] = (placed[bi] ?? '').trim().toLowerCase() === (token.answer ?? '').trim().toLowerCase()
    })
    setResults(res)
    setChecked(true)
  }

  function handleReset() {
    setPlaced(Array(blankCount).fill(null))
    setBank(chipPool)
    setChecked(false)
    setResults({})
  }

  const allFilled = placed.every((p) => p !== null)
  const score = Object.values(results).filter(Boolean).length
  const passed = score === blankCount

  let bi = 0

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="space-y-5">
        {contextAudio?.url && (
          <AudioReplayBar
            audioUrl={contextAudio.url}
            transcript={contextAudio.transcript}
            label={t.clozeSubtitle}
          />
        )}

        <div>
          <h3 className="text-base font-semibold text-text">✏️ {step.title ?? t.clozeTitleFallback}</h3>
          <p className="text-sm text-text-muted mt-1">{t.clozeSubtitle}</p>
        </div>

        {/* Word bank */}
        {!checked && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              {t.clozeWordBankLabel}
            </p>
            <div
              id="bank-area"
              className="min-h-[3.5rem] p-3 rounded-xl border-2 border-dashed border-border bg-gradient-to-b from-surface to-bg flex flex-wrap gap-2 items-center"
            >
              {bank.length === 0 ? (
                <span className="text-xs text-text-muted italic">{t.clozeWordBankEmpty}</span>
              ) : (
                bank.map((chip, i) => (
                  <span key={`${chip}-${i}`} onClick={() => tapChip(chip, i)}>
                    <DraggableChip
                      id={`bank-${chip}-${i}`}
                      label={chip}
                      ghost={activeChip?.id === `bank-${chip}-${i}`}
                    />
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bank droppable area (for returning chips from slots) */}
        <BankDropArea />

        {/* Cloze text with droppable slots */}
        <div className="card p-5 bg-surface">
          <p className="text-sm leading-loose text-text">
            {tokens.map((token, idx) => {
              if (!token.isBlank) return <span key={idx}>{token.text}</span>
              const currentBi = bi++
              return (
                <span
                  key={idx}
                  onClick={() => tapSlot(currentBi)}
                  className="cursor-pointer"
                >
                  <DroppableSlot
                    id={`slot-${currentBi}`}
                    value={placed[currentBi]}
                    checked={checked}
                    correct={results[currentBi]}
                    expectedAnswer={checked && !results[currentBi] ? blanks[currentBi]?.answer : undefined}
                  />
                </span>
              )
            })}
          </p>
        </div>

        {/* Score with framer-motion celebration */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : passed
                  ? { opacity: 1, y: 0, scale: [1, 1.04, 1] }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.4 }}
              className={`card p-4 flex items-center gap-3 ${
                passed ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'
              }`}
            >
              <span className="text-2xl">{passed ? '🎉' : '💪'}</span>
              <div>
                <p className="font-semibold text-text">
                  {t.clozeScoreLabel
                    .replace('{score}', String(score))
                    .replace('{total}', String(blankCount))}
                </p>
                <p className="text-sm text-text-muted">
                  {passed ? t.scorePerfectDesc : t.scoreRetryDesc}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={!allFilled}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {t.btnCheck}
            </button>
          ) : (
            <>
              <button onClick={handleReset} className="btn-secondary flex-1 justify-center">
                {t.btnRetry}
              </button>
              <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
                {t.btnNextCloze} <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeChip && <OverlayChip label={activeChip.label} />}
      </DragOverlay>
    </DndContext>
  )
}

/** Invisible droppable zone overlapping the word bank div so chips can be dragged back */
function BankDropArea() {
  const { setNodeRef } = useDroppable({ id: 'bank-area' })
  return <div ref={setNodeRef} className="absolute inset-0 pointer-events-none" />
}

const EXAMPLE_TEXT = "Hello, I'm [Nurse Lan]. How can I [help] you today? Please take a [seat] and I'll be right with you."

// ─── Root export ─────────────────────────────────────────────────────────────

export default function ClozeStep({ step, onComplete, contextAudio }: Props) {
  const script = (step.config?.script ?? '') as string
  const rawText = (step.config?.clozeText ?? step.config?.cloze) as string | undefined
  const tokens = parseClozeTokens(rawText ?? EXAMPLE_TEXT, script)

  return (
    <WordBankCloze
      tokens={tokens}
      script={script}
      step={step}
      onComplete={onComplete}
      contextAudio={contextAudio}
    />
  )
}
