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
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import type { NursedLessonStep } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  step: NursedLessonStep
  onComplete: () => void
}

const EXAMPLE_LINES: string[] = [
  'Nurse: Good morning. My name is Lan. How can I help you today?',
  'Patient: Good morning. I have a bad headache and feel dizzy.',
  'Nurse: I see. How long have you had these symptoms?',
  'Patient: Since yesterday evening.',
  'Nurse: Let me check your blood pressure and temperature first.',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Pool chip (draggable from word bank) ─────────────────────────────────────

interface PoolChipProps {
  id: string
  text: string
  ghost?: boolean
}

function PoolChip({ id, text, ghost }: PoolChipProps) {
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

// ─── Numbered slot (droppable target) ─────────────────────────────────────────

interface SlotProps {
  id: string
  slotNum: number
  value: string | null
  checked: boolean
  correct?: boolean
  onTap: () => void
}

function NumberedSlot({ id, slotNum, value, checked, correct, onTap }: SlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const shouldReduceMotion = useReducedMotion()

  let slotClass = ''
  if (checked) {
    slotClass = correct
      ? 'border-success bg-green-50'
      : 'border-error bg-red-50'
  } else if (value) {
    slotClass = isOver
      ? 'border-primary border-2 bg-primary/10'
      : 'border-primary bg-primary-light'
  } else {
    slotClass = isOver
      ? 'border-primary border-2 bg-primary/5 scale-105'
      : 'border-dashed border-2 border-border bg-surface'
  }

  return (
    <motion.div
      animate={
        checked
          ? correct
            ? shouldReduceMotion ? {} : { scale: [1, 1.04, 1] }
            : shouldReduceMotion ? {} : { x: [-4, 4, -4, 4, 0] }
          : {}
      }
      transition={{ duration: 0.35 }}
      className="flex items-center gap-3"
    >
      {/* Number badge */}
      <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
        {slotNum}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        onClick={onTap}
        className={`flex-1 min-h-[44px] flex items-center px-3 py-2 rounded-xl border transition-all cursor-pointer ${slotClass}`}
      >
        {value ? (
          <span className="text-sm font-medium text-text leading-snug flex-1">{value}</span>
        ) : (
          <span className="text-xs text-text-muted/50 italic flex-1">
            {isOver ? '↓' : ''}
          </span>
        )}
        {checked && correct && <CheckCircle size={16} className="ml-auto shrink-0 text-success" />}
        {checked && !correct && <XCircle size={16} className="ml-auto shrink-0 text-error" />}
      </div>
    </motion.div>
  )
}

// ─── Invisible droppable area over the word bank so chips can be dragged back ──

function BankDropArea() {
  const { setNodeRef } = useDroppable({ id: 'bank' })
  return <div ref={setNodeRef} className="absolute inset-0 pointer-events-none" />
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DragOrderStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const shouldReduceMotion = useReducedMotion()
  const correctLines = (step.config?.lines as string[] | undefined) ?? EXAMPLE_LINES

  const initialPool = useMemo(() => shuffle([...correctLines]), [])  // eslint-disable-line react-hooks/exhaustive-deps

  const [pool, setPool] = useState<string[]>(initialPool)
  const [placed, setPlaced] = useState<(string | null)[]>(Array(correctLines.length).fill(null))
  const activeChipRef = useRef<{ id: string; text: string } | null>(null)
  const [activeChipState, setActiveChipState] = useState<{ id: string; text: string } | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function getChipText(id: string): string {
    if (id.startsWith('pool-')) {
      const idx = Number(id.slice(5))
      return pool[idx] ?? ''
    }
    if (id.startsWith('slot-')) {
      const idx = Number(id.slice(5))
      return placed[idx] ?? ''
    }
    return ''
  }

  function onDragStart(e: DragStartEvent) {
    const id = e.active.id as string
    const chip = { id, text: getChipText(id) }
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
    const text = getChipText(srcId)
    if (!text) return

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
        next[dstIdx] = text
        return next
      })
      setPool((prev) => {
        let next = [...prev]
        if (isFromPool) {
          const srcIdx = Number(srcId.slice(5))
          next = next.filter((_, i) => i !== srcIdx)
        }
        if (displaced) next = [...next, displaced]
        return next
      })
    } else if (isToBank && isFromSlot) {
      const srcIdx = Number(srcId.slice(5))
      setPlaced((prev) => { const n = [...prev]; n[srcIdx] = null; return n })
      setPool((prev) => [...prev, text])
    }
  }

  // Tap pool chip → first empty slot (mobile-friendly)
  function tapPoolChip(text: string, poolIdx: number) {
    if (checked) return
    const emptySlot = placed.findIndex((p) => p === null)
    if (emptySlot === -1) return
    setPlaced((prev) => { const n = [...prev]; n[emptySlot] = text; return n })
    setPool((prev) => prev.filter((_, i) => i !== poolIdx))
  }

  // Tap slot → return chip to pool
  function tapSlot(slotIdx: number) {
    if (checked) return
    const text = placed[slotIdx]
    if (!text) return
    setPlaced((prev) => { const n = [...prev]; n[slotIdx] = null; return n })
    setPool((prev) => [...prev, text])
  }

  function handleCheck() {
    const res = correctLines.map((line, i) => placed[i] === line)
    setResults(res)
    setChecked(true)
  }

  function handleReset() {
    setPool(shuffle([...correctLines]))
    setPlaced(Array(correctLines.length).fill(null))
    setChecked(false)
    setResults([])
  }

  const score = results.filter(Boolean).length
  const total = correctLines.length
  const passed = score === total
  const allPlaced = placed.every((p) => p !== null)

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-text">
            ↕️ {step.title ?? t.dragOrderTitleFallback}
          </h3>
          <p className="text-sm text-text-muted mt-1">{t.dragOrderSubtitle}</p>
        </div>

        {/* Numbered slots */}
        <div className="space-y-2">
          {correctLines.map((_, i) => (
            <NumberedSlot
              key={i}
              id={`slot-${i}`}
              slotNum={i + 1}
              value={placed[i]}
              checked={checked}
              correct={checked ? results[i] : undefined}
              onTap={() => tapSlot(i)}
            />
          ))}
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
                  <span className="text-xs text-text-muted italic self-center">
                    {t.dragOrderSlotEmpty}
                  </span>
                ) : (
                  pool.map((text, i) => (
                    <span key={`${text}-${i}`} onClick={() => tapPoolChip(text, i)}>
                      <PoolChip
                        id={`pool-${i}`}
                        text={text}
                        ghost={activeChipState?.id === `pool-${i}`}
                      />
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Score banner */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              className={`card p-4 flex items-center gap-3 ${
                passed ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'
              }`}
            >
              <span className="text-2xl">{passed ? '🎉' : '💪'}</span>
              <div>
                <p className="font-semibold text-text">
                  {t.dragOrderScore
                    .replace('{correct}', String(score))
                    .replace('{total}', String(total))}
                </p>
                <p className="text-sm text-text-muted">
                  {passed ? t.scorePerfectDesc : t.scoreRetryDesc}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={!allPlaced}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {t.dragOrderCheckBtn}
            </button>
          ) : (
            <>
              <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={15} /> {t.btnRetry}
              </button>
              <button
                onClick={onComplete}
                className="btn-primary flex-1 justify-center flex items-center gap-2"
              >
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
