'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, Film, X, Trash2, RefreshCcw } from 'lucide-react'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

interface Props {
  initialVideoUrl: string | null
  onChange: (videoUrl: string | null) => void
}

export default function HomepageVideoUploader({ initialVideoUrl, onChange }: Props) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(initialVideoUrl)
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [fileMeta, setFileMeta] = useState<{ name: string; sizeMb: string } | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setCurrentUrl(initialVideoUrl) }, [initialVideoUrl])

  const handleFile = useCallback(async (file: File) => {
    if (!file) return
    const sizeMb = (file.size / 1024 / 1024).toFixed(1)
    setFileMeta({ name: file.name, sizeMb })

    if (file.size > 200 * 1024 * 1024) {
      setError(`File is ${sizeMb} MB — max is 200 MB. Compress or trim first.`)
      setState('error')
      return
    }

    setState('uploading')
    setProgress(0)
    setError('')

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'

    try {
      const urlRes = await fetch(`/api/site-settings/homepage/upload-url?ext=${ext}`)
      const urlData = await urlRes.json()
      if (!urlRes.ok || urlData.error) {
        setState('error')
        setError(urlData.error ?? 'Could not get upload URL')
        return
      }

      const ticker = setInterval(() => setProgress(p => Math.min(p + 2, 88)), 300)
      const uploadRes = await fetch(urlData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'video/mp4' },
      })
      clearInterval(ticker)

      if (!uploadRes.ok) {
        setState('error')
        setError(`Storage upload failed (${uploadRes.status})`)
        return
      }
      setProgress(95)

      const linkRes = await fetch('/api/site-settings/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intro_video_url: `${urlData.publicUrl}?v=${Date.now()}` }),
      })
      const linkData = await linkRes.json()
      setProgress(100)

      if (!linkRes.ok || linkData.error) {
        setState('error')
        setError(linkData.error ?? 'Could not save settings')
        return
      }

      const next = linkData.data?.intro_video_url ?? null
      setCurrentUrl(next)
      setState('done')
      onChange(next)
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDelete = useCallback(async () => {
    if (!confirm('Remove the homepage intro video? Visitors will no longer see it.')) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch('/api/site-settings/homepage/video', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Delete failed')
        return
      }
      setCurrentUrl(null)
      setState('idle')
      setFileMeta(null)
      onChange(null)
    } finally {
      setDeleting(false)
    }
  }, [onChange])

  const reset = () => {
    setState('idle')
    setProgress(0)
    setFileMeta(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Existing video preview */}
      {currentUrl && state !== 'uploading' && (
        <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
            <Film size={16} className="text-blue-600" />
            Current homepage video
          </div>
          <video src={currentUrl} controls className="w-full rounded-lg max-h-64 bg-black" />
          <p className="text-xs text-blue-800/80 break-all font-mono">{currentUrl}</p>
          <div className="flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-300 hover:border-blue-500 text-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCcw size={14} />
              Replace
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-300 hover:border-red-500 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}

      {/* Drop zone */}
      {!currentUrl && state === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
          }`}
        >
          <Upload size={28} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drop the homepage intro video here, or <span className="text-purple-600 underline">browse</span>
          </p>
          <p className="text-xs text-gray-400">MP4, WebM, MOV · Max 200 MB</p>
          <p className="text-xs text-gray-400 mt-1">Will appear on the public landing page (pro.tuto.asia).</p>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}

      {/* Uploading */}
      {state === 'uploading' && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-purple-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{fileMeta?.name}</p>
              <p className="text-xs text-gray-500">{fileMeta?.sizeMb} MB · uploading…</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 text-center">{progress}%</p>
        </div>
      )}

      {/* Done banner */}
      {state === 'done' && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-3 flex items-center gap-3">
          <CheckCircle size={16} className="text-green-600" />
          <p className="text-sm font-medium text-green-800">Saved. Visitors will see this on the homepage immediately.</p>
          <button onClick={reset} className="ml-auto text-green-700 hover:text-green-900"><X size={14} /></button>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Upload failed</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
          <button onClick={reset} className="text-red-400 hover:text-red-600"><X size={16} /></button>
        </div>
      )}
    </div>
  )
}
