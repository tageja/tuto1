'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, ToggleLeft, ToggleRight, Save, Loader2, ImageIcon } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface SurveySettings {
  voucher_image_url: string | null
  voucher_title: string | null
  is_active: boolean
}

interface Props {
  initial: SurveySettings
  onSaved: (updated: SurveySettings) => void
}

export default function SurveyVoucherUploader({ initial, onSaved }: Props) {
  const { t } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState<SurveySettings>(initial)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    setUploadProgress(10)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      const urlRes = await fetch(`/api/site-settings/survey-hcmute/upload-url?ext=${ext}`)
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { signedUrl, publicUrl } = await urlRes.json()

      setUploadProgress(30)
      const putRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!putRes.ok) throw new Error('Upload failed')

      setUploadProgress(90)
      const cacheBusted = `${publicUrl}?t=${Date.now()}`
      setSettings((prev) => ({ ...prev, voucher_image_url: cacheBusted }))
      setUploadProgress(100)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/site-settings/survey-hcmute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('Failed to save')
      const json = await res.json()
      onSaved(json.data)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Voucher image */}
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
          {t.surveyAdminUploadImage}
        </label>

        {settings.voucher_image_url ? (
          <div className="relative rounded-xl overflow-hidden border border-border bg-surface mb-3">
            <img
              src={settings.voucher_image_url}
              alt="Voucher"
              className="w-full object-cover"
              style={{ maxHeight: 200 }}
            />
            <button
              onClick={() => setSettings((p) => ({ ...p, voucher_image_url: null }))}
              className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 border border-border flex items-center justify-center text-error hover:bg-red-50 transition-colors shadow-sm"
              title="Remove image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 rounded-xl border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all mb-3"
          >
            <ImageIcon size={28} className="text-text-muted" />
            <p className="text-sm text-text-muted">Click to upload voucher image (PNG, JPG, WebP)</p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading && (
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-medium text-text-muted hover:bg-surface hover:text-text transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : settings.voucher_image_url ? 'Replace image' : 'Upload image'}
        </button>
      </div>

      {/* Voucher title */}
      <div>
        <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
          {t.surveyAdminVoucherTitle}
        </label>
        <input
          type="text"
          value={settings.voucher_title ?? ''}
          onChange={(e) => setSettings((p) => ({ ...p, voucher_title: e.target.value }))}
          placeholder="VD: Hoàn thành khảo sát để nhận voucher 50k"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-surface">
        <div>
          <p className="text-sm font-semibold text-text">{t.surveyAdminToggleActive}</p>
          <p className="text-xs text-text-muted">
            {settings.is_active ? 'Survey is visible to visitors' : 'Survey is hidden / inactive'}
          </p>
        </div>
        <button
          onClick={() => setSettings((p) => ({ ...p, is_active: !p.is_active }))}
          className="text-primary"
        >
          {settings.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-text-muted" />}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-error bg-red-50 rounded-xl px-4 py-3 border border-red-100">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {savedMsg ? '✓ Saved' : saving ? 'Saving…' : t.surveyAdminSave}
      </button>
    </div>
  )
}
