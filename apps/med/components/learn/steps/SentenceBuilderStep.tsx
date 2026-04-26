'use client'

import { useState, useMemo, useRef } from 'react'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Volume2 } from 'lucide-react'
import type { NursedLessonStep, SentenceBuilderConfig } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Pool chip (draggable) ────────────────────────────────────────────────────

function PoolChip({ id, text, ghost }: { id: string; text: string; ghost?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined

  return (
    <span
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`inline-flex items-center justify-center px-3 py-2 rounded-2xl border border-primary/40 bg-primary-light text-primary text-sm font-medium select-none cursor-grab active:cursor-grabbing touch-none shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[44px] ${
        isDragging || ghost ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {text}
    </span>
  )
}

function OverlayChip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center justify-center px-3 py-2 rounded-2xl border-2 border-primary bg-primary text-white text-sm font-medium shadow-lg select-none cursor-grabbing rotate-2 min-h-[44px]">
      {text}
    </span>
  )
}

// ─── Slot (droppable target) ──────────────────────────────────────────────────

interface SlotProps {
  id: string
  slotNum: number
  value: string | null
  checked: boolean
  correct?: boolean
  onTap: () => void
  totalSlots: number
}

function Slot({ id, slotNum, value, checked, correct, onTap, totalSlots }: SlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const shouldReduceMotion = useReducedMotion()

  let slotClass = ''
  if (checked) {
    slotClass = correct ? 'border-success bg-green-50' : 'border-warning bg-orange-50'
  } else if (value) {
    slotClass = isOver ? 'border-primary border-2 bg-primary/10' : 'border-primary bg-primary-light'
  } else {
    slotClass = isOver ? 'border-primary border-2 bg-primary/5 scale-105' : 'border-dashed border-2 border-border bg-surface'
  }

  const widthClass = totalSlots <= 4 ? 'flex-1' : 'min-w-[80px] flex-shrink-0'

  return (
    <motion.div
      animate={
        checked
          ? correct
            ? shouldReduceMotion ? {} : { scale: [1, 1.04, 1] }
            : shouldReduceMotion ? {} : { x: [-3, 3, -3, 3, 0] }
          : {}
      }
      transition={{ duration: 0.35 }}
      className={`flex flex-col items-center gap-1 ${widthClass}`}
    >
      <span className="text-[10px] font-semibold text-text-muted tabular-nums">{slotNum}</span>
      <div
        ref={setNodeRef}
        onClick={onTap}
        aria-label={`Slot ${slotNum} of ${totalSlots}`}
        className={`w-full min-h-[44px] flex items-center justify-center px-2 py-1 rounded-xl border transition-all cursor-pointer text-center ${slotClass}`}
      >
        {value ? (
          <span className="text-xs font-medium text-text leading-snug">{value}</span>
        ) : (
          <span className="text-border/50 text-base">—</span>
        )}
        {checked && correct && <CheckCircle size={12} className="ml-1 shrink-0 text-success" />}
        {checked && !correct && <XCircle size={12} className="ml-1 shrink-0 text-warning" />}
      </div>
    </motion.div>
  )
}

function BankDropArea() {
  const { setNodeRef } = useDroppable({ id: 'bank' })
  return <div ref={setNodeRef} className="absolute inset-0 pointer-events-none" />
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SentenceBuilderStep({ step, onComplete }: Props) {
  const { t, lang } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const cfg = (step.config ?? {}) as Partial<SentenceBuilderConfig>

  const chunks = cfg.chunks ?? []
  const correctOrder = cfg.correct_order ?? chunks.map((_, i) => i)
  const promptVi = cfg.prompt_vi ?? ''
  const promptEnContext = cfg.prompt_en
  const audioUrl = cfg.audio_url
  const hintEn = cfg.hint_en
  const hintVi = cfg.hint_vi
  const isVi = lang === 'vi'
  const hint = isVi ? hintVi || hintEn : hintEn

  // Deterministic shuffle seeded from step.id
  const seed = useMemo(() => hashStr(step.id), [step.id])
  const initialPool = useMemo(() => deterministicShuffle(chunks.map((_, i) => i), seed), []) // eslint-disable-line react-hooks/exhaustive-deps

  const [pool, setPool] = useState<number[]>(initialPool)
  const [placed, setPlaced] = useState<(number | null)[]>(Array(chunks.length).fill(null))
  const activeChipRef = useRef<{ id: string; text: string } | null>(null)
  const [activeChipState, setActiveChipState] = useState<{ id: string; text: string } | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [showHint, setShowHint] = useState(false)
  const [hintShown, setHintShown] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function getChipInfo(id: string): { chunkIdx: number; text: string } | null {
    if (id.startsWith('pool-')) {
      const poolPos = Number(id.slice(5))
      const chunkIdx = pool[poolPos]
      return chunkIdx !== undefined ? { chunkIdx, text: chunks[chunkIdx] ?? '' } : null
    }
    if (id.startsWith('slot-')) {
      const slotIdx = Number(id.slice(5))
      const chunkIdx = placed[slotIdx]
      return chunkIdx !== null && chunkIdx !== undefined ? { chunkIdx, text: chunks[chunkIdx] ?? '' } : null
    }
    return null
  }

  function onDragStart(e: DragStartEvent) {
    const info = getChipInfo(e.active.id as string)
    if (!info) return
    const chip = { id: e.active.id as string, text: info.text }
    activeChipRef.current = chip
    setActiveChipState(chip)
  }

  function onDragEnd(e: DragEndEvent) {
    activeChipRef.current = null
    setActiveChipState(null)
    const { active, over } = e
    if (!over) return

    const srcId = active.id as string
    const dstId = over.id as string
    const srcInfo = getChipInfo(srcId)
    if (!srcInfo) return

    const isFromPool = srcId.startsWith('pool-')
    const isFromSlot = srcId.startsWith('slot-')
    const isToSlot = dstId.startsWith('slot-')
    const isToBank = dstId === 'bank'

    if (isToSlot) {
      const dstIdx = Number(dstId.slice(5))
      const displaced = placed[dstIdx]
      setPlaced((prev) => {
        const next = [...prev]
        if (isFromSlot) {
          const srcIdx = Number(srcId.slice(5))
          next[srcIdx] = displaced ?? null
        }
        next[dstIdx] = srcInfo.chunkIdx
        return next
      })
      setPool((prev) => {
        let next = [...prev]
        if (isFromPool) {
          const poolPos = Number(srcId.slice(5))
          next = next.filter((_, i) => i !== poolPos)
        }
        if (displaced !== null && displaced !== undefined) next = [...next, displaced]
        return next
      })
    } else if (isToBank && isFromSlot) {
      const srcIdx = Number(srcId.slice(5))
      setPlaced((prev) => { const n = [...prev]; n[srcIdx] = null; return n })
      setPool((prev) => [...prev, srcInfo.chunkIdx])
    }
  }

  function tapPoolChip(chunkIdx: number, poolPos: number) {
    if (checked) return
    const emptySlot = placed.findIndex((p) => p === null)
    if (emptySlot === -1) return
    setPlaced((prev) => { const n = [...prev]; n[emptySlot] = chunkIdx; return n })
    setPool((prev) => prev.filter((_, i) => i !== poolPos))
  }

  function tapSlot(slotIdx: number) {
    if (checked) return
    const chunkIdx = placed[slotIdx]
    if (chunkIdx === null || chunkIdx === undefined) return
    setPlaced((prev) => { const n = [...prev]; n[slotIdx] = null; return n })
    setPool((prev) => [...prev, chunkIdx])
  }

  function handleCheck() {
    const res = placed.map((chunkIdx, slotIdx) => chunkIdx === correctOrder[slotIdx])
    const allCorrect = res.every(Boolean)
    setResults(res)
    setChecked(true)
    if (!allCorrect && hint && !hintShown) {
      setShowHint(true)
      setHintShown(true)
    }
  }

  function handleReset() {
    setPool(deterministicShuffle(chunks.map((_, i) => i), seed + 1))
    setPlaced(Array(chunks.length).fill(null))
    setChecked(false)
    setResults([])
    setShowHint(false)
  }

  const allPlaced = placed.every((p) => p !== null)
  const score = results.filter(Boolean).length
  const passed = score === chunks.length

  const canonicalSentence = correctOrder.map((i) => chunks[i] ?? '').join(' ')

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="space-y-5">
        {/* Header */}
        <h3 className="text-base font-semibold text-text">{t.stepTypeSentenceBuilder}</h3>

        {/* Instruction + prompt card */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            {isVi ? t.sentenceBuilderInstructionEn : t.sentenceBuilderInstructionEn}
          </p>
          {promptEnContext && (
            <p className="text-xs text-text-muted italic">{promptEnContext}</p>
          )}
          <div className="card bg-primary/5 border-primary/20 p-4 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary leading-relaxed">{promptVi}</p>
            </div>
            {audioUrl && (
              <button
                onClick={() => { const a = new Audio(audioUrl); a.play() }}
                className="shrink-0 w-9 h-9 rounded-full border border-primary/30 bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Play audio"
              >
                <Volume2 size={16} className="text-primary" />
              </button>
            )}
          </div>
        </div>

        {/* Hint toast */}
        <AnimatePresence>
          {showHint && hint && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 flex items-center justify-between gap-3"
            >
              <p className="text-xs text-yellow-800 font-medium">💡 {hint}</p>
              <button onClick={() => setShowHint(false)} className="text-yellow-500 text-xs hover:underline shrink-0">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slots */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Slots</p>
          <div className={`flex gap-2 ${chunks.length > 5 ? 'flex-wrap' : ''}`}>
            {placed.map((chunkIdx, i) => (
              <Slot
                key={i}
                id={`slot-${i}`}
                slotNum={i + 1}
                value={chunkIdx !== null && chunkIdx !== undefined ? chunks[chunkIdx] ?? null : null}
                checked={checked}
                correct={checked ? results[i] : undefined}
                onTap={() => tapSlot(i)}
                totalSlots={chunks.length}
              />
            ))}
          </div>
        </div>

        {/* Word pool */}
        {!checked && (
          <div className="relative">
            <BankDropArea />
            <div className="rounded-xl border-2 border-dashed border-border bg-surface p-3 space-y-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                {t.dragOrderPoolLabel}
              </p>
              <div className="flex flex-wrap gap-2 min-h-[44px] items-start">
                {pool.length === 0 ? (
                  <span className="text-xs text-text-muted italic self-center">{t.dragOrderSlotEmpty}</span>
                ) : (
                  pool.map((chunkIdx, poolPos) => (
                    <span key={`${chunkIdx}-${poolPos}`} onClick={() => tapPoolChip(chunkIdx, poolPos)}>
                      <PoolChip
                        id={`pool-${poolPos}`}
                        text={chunks[chunkIdx] ?? ''}
                        ghost={activeChipState?.id === `pool-${poolPos}`}
                      />
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Canonical answer on reveal */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              className={`card p-4 space-y-2 ${passed ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{passed ? '🎉' : '💡'}</span>
                <p className="font-semibold text-sm text-text">
                  {passed ? t.scorePerfectDesc : t.scoreRetryDesc}
                </p>
              </div>
              {!passed && (
                <div>
                  <p className="text-xs text-text-muted mb-1">{t.sentenceBuilderCorrectAnswerLabel}</p>
                  <p className="text-sm font-medium text-text">{canonicalSentence}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={!allPlaced}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              {t.sentenceBuilderCheckBtn}
            </button>
          ) : (
            <>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={15} /> {t.sentenceBuilderTryAgainBtn}
              </button>
              <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
                {t.btnNext} <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeChipState && <OverlayChip text={activeChipState.text} />}
      </DragOverlay>
    </DndContext>
  )
}
