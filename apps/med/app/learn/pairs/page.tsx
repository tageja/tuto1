'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, LogIn, Upload } from 'lucide-react'
import type { NursedPairGroup } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

export default function PairsPage() {
  const { t } = useLang()
  const [groups, setGroups] = useState<NursedPairGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)

  // Create group form
  const [groupName, setGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdGroup, setCreatedGroup] = useState<NursedPairGroup | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  // Join group form
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinResult, setJoinResult] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Session recording
  const [sessionFile, setSessionFile] = useState<File | null>(null)
  const [uploadingSession, setUploadingSession] = useState(false)
  const [sessionMsg, setSessionMsg] = useState<string | null>(null)
  const [sessionSuccess, setSessionSuccess] = useState(false)

  const fetchGroups = async () => {
    setLoadingGroups(true)
    try {
      const res = await fetch('/api/pairs')
      const json = await res.json()
      setGroups(json.data ?? [])
    } catch {}
    setLoadingGroups(false)
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? t.errorCreateGroup)
      setCreatedGroup(json.data)
      setGroupName('')
      fetchGroups()
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError(null)
    setJoinResult(null)
    try {
      const res = await fetch('/api/pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', joinCode: joinCode.trim(), userId: 'guest' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? t.errorJoinGroup)
      setJoinResult(t.joinSuccess)
      setJoinCode('')
      fetchGroups()
    } catch (err: any) {
      setJoinError(err.message)
    } finally {
      setJoining(false)
    }
  }

  const handleSessionUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionFile) return
    setUploadingSession(true)
    setSessionMsg(null)
    setSessionSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', sessionFile)
      formData.append('type', 'audio')
      const res = await fetch('/api/assets/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error(t.uploadError)
      setSessionMsg(t.uploadSuccess)
      setSessionSuccess(true)
      setSessionFile(null)
    } catch {
      setSessionMsg(t.uploadRetryError)
      setSessionSuccess(false)
    } finally {
      setUploadingSession(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1>{t.pairsTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.pairsSubtitle}</p>
        </div>
      </div>

      {/* Explanation banner */}
      <div className="card p-5 bg-primary-light border-primary/20">
        <div className="flex items-start gap-3">
          <Users size={24} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text mb-1">{t.pairsBannerTitle}</h3>
            <p className="text-sm text-text-muted">{t.pairsBannerDesc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create group */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            <h2 className="text-base font-semibold">{t.createGroupTitle}</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">{t.labelGroupName}</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t.placeholderGroupName}
                className="input"
              />
            </div>
            {createError && <p className="text-sm text-error">{createError}</p>}
            <button type="submit" disabled={creating || !groupName.trim()} className="btn-primary w-full justify-center">
              {creating ? t.btnCreating : t.btnCreateGroup}
            </button>
          </form>

          {createdGroup && (
            <div className="card p-4 bg-green-50 border-success space-y-2">
              <p className="text-sm font-semibold text-success">{t.createdSuccessTitle}</p>
              <p className="text-sm text-text">{t.createdGroupNameLabel} <strong>{createdGroup.name}</strong></p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text">{t.joinCodeLabel}</span>
                <code className="px-2 py-1 rounded bg-white border border-success text-success font-mono font-bold text-sm">
                  {createdGroup.join_code}
                </code>
              </div>
              <p className="text-xs text-text-muted">{t.shareCodeHint}</p>
            </div>
          )}
        </div>

        {/* Join group */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <LogIn size={20} className="text-primary" />
            <h2 className="text-base font-semibold">{t.joinGroupTitle}</h2>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="label">{t.labelJoinCode}</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={t.placeholderJoinCode}
                className="input font-mono"
                maxLength={10}
              />
            </div>
            {joinError && <p className="text-sm text-error">{joinError}</p>}
            {joinResult && <p className="text-sm text-success">{joinResult}</p>}
            <button type="submit" disabled={joining || !joinCode.trim()} className="btn-primary w-full justify-center">
              {joining ? t.btnJoining : t.btnJoin}
            </button>
          </form>
        </div>
      </div>

      {/* Session recording upload */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Upload size={20} className="text-primary" />
          <h2 className="text-base font-semibold">{t.uploadSessionTitle}</h2>
        </div>
        <p className="text-sm text-text-muted">{t.uploadSessionDesc}</p>

        <form onSubmit={handleSessionUpload} className="space-y-3">
          <div>
            <label className="label">{t.labelAudioFileUpload}</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setSessionFile(e.target.files?.[0] ?? null)}
              className="input py-1.5"
            />
          </div>
          {sessionMsg && (
            <p className={`text-sm ${sessionSuccess ? 'text-success' : 'text-error'}`}>
              {sessionMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={uploadingSession || !sessionFile}
            className="btn-primary justify-center"
          >
            {uploadingSession ? t.btnUploading : t.btnSubmitRecording}
          </button>
        </form>
      </div>

      {/* Active groups list */}
      <section>
        <h2 className="section-title">{t.groupsSectionTitle}</h2>
        {loadingGroups ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="card p-8 text-center">
            <Users size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
            <p className="text-text-muted">{t.emptyGroups}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text">{g.name ?? t.groupNameUnnamed}</p>
                    <p className="text-xs text-text-muted">
                      {t.groupMaxMembers.replace('{n}', String(g.max_size))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 rounded bg-surface border border-border text-sm font-mono text-text">
                    {g.join_code}
                  </code>
                  <span className={`badge ${g.active ? 'badge-green' : 'badge-gray'}`}>
                    {g.active ? t.groupStatusActive : t.groupStatusInactive}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
