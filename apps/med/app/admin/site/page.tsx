'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Globe, Loader2 } from 'lucide-react'
import HomepageVideoUploader from '@/components/admin/HomepageVideoUploader'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'

export default function AdminSiteSettingsPage() {
  useDocumentTitle('Admin · Site')
  const [introVideoUrl, setIntroVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/site-settings/homepage')
      .then(r => r.json())
      .then(j => setIntroVideoUrl(j.data?.intro_video_url ?? null))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text mb-2">
            <ArrowLeft size={14} /> Admin
          </Link>
          <h1 className="flex items-center gap-2"><Globe size={20} /> Site settings</h1>
          <p className="text-sm text-text-muted mt-1">Manage public-facing homepage content.</p>
        </div>
      </div>

      <div className="card p-6 max-w-2xl">
        <h2 className="text-base font-semibold mb-1">Homepage intro video</h2>
        <p className="text-sm text-text-muted mb-5">
          Upload the welcome video that introduces tuto. Pro to first-time visitors on the landing page.
          Replace it any time — the change is instant.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-text-muted py-8">
            <Loader2 size={16} className="animate-spin" /> Loading current settings…
          </div>
        ) : (
          <HomepageVideoUploader
            initialVideoUrl={introVideoUrl}
            onChange={(url) => setIntroVideoUrl(url)}
          />
        )}
      </div>
    </div>
  )
}
