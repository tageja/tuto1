'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, GripVertical, ChevronRight, RotateCcw } from 'lucide-react'
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

interface SortableItemProps {
  id: string
  text: string
  result?: boolean
  checked: boolean
}

function SortableItem({ id, text, result, checked }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  }

  let borderClass = 'border-border bg-surface'
  if (checked) {
    borderClass = result === true
      ? 'border-success bg-green-50'
      : 'border-error bg-red-50'
  }
  if (isDragging) borderClass += ' shadow-lg'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm text-text transition-colors ${borderClass}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-text-muted hover:text-text cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <span className="flex-1 leading-snug">{text}</span>

      {checked && result === true && <CheckCircle size={16} className="flex-shrink-0 text-success" />}
      {checked && result === false && <XCircle size={16} className="flex-shrink-0 text-error" />}
    </div>
  )
}

export default function DragOrderStep({ step, onComplete }: Props) {
  const { t } = useLang()
  const correctLines = (step.config?.lines as string[] | undefined) ?? EXAMPLE_LINES

  // Stable shuffled initial order — useMemo so it doesn't re-shuffle on re-render
  const initialItems = useMemo(
    () => shuffle(correctLines.map((line, i) => ({ id: String(i), text: line, correctIdx: i }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [items, setItems] = useState(initialItems)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIdx = prev.findIndex((i) => i.id === active.id)
        const newIdx = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, oldIdx, newIdx)
      })
    }
  }

  function handleCheck() {
    const res = items.map((item, pos) => correctLines[pos] === item.text)
    setResults(res)
    setChecked(true)
  }

  function handleReset() {
    setItems(shuffle([...initialItems]))
    setChecked(false)
    setResults([])
  }

  const score = results.filter(Boolean).length
  const total = correctLines.length
  const passed = score === total

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-text">
          ↕️ {step.title ?? t.dragOrderTitleFallback}
        </h3>
        <p className="text-sm text-text-muted mt-1">{t.dragOrderSubtitle}</p>
      </div>

      {/* Sortable list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, pos) => (
              <SortableItem
                key={item.id}
                id={item.id}
                text={item.text}
                result={checked ? results[pos] : undefined}
                checked={checked}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Score banner */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card p-4 flex items-center gap-3 ${passed ? 'bg-green-50 border-success' : 'bg-orange-50 border-warning'}`}
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
          <button onClick={handleCheck} className="btn-primary flex-1 justify-center">
            {t.dragOrderCheckBtn}
          </button>
        ) : (
          <>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <RotateCcw size={15} /> {t.btnRetry}
            </button>
            <button onClick={onComplete} className="btn-primary flex-1 justify-center flex items-center gap-2">
              {t.btnNext} <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
