'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, Film, X, Sparkles, BookOpen, Subtitles } from 'lucide-react'
import type { AnimationSegment } from '@/components/animations/types'

interface Props {
  stepId: string
  stepTitle: string
  segments?: AnimationSegment[]
  onUploaded: (videoUrl: string) => void
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'
type PracticeState = 'idle' | 'generating' | 'done' | 'error'

export default function VideoUploader({ stepId, stepTitle, segments = [], onUploaded }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [practiceState, setPracticeState] = useState<PracticeState>('idle')
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [fileMeta, setFileMeta] = useState<{ name: string; sizeMb: string } | null>(null)
  const [error, setError] = useState('')
  const [practiceError, setPracticeError] = useState('')
  const [updateType, setUpdateType] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [uploadMeta, setUploadMeta] = useState<{ vttGenerated: boolean; segmentsUsed: number } | null>(null)
  const [practiceResult, setPracticeResult] = useState<{ quizQuestions: number; clozeLines: number } | null>(null)
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

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'

    try {
      // Step 1: Get a signed upload URL from our API (tiny request, no file bytes through Vercel)
      const urlRes = await fetch(`/api/video/upload?stepId=${stepId}&ext=${ext}`)
      const urlData = await urlRes.json()
      if (!urlRes.ok || urlData.error) {
        setUploadState('error')
        setError(urlData.error ?? 'Could not get upload URL')
        return
      }
      const { signedUrl, path: storagePath } = urlData

      // Step 2: Upload the file directly to Supabase Storage (bypasses Vercel completely)
      const ticker = setInterval(() => {
        setProgress(p => Math.min(p + 2, 88))
      }, 300)

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'video/mp4' },
      })
      clearInterval(ticker)

      if (!uploadRes.ok) {
        setUploadState('error')
        setError(`Storage upload failed (${uploadRes.status})`)
        return
      }
      setProgress(95)

      // Step 3: Tell our API to link the uploaded file to the step in the DB
      const linkRes = await fetch('/api/video/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          storagePath,
          updateStepType: updateType,
          segments: segments.length ? segments : undefined,
        }),
      })
      const linkData = await linkRes.json()
      setProgress(100)

      if (!linkRes.ok || linkData.error) {
        setUploadState('error')
        setError(linkData.error ?? 'Failed to link video to step')
        return
      }

      setUploadState('done')
      setVideoUrl(linkData.videoUrl)
      setUploadMeta({ vttGenerated: linkData.vttGenerated, segmentsUsed: linkData.segmentsUsed ?? 0 })
      onUploaded(linkData.videoUrl)
    } catch (e) {
      setUploadState('error')
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
  }, [stepId, updateType, segments, onUploaded])

  const handleGeneratePractice = async () => {
    if (!segments.length) return
    setPracticeState('generating')
    setPracticeError('')

    try {
      const res = await fetch('/api/steps/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, segments }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setPracticeState('error')
        setPracticeError(data.error ?? 'Generation failed')
        return
      }

      setPracticeState('done')
      setPracticeResult({ quizQuestions: data.quizQuestions, clozeLines: data.clozeLines })
    } catch (e) {
      setPracticeState('error')
      setPracticeError(e instanceof Error ? e.message : 'Generation failed')
    }
  }

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
    setUploadMeta(null)
    setPracticeState('idle')
    setPracticeResult(null)
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
          {segments.length > 0 && (
            <p className="text-xs text-purple-500 mt-2">
              ✓ {segments.length} script segments ready — VTT subtitles + practice steps will auto-generate
            </p>
          )}
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
        <div className="space-y-3">
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">Video uploaded successfully!</p>
                <p className="text-xs text-green-700 mt-0.5">{fileMeta?.name} · {fileMeta?.sizeMb} MB</p>

                {/* VTT indicator */}
                {uploadMeta && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Subtitles size={12} className={uploadMeta.vttGenerated ? 'text-blue-500' : 'text-gray-400'} />
                    <span className={`text-xs ${uploadMeta.vttGenerated ? 'text-blue-600' : 'text-gray-400'}`}>
                      {uploadMeta.vttGenerated
                        ? `Vietnamese subtitles auto-generated (${uploadMeta.segmentsUsed} lines)`
                        : 'No script segments — VTT not generated'}
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-1 truncate font-mono">{videoUrl}</p>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {/* Mini player */}
            <video src={videoUrl} controls className="w-full rounded-lg max-h-48 bg-black" />
          </div>

          {/* Generate Practice Steps */}
          {segments.length > 0 && (
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <BookOpen size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800">Add Practice Activities</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Auto-generate a phrase-matching quiz and fill-in-the-blank exercise from the dialogue script.
                    Both will be added as new steps right after this video.
                  </p>
                </div>
              </div>

              {practiceState === 'idle' && (
                <button
                  onClick={handleGeneratePractice}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Sparkles size={14} />
                  Generate Practice Steps
                </button>
              )}

              {practiceState === 'generating' && (
                <div className="flex items-center gap-2 text-blue-700 text-sm justify-center py-1">
                  <Loader2 size={14} className="animate-spin" />
                  Generating quiz + cloze steps…
                </div>
              )}

              {practiceState === 'done' && practiceResult && (
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle size={14} />
                  <span>
                    Created: quiz ({practiceResult.quizQuestions} questions) + cloze ({practiceResult.clozeLines} blanks).
                    Reload the lesson steps page to see them.
                  </span>
                </div>
              )}

              {practiceState === 'error' && (
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle size={14} />
                  <span>{practiceError}</span>
                  <button
                    onClick={() => setPracticeState('idle')}
                    className="ml-auto text-xs underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
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
