'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { CourseDraft } from '@/lib/supabase'

type DraftWithCategory = CourseDraft & {
  course_categories?: { id: string; name: string; slug: string } | null
}

const SIZE_LABEL: Record<string, string> = {
  starter: '3 modules',
  standard: '6 modules',
  full: '9 modules',
}

export default function StudioHomePage() {
  const { t } = useLang()
  const [drafts, setDrafts] = useState<DraftWithCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDrafts() {
      try {
        const res = await fetch('/api/studio/drafts')
        const json = await res.json()
        setDrafts(json.data ?? [])
      } finally {
        setLoading(false)
      }
    }
    loadDrafts()
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.studioTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.studioSubtitle}</p>
        </div>
        <Link href="/studio/new" className="btn-primary">
          <PlusCircle size={16} />
          {t.studioCreateCourse}
        </Link>
      </div>

      <section className="card p-5">
        <h2 className="mb-4">{t.studioDraftsTitle}</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-5">{t.studioNoDrafts}</p>
            <Link href="/studio/new" className="btn-primary">
              {t.studioCreateCourse}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {drafts.map((draft) => {
              const intake = draft.intake_form as Record<string, string>
              return (
                <div key={draft.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base">{intake.topic ?? 'Untitled course'}</h3>
                      <span className="badge-blue">{SIZE_LABEL[draft.course_size]}</span>
                      <span className="badge-gray">{draft.status}</span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      {intake.profession} · {draft.course_categories?.name ?? intake.industry}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {draft.template_id.replaceAll('_', ' ')} · v{draft.template_version}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {new Date(draft.updated_at).toLocaleDateString()}
                    </span>
                    {draft.status === 'complete' && draft.course_id ? (
                      <Link href={`/studio/${draft.course_id}`} className="btn-primary text-sm px-3 py-1">
                        View Course
                      </Link>
                    ) : (
                      <Link href={`/studio/new?draftId=${draft.id}`} className="btn-secondary text-sm px-3 py-1">
                        Continue
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
