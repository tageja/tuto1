'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, Film, X } from 'lucide-react'

interface Props {
  stepId: string
  stepTitle: string
  onUploaded: (videoUrl: string) => void
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export default function VideoUploader({ stepId, stepTitle, onUploaded }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [fileMeta, setFileMeta] = useState<{ name: string; sizeMb: string } | null>(null)
  const [error, setError] = useState('')
  const [updateType, setUpdateType] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file) return

    const sizeMb = (file.size / 1024 / 1024).toFixed(1)
    setFileMeta({ name: file.name, sizeMb })

    if (file.size > 200 * 1024 * 1024) {
      setError(`File is ${sizeMb} MB — maximum is 200 MB. Please compress or trim the video first.`)
      return
    }

    setUploadState('uploading')
    setProgress(0)
    setError('')

    const form = new FormData()
    form.append('file', file)
    form.append('stepId', stepId)
    form.append('updateStepType', String(updateType))

    // Fake incremental progress while uploading (XHR gives real progress, fetch doesn't)
    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + 3, 88))
    }, 400)

    try {
      const res = await fetch('/api/video/upload', { method: 'POST', body: form })
      clearInterval(ticker)
      setProgress(100)

      const data = await res.json()

      if (!res.ok || data.error) {
        setUploadState('error')
        setError(data.error ?? 'Upload failed')
        return
      }

      setUploadState('done')
      setVideoUrl(data.videoUrl)
      onUploaded(data.videoUrl)
    } catch (e) {
      clearInterval(ticker)
      setUploadState('error')
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
  }, [stepId, updateType, onUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const reset = () => {
    setUploadState('idle')
    setProgress(0)
    setVideoUrl(null)
    setFileMeta(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Film size={16} className="text-purple-500" />
          Upload HeyGen Video
        </h3>
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={updateType}
            onChange={e => setUpdateType(e.target.checked)}
            className="rounded"
          />
          Change step type to <code className="bg-gray-100 px-1 rounded">video</code>
        </label>
      </div>

      {/* Upload zone */}
      {uploadState === 'idle' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
          }`}
        >
          <Upload size={28} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drop HeyGen video here, or <span className="text-purple-600 underline">browse</span>
          </p>
          <p className="text-xs text-gray-400">MP4, WebM, MOV · Max 200 MB</p>
          <p className="text-xs text-gray-400 mt-1">
            Will upload to Supabase and link to: <span className="font-mono text-gray-500 truncate">{stepTitle}</span>
          </p>
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
      {uploadState === 'uploading' && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-purple-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{fileMeta?.name}</p>
              <p className="text-xs text-gray-500">{fileMeta?.sizeMb} MB · uploading to Supabase…</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">{progress}%</p>
        </div>
      )}

      {/* Done */}
      {uploadState === 'done' && videoUrl && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">Video uploaded successfully!</p>
              <p className="text-xs text-green-700 mt-0.5">{fileMeta?.name} · {fileMeta?.sizeMb} MB</p>
              <p className="text-xs text-gray-500 mt-1 truncate font-mono">{videoUrl}</p>
            </div>
            <button onClick={reset} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          {/* Mini player */}
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg max-h-48 bg-black"
          />
        </div>
      )}

      {/* Error */}
      {uploadState === 'error' && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Upload failed</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
          <button onClick={reset} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
