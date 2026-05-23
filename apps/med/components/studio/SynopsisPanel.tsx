'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, FileText, Headphones, Video } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { CourseSynopsis, LessonSynopsis, ModuleSynopsis } from '@/lib/studio/types'

interface SynopsisPanelProps {
  synopsis: Partial<CourseSynopsis> | null
  isStreaming?: boolean
}

export function SynopsisPanel({ synopsis, isStreaming = false }: SynopsisPanelProps) {
  const { t } = useLang()
  const modules = useMemo(() => synopsis?.modules ?? [], [synopsis?.modules])
  const [openModuleIndex, setOpenModuleIndex] = useState(0)
  const [selectedLessonKey, setSelectedLessonKey] = useState('1-1')

  useEffect(() => {
    if (!modules.length) return
    const module = modules[openModuleIndex] ?? modules[0]
    const lesson = module?.lessons?.[0]
    if (module && lesson) setSelectedLessonKey(`${module.orderIndex}-${lesson.orderIndex}`)
  }, [modules.length, openModuleIndex])

  const selectedLesson = useMemo(() => {
    for (const module of modules) {
      const lesson = module.lessons?.find(
        (item) => `${module.orderIndex}-${item.orderIndex}` === selectedLessonKey,
      )
      if (lesson) return { module, lesson }
    }
    return null
  }, [modules, selectedLessonKey])

  if (!synopsis && isStreaming) {
    return <SynopsisSkeleton />
  }

  if (!synopsis) {
    return (
      <div className="card p-6 text-center text-text-muted">
        {t.studioSynopsisEmpty}
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-5">
      <section className="card overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                {t.studioSynopsisTitle}
              </p>
              <h2 className="mt-1">{synopsis.courseTitle ?? t.studioSynopsisGenerating}</h2>
              {synopsis.courseDescription && (
                <p className="text-sm text-text-muted mt-2">{synopsis.courseDescription}</p>
              )}
            </div>
            {isStreaming && <span className="badge-blue animate-pulse">{t.studioSynopsisStreaming}</span>}
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            {synopsis.level && <span className="badge-green">{synopsis.level}</span>}
            {synopsis.templateId && (
              <span className="badge-gray">{synopsis.templateId.replaceAll('_', ' ')}</span>
            )}
            {synopsis.totalModules && (
              <span className="badge-purple">
                {t.studioSynopsisModules.replace('{n}', String(synopsis.totalModules))}
              </span>
            )}
          </div>
        </div>

        {modules.length === 0 ? (
          <SynopsisSkeletonRows />
        ) : (
          <div className="divide-y divide-border">
            {modules.map((module, index) => (
              <ModuleAccordion
                key={module.orderIndex ?? index}
                module={module}
                isOpen={openModuleIndex === index}
                selectedLessonKey={selectedLessonKey}
                onToggle={() => setOpenModuleIndex(openModuleIndex === index ? -1 : index)}
                onSelectLesson={(lesson) => setSelectedLessonKey(`${module.orderIndex}-${lesson.orderIndex}`)}
              />
            ))}
            {isStreaming && <SynopsisSkeletonRows compact />}
          </div>
        )}
      </section>

      <section className="card p-5 min-h-[420px]">
        {selectedLesson ? (
          <LessonDetail module={selectedLesson.module} lesson={selectedLesson.lesson} />
        ) : (
          <SynopsisSkeletonRows />
        )}
      </section>
    </div>
  )
}

function ModuleAccordion({
  module,
  isOpen,
  selectedLessonKey,
  onToggle,
  onSelectLesson,
}: {
  module: ModuleSynopsis
  isOpen: boolean
  selectedLessonKey: string
  onToggle: () => void
  onSelectLesson: (lesson: LessonSynopsis) => void
}) {
  const { t } = useLang()

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-start justify-between gap-4 text-left hover:bg-surface transition-colors"
      >
        <div>
          <p className="text-xs text-text-muted">
            {t.studioSynopsisModuleLabel.replace('{n}', String(module.orderIndex))}
          </p>
          <h3 className="text-base mt-1">{module.title}</h3>
          <p className="text-xs text-text-muted mt-1">{module.rationale}</p>
        </div>
        <ChevronDown
          size={18}
          className={`text-text-muted shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4 space-y-2">
          {module.lessons?.map((lesson) => {
            const lessonKey = `${module.orderIndex}-${lesson.orderIndex}`
            return (
              <button
                key={lessonKey}
                type="button"
                onClick={() => onSelectLesson(lesson)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  selectedLessonKey === lessonKey
                    ? 'border-primary bg-primary-light'
                    : 'border-border hover:bg-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {t.studioSynopsisLessonLabel.replace('{n}', String(lesson.orderIndex))}: {lesson.title}
                  </span>
                  <span className="badge-gray">{lesson.stage?.replaceAll('_', ' ') ?? '…'}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LessonDetail({ module, lesson }: { module: ModuleSynopsis; lesson: LessonSynopsis }) {
  const { t } = useLang()

  return (
    <div>
      <p className="text-xs text-text-muted">
        {t.studioSynopsisModuleLabel.replace('{n}', String(module.orderIndex))} ·{' '}
        {t.studioSynopsisLessonLabel.replace('{n}', String(lesson.orderIndex))}
      </p>
      <h2 className="mt-1">{lesson.title}</h2>
      <p className="text-sm text-text-muted mt-3">{lesson.objective}</p>

      <div className="mt-5">
        <h3 className="text-sm mb-3">{t.studioSynopsisKeyPhrases}</h3>
        <div className="flex flex-wrap gap-2">
          {lesson.keyPhrases?.map((phrase) => (
            <span key={phrase} className="badge-blue">
              {phrase}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-surface border border-border p-4">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <FileText size={16} className="text-primary" />
          {t.studioSynopsisScenario}
        </div>
        <p className="text-sm text-text-muted">{lesson.scenarioContext}</p>
      </div>

      {lesson.videoScript && (
        <ScriptPreview
          icon={<Video size={16} className="text-primary" />}
          title={t.studioSynopsisVideoScript}
          script={lesson.videoScript}
        />
      )}
      {lesson.audioScript && (
        <ScriptPreview
          icon={<Headphones size={16} className="text-primary" />}
          title={t.studioSynopsisAudioScript}
          script={lesson.audioScript}
        />
      )}
    </div>
  )
}

function ScriptPreview({ icon, title, script }: { icon: React.ReactNode; title: string; script: string }) {
  return (
    <div className="mt-4 rounded-xl bg-bg border border-border p-4">
      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
        {icon}
        {title}
      </div>
      <p className="text-sm text-text-muted whitespace-pre-wrap">{script}</p>
    </div>
  )
}

function SynopsisSkeleton() {
  return (
    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-5">
      <section className="card p-5">
        <SynopsisSkeletonRows />
      </section>
      <section className="card p-5">
        <SynopsisSkeletonRows />
      </section>
    </div>
  )
}

function SynopsisSkeletonRows({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'p-5 space-y-3' : 'space-y-3'}>
      {Array.from({ length: compact ? 2 : 5 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border p-4">
          <div className="h-3 w-24 rounded bg-surface animate-pulse" />
          <div className="h-5 w-2/3 rounded bg-surface animate-pulse mt-3" />
          <div className="h-3 w-full rounded bg-surface animate-pulse mt-3" />
          <div className="h-3 w-3/4 rounded bg-surface animate-pulse mt-2" />
        </div>
      ))}
    </div>
  )
}
