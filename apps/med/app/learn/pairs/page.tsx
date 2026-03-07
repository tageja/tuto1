'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, LogIn, Upload } from 'lucide-react'
import type { NursedPairGroup } from '@/lib/supabase'

export default function PairsPage() {
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
      if (!res.ok) throw new Error(json.error ?? 'Lỗi tạo nhóm')
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
      if (!res.ok) throw new Error(json.error ?? 'Lỗi tham gia nhóm')
      setJoinResult('Tham gia nhóm thành công! 🎉')
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
    try {
      const formData = new FormData()
      formData.append('file', sessionFile)
      formData.append('type', 'audio')
      const res = await fetch('/api/assets/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload thất bại')
      setSessionMsg('Đã nộp bản ghi âm nhóm thành công! ✅')
      setSessionFile(null)
    } catch {
      setSessionMsg('Lỗi khi upload. Vui lòng thử lại.')
    } finally {
      setUploadingSession(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1>Nhóm luyện tập</h1>
          <p className="text-sm text-text-muted mt-1">Luyện tập cùng đồng nghiệp để tiến bộ nhanh hơn</p>
        </div>
      </div>

      {/* Explanation banner */}
      <div className="card p-5 bg-primary-light border-primary/20">
        <div className="flex items-start gap-3">
          <Users size={24} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text mb-1">Luyện tập cùng đồng nghiệp</h3>
            <p className="text-sm text-text-muted">
              Tạo nhóm và mời đồng nghiệp tham gia. Cùng nhau luyện đối thoại y tế và nộp bản ghi âm nhóm.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create group */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            <h2 className="text-base font-semibold">Tạo nhóm mới</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Tên nhóm</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="VD: Nhóm A - Phòng ICU"
                className="input"
              />
            </div>
            {createError && <p className="text-sm text-error">{createError}</p>}
            <button type="submit" disabled={creating || !groupName.trim()} className="btn-primary w-full justify-center">
              {creating ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </form>

          {createdGroup && (
            <div className="card p-4 bg-green-50 border-success space-y-2">
              <p className="text-sm font-semibold text-success">✅ Nhóm đã được tạo!</p>
              <p className="text-sm text-text">Tên: <strong>{createdGroup.name}</strong></p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text">Mã tham gia:</span>
                <code className="px-2 py-1 rounded bg-white border border-success text-success font-mono font-bold text-sm">
                  {createdGroup.join_code}
                </code>
              </div>
              <p className="text-xs text-text-muted">Chia sẻ mã này với đồng nghiệp của bạn</p>
            </div>
          )}
        </div>

        {/* Join group */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <LogIn size={20} className="text-primary" />
            <h2 className="text-base font-semibold">Tham gia nhóm</h2>
          </div>

          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="label">Mã tham gia</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="VD: ABC123"
                className="input font-mono"
                maxLength={10}
              />
            </div>
            {joinError && <p className="text-sm text-error">{joinError}</p>}
            {joinResult && <p className="text-sm text-success">{joinResult}</p>}
            <button type="submit" disabled={joining || !joinCode.trim()} className="btn-primary w-full justify-center">
              {joining ? 'Đang tham gia...' : 'Tham gia'}
            </button>
          </form>
        </div>
      </div>

      {/* Session recording upload */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Upload size={20} className="text-primary" />
          <h2 className="text-base font-semibold">Nộp bản ghi âm nhóm</h2>
        </div>
        <p className="text-sm text-text-muted">Upload file ghi âm buổi luyện tập của nhóm bạn</p>

        <form onSubmit={handleSessionUpload} className="space-y-3">
          <div>
            <label className="label">Chọn file audio</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setSessionFile(e.target.files?.[0] ?? null)}
              className="input py-1.5"
            />
          </div>
          {sessionMsg && (
            <p className={`text-sm ${sessionMsg.includes('thành công') ? 'text-success' : 'text-error'}`}>
              {sessionMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={uploadingSession || !sessionFile}
            className="btn-primary justify-center"
          >
            {uploadingSession ? 'Đang nộp...' : 'Nộp bản ghi âm'}
          </button>
        </form>
      </div>

      {/* Active groups list */}
      <section>
        <h2 className="section-title">Nhóm hiện có</h2>
        {loadingGroups ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="card p-8 text-center">
            <Users size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
            <p className="text-text-muted">Chưa có nhóm nào. Hãy tạo nhóm đầu tiên!</p>
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
                    <p className="font-medium text-text">{g.name ?? 'Nhóm chưa đặt tên'}</p>
                    <p className="text-xs text-text-muted">
                      Tối đa {g.max_size} thành viên
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="px-2 py-1 rounded bg-surface border border-border text-sm font-mono text-text">
                    {g.join_code}
                  </code>
                  <span className={`badge ${g.active ? 'badge-green' : 'badge-gray'}`}>
                    {g.active ? 'Đang hoạt động' : 'Ngừng'}
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
