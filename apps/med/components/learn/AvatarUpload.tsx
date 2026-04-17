'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

interface Props {
  avatarUrl: string | null
  onUploaded: (url: string) => void
}

export default function AvatarUpload({ avatarUrl, onUploaded }: Props) {
  const { t } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl)

  const handleClick = () => inputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setErrorMsg(null)

    // Local preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok || !json.success) {
        setErrorMsg(json.error ?? 'Upload failed')
        setPreviewUrl(avatarUrl) // revert preview
        setStatus('error')
        return
      }

      onUploaded(json.avatar_url)
      setStatus('idle')
    } catch {
      setErrorMsg('Upload failed')
      setPreviewUrl(avatarUrl)
      setStatus('error')
    } finally {
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const initials = '?'

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'uploading'}
        className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={t.profileAvatarUpload}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {status === 'uploading' ? (
            <Loader2 size={22} className="text-white animate-spin" />
          ) : (
            <Camera size={22} className="text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <span className="text-xs text-text-muted">{t.profileAvatarUpload}</span>

      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-500 text-center max-w-[160px]">{errorMsg}</p>
      )}
    </div>
  )
}
