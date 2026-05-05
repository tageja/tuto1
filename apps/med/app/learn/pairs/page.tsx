'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  CheckCircle,
  Mic,
  Star,
  Lock,
  ChevronRight,
  BookOpen,
  LogOut,
  Play,
  Headphones,
} from 'lucide-react'
import Link from 'next/link'
import type { NursedPairGroup } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle'
import type { CourseWithModules } from '@/lib/learn/lessonAccess'

type PairMember = { user_id: string; joined_at?: string }
type GroupWithMembers = NursedPairGroup & { nursed_pair_members?: PairMember[] }

type StepStatus = {
  stepId: string
  stepTitle: string | null
  hasRecording: boolean
  hasReview: boolean
}

type ModuleGateResult = {
  gateOpen: boolean
  steps: StepStatus[]
  totalRequired: number
  completedRecordings: number
  completedReviews: number
}

type ModuleProgress = {
  moduleId: string
  moduleTitle: string
  moduleTitleVi: string | null
  moduleSlug: string | null
  courseSlug: string | null
  courseId: string
  gate: ModuleGateResult
}

type ActivityItem = {
  id: string
  user_id: string
  display_name: string | null
  step_id: string
  step_title: string | null
  lesson_id: string
  storage_path: string | null
  public_url: string | null
  created_at: string
}

export default function PairsPage() {
  const { t, lang } = useLang()
  useDocumentTitle('Pairs')
  const { user, loading: authLoading } = useAuth()

  const [groups, setGroups] = useState<GroupWithMembers[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [myGroup, setMyGroup] = useState<GroupWithMembers | null>(null)

  const [groupName, setGroupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdGroup, setCreatedGroup] = useState<NursedPairGroup | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinResult, setJoinResult] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  const [codeCopied, setCodeCopied] = useState(false)

  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [leaving, setLeaving] = useState(false)

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true)
    try {
      const res = await fetch('/api/pairs')
      const json = await res.json()
      const allGroups: GroupWithMembers[] = json.data ?? []
      setGroups(allGroups)

      if (user) {
        const mine = allGroups.find((g) =>
          g.nursed_pair_members?.some((m) => m.user_id === user.id),
        )
        setMyGroup(mine ?? null)
      }
    } catch {}
    setLoadingGroups(false)
  }, [user])

  const fetchModuleProgress = useCallback(async () => {
    if (!user) {
      setLoadingProgress(false)
      return
    }
    setLoadingProgress(true)
    try {
      const coursesRes = await fetch('/api/courses')
      const coursesJson = await coursesRes.json()
      const courses: CourseWithModules[] = (coursesJson.data ?? []).filter(
        (c: CourseWithModules) => c.published,
      )

      const courseDetails = await Promise.all(
        courses.map(async (c) => {
          const res = await fetch(`/api/courses/${c.slug ?? c.id}`)
          const json = await res.json()
          return json.data as CourseWithModules | null
        }),
      )

      const allModules: {
        moduleId: string
        moduleTitle: string
        moduleTitleVi: string | null
        moduleSlug: string | null
        courseSlug: string | null
        courseId: string
      }[] = []

      for (const course of courseDetails) {
        if (!course?.nursed_modules) continue
        for (const mod of course.nursed_modules) {
          allModules.push({
            moduleId: mod.id,
            moduleTitle: mod.title,
            moduleTitleVi: mod.title_vi ?? null,
            moduleSlug: mod.slug ?? null,
            courseSlug: course.slug ?? null,
            courseId: course.id,
          })
        }
      }

      const gateResults = await Promise.all(
        allModules.map(async (mod) => {
          try {
            const res = await fetch(
              `/api/module-progress?moduleId=${mod.moduleId}`,
            )
            const json = await res.json()
            return { ...mod, gate: json.data as ModuleGateResult }
          } catch {
            return null
          }
        }),
      )

      const withPractice = gateResults.filter(
        (r): r is ModuleProgress => r !== null && r.gate.totalRequired > 0,
      )
      setModuleProgress(withPractice)
    } catch {}
    setLoadingProgress(false)
  }, [user])

  const fetchActivity = useCallback(async () => {
    if (!user || !myGroup) {
      setLoadingActivity(false)
      return
    }
    setLoadingActivity(true)
    try {
      const res = await fetch('/api/group-activity?limit=15')
      const json = await res.json()
      setActivityItems(json.data ?? [])
    } catch {}
    setLoadingActivity(false)
  }, [user, myGroup])

  useEffect(() => {
    if (!authLoading) fetchGroups()
  }, [authLoading, fetchGroups])

  useEffect(() => {
    if (!authLoading) fetchModuleProgress()
  }, [authLoading, fetchModuleProgress])

  useEffect(() => {
    if (!authLoading && myGroup) fetchActivity()
  }, [authLoading, myGroup, fetchActivity])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim() || !user) return
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
      const newGroup = json.data as NursedPairGroup
      setCreatedGroup(newGroup)
      setGroupName('')

      await fetch('/api/pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          joinCode: newGroup.join_code,
          userId: user.id,
        }),
      })

      fetchGroups()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errorCreateGroup
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim() || !user) return
    setJoining(true)
    setJoinError(null)
    setJoinResult(null)
    try {
      const res = await fetch('/api/pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          joinCode: joinCode.trim(),
          userId: user.id,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? t.errorJoinGroup)
      setJoinResult(t.joinSuccess)
      setJoinCode('')
      fetchGroups()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errorJoinGroup
      setJoinError(message)
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!user || !myGroup) return
    if (!window.confirm(t.pairsLeaveConfirm)) return
    setLeaving(true)
    try {
      const res = await fetch('/api/pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          pairGroupId: myGroup.id,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to leave group')
      setMyGroup(null)
      fetchGroups()
    } catch {}
    setLeaving(false)
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {}
  }

  const isLoading = authLoading || loadingGroups

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1>{t.pairsTitle}</h1>
            <p className="text-sm text-text-muted mt-1">{t.pairsSubtitle}</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 w-1/3 rounded bg-surface mb-3" />
              <div className="h-4 w-2/3 rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div>
          <h1>{t.pairsTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.pairsSubtitle}</p>
        </div>
      </div>

      {myGroup ? (
        <GroupCard
          group={myGroup}
          codeCopied={codeCopied}
          onCopyCode={handleCopyCode}
          onLeave={handleLeave}
          leaving={leaving}
        />
      ) : (
        <OnboardingSection
          groupName={groupName}
          setGroupName={setGroupName}
          creating={creating}
          createError={createError}
          createdGroup={createdGroup}
          onCreate={handleCreate}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          joining={joining}
          joinError={joinError}
          joinResult={joinResult}
          onJoin={handleJoin}
          isAuthenticated={!!user}
        />
      )}

      {myGroup && (
        <ActivityFeedSection
          items={activityItems}
          loading={loadingActivity}
          currentUserId={user?.id ?? ''}
        />
      )}

      <PracticeProgressSection
        moduleProgress={moduleProgress}
        loading={loadingProgress}
        lang={lang}
      />

      {myGroup && (
        <InviteSection
          joinCode={myGroup.join_code}
          codeCopied={codeCopied}
          onCopyCode={handleCopyCode}
        />
      )}
    </div>
  )
}

function GroupCard({
  group,
  codeCopied,
  onCopyCode,
  onLeave,
  leaving,
}: {
  group: GroupWithMembers
  codeCopied: boolean
  onCopyCode: (code: string) => void
  onLeave: () => void
  leaving: boolean
}) {
  const { t } = useLang()
  const memberCount = group.nursed_pair_members?.length ?? 0

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center">
            <Users size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
              {t.pairsYourGroup}
            </p>
            <p className="font-semibold text-text text-lg">
              {group.name ?? t.groupNameUnnamed}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {t.pairsMembersCount
                .replace('{n}', String(memberCount))
                .replace('{max}', String(group.max_size))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <code className="px-3 py-1.5 rounded-lg bg-surface border border-border text-sm font-mono font-bold text-text">
            {group.join_code}
          </code>
          <button
            onClick={() => onCopyCode(group.join_code)}
            className="btn-secondary text-sm flex items-center gap-1.5 px-3 py-1.5"
            aria-label={t.pairsCopyCode}
          >
            {codeCopied ? (
              <>
                <Check size={14} />
                {t.pairsCopied}
              </>
            ) : (
              <>
                <Copy size={14} />
                {t.pairsCopyCode}
              </>
            )}
          </button>
          <button
            onClick={onLeave}
            disabled={leaving}
            className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut size={14} />
            {leaving ? t.pairsLeaving : t.pairsLeaveGroup}
          </button>
        </div>
      </div>
    </div>
  )
}

function OnboardingSection({
  groupName,
  setGroupName,
  creating,
  createError,
  createdGroup,
  onCreate,
  joinCode,
  setJoinCode,
  joining,
  joinError,
  joinResult,
  onJoin,
  isAuthenticated,
}: {
  groupName: string
  setGroupName: (v: string) => void
  creating: boolean
  createError: string | null
  createdGroup: NursedPairGroup | null
  onCreate: (e: React.FormEvent) => void
  joinCode: string
  setJoinCode: (v: string) => void
  joining: boolean
  joinError: string | null
  joinResult: string | null
  onJoin: (e: React.FormEvent) => void
  isAuthenticated: boolean
}) {
  const { t } = useLang()

  return (
    <>
      <div className="card p-5 bg-primary-light border-primary/20">
        <div className="flex items-start gap-3">
          <Users size={24} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-text mb-1">
              {t.pairsBannerTitle}
            </h3>
            <p className="text-sm text-text-muted">{t.pairsBannerDesc}</p>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="card p-4 bg-amber-50 border-warning text-center">
          <p className="text-sm text-amber-700 font-medium">
            {t.pairsSignInRequired}
          </p>
          <Link href="/auth/login" className="btn-primary mt-3 inline-flex text-sm">
            {t.authSignIn}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            <h2 className="text-base font-semibold">{t.createGroupTitle}</h2>
          </div>
          <form onSubmit={onCreate} className="space-y-3">
            <div>
              <label className="label">{t.labelGroupName}</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t.placeholderGroupName}
                className="input"
                disabled={!isAuthenticated}
              />
            </div>
            {createError && (
              <p className="text-sm text-error">{createError}</p>
            )}
            <button
              type="submit"
              disabled={creating || !groupName.trim() || !isAuthenticated}
              className="btn-primary w-full justify-center"
            >
              {creating ? t.btnCreating : t.btnCreateGroup}
            </button>
          </form>
          {createdGroup && (
            <div className="card p-4 bg-green-50 border-success space-y-2">
              <p className="text-sm font-semibold text-success">
                {t.createdSuccessTitle}
              </p>
              <p className="text-sm text-text">
                {t.createdGroupNameLabel}{' '}
                <strong>{createdGroup.name}</strong>
              </p>
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

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <LogIn size={20} className="text-primary" />
            <h2 className="text-base font-semibold">{t.joinGroupTitle}</h2>
          </div>
          <form onSubmit={onJoin} className="space-y-3">
            <div>
              <label className="label">{t.labelJoinCode}</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={t.placeholderJoinCode}
                className="input font-mono"
                maxLength={10}
                disabled={!isAuthenticated}
              />
            </div>
            {joinError && <p className="text-sm text-error">{joinError}</p>}
            {joinResult && (
              <p className="text-sm text-success">{joinResult}</p>
            )}
            <button
              type="submit"
              disabled={joining || !joinCode.trim() || !isAuthenticated}
              className="btn-primary w-full justify-center"
            >
              {joining ? t.btnJoining : t.btnJoin}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

function PracticeProgressSection({
  moduleProgress,
  loading,
  lang,
}: {
  moduleProgress: ModuleProgress[]
  loading: boolean
  lang: string
}) {
  const { t } = useLang()

  if (loading) {
    return (
      <section>
        <h2 className="section-title">{t.pairsPracticeProgress}</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 w-1/3 rounded bg-surface mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-surface" />
                <div className="h-4 w-2/3 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (moduleProgress.length === 0) {
    return (
      <section>
        <h2 className="section-title">{t.pairsPracticeProgress}</h2>
        <div className="card p-8 text-center">
          <BookOpen
            size={40}
            className="mx-auto mb-3 text-text-muted opacity-30"
          />
          <p className="text-text-muted">{t.pairsNoModules}</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="section-title">{t.pairsPracticeProgress}</h2>
      <p className="text-sm text-text-muted mb-4">
        {t.pairsPracticeProgressDesc}
      </p>
      <div className="space-y-5">
        {moduleProgress.map((mp) => (
          <ModuleProgressCard key={mp.moduleId} mp={mp} lang={lang} />
        ))}
      </div>
    </section>
  )
}

function ModuleProgressCard({
  mp,
  lang,
}: {
  mp: ModuleProgress
  lang: string
}) {
  const { t } = useLang()
  const { gate } = mp
  const totalTasks = gate.totalRequired * 2
  const completedTasks = gate.completedRecordings + gate.completedReviews
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const moduleTitle =
    lang === 'vi' && mp.moduleTitleVi ? mp.moduleTitleVi : mp.moduleTitle
  const courseSlugOrId = mp.courseSlug ?? mp.courseId
  const moduleSlugOrId = mp.moduleSlug ?? mp.moduleId

  return (
    <div className="card overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Mic size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text">{moduleTitle}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Mic size={12} />
                  {t.moduleGateRecordingDone
                    .replace('{n}', String(gate.completedRecordings))
                    .replace('{total}', String(gate.totalRequired))}
                </span>
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Star size={12} />
                  {t.moduleGateReviewDone
                    .replace('{n}', String(gate.completedReviews))
                    .replace('{total}', String(gate.totalRequired))}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {gate.gateOpen ? (
              <span className="badge badge-green flex items-center gap-1">
                <CheckCircle size={12} />
                {t.pairsModuleOpen}
              </span>
            ) : (
              <span className="badge badge-yellow flex items-center gap-1">
                <Lock size={12} />
                {t.pairsModuleLocked}
              </span>
            )}
          </div>
        </div>

        <div className="w-full bg-surface rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              gate.gateOpen ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {gate.steps.length > 0 && (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] text-xs font-medium text-text-muted bg-surface/80 px-4 py-2 border-b border-border">
              <span />
              <span className="text-center w-24">{t.pairsRecording}</span>
              <span className="text-center w-24">{t.pairsReview}</span>
            </div>
            {gate.steps.map((step, idx) => (
              <div
                key={step.stepId}
                className={`grid grid-cols-[1fr_auto_auto] items-center px-4 py-3 ${
                  idx < gate.steps.length - 1
                    ? 'border-b border-border'
                    : ''
                }`}
              >
                <span className="text-sm text-text truncate pr-2">
                  {step.stepTitle ?? step.stepId}
                </span>
                <div className="w-24 flex justify-center">
                  {step.hasRecording ? (
                    <CheckCircle
                      size={18}
                      className="text-green-500"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="w-24 flex justify-center">
                  {step.hasReview ? (
                    <CheckCircle
                      size={18}
                      className="text-green-500"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!gate.gateOpen && (
          <Link
            href={`/learn/courses/${courseSlugOrId}/modules/${moduleSlugOrId}`}
            className="btn-primary text-sm inline-flex items-center gap-1.5"
          >
            {t.pairsGoToModule}
            <ChevronRight size={14} />
          </Link>
        )}

        {gate.gateOpen && completedTasks === totalTasks && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle size={16} />
            {t.pairsAllComplete}
          </div>
        )}
      </div>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

function ActivityFeedSection({
  items,
  loading,
  currentUserId,
}: {
  items: ActivityItem[]
  loading: boolean
  currentUserId: string
}) {
  const { t } = useLang()

  return (
    <section>
      <h2 className="section-title flex items-center gap-2">
        <Headphones size={20} className="text-primary" />
        {t.pairsActivityTitle}
      </h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 w-2/3 rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-6 text-center">
          <Mic size={32} className="mx-auto mb-2 text-text-muted opacity-30" />
          <p className="text-sm text-text-muted">{t.pairsActivityEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="card p-4 flex items-center gap-4"
            >
              <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <Mic size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text font-medium truncate">
                  {item.display_name ?? 'Unknown'}{' '}
                  {item.user_id === currentUserId && (
                    <span className="text-text-muted font-normal">(you)</span>
                  )}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {item.step_title
                    ? t.pairsActivityStepLabel.replace(
                        '{step}',
                        item.step_title,
                      )
                    : ''}
                  {' · '}
                  {timeAgo(item.created_at)}
                </p>
              </div>
              {item.public_url && item.user_id !== currentUserId && (
                <a
                  href={item.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 flex-shrink-0"
                >
                  <Play size={12} />
                  {t.pairsActivityListenRate}
                </a>
              )}
              {item.public_url && item.user_id === currentUserId && (
                <a
                  href={item.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 flex-shrink-0 opacity-60"
                >
                  <Play size={12} />
                  Play
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function InviteSection({
  joinCode,
  codeCopied,
  onCopyCode,
}: {
  joinCode: string
  codeCopied: boolean
  onCopyCode: (code: string) => void
}) {
  const { t } = useLang()

  return (
    <section>
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text">
              {t.pairsInviteColleague}
            </h3>
            <p className="text-sm text-text-muted mt-1">
              {t.pairsInviteDesc}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <code className="px-3 py-2 rounded-lg bg-surface border border-border font-mono font-bold text-lg text-text tracking-wider">
                {joinCode}
              </code>
              <button
                onClick={() => onCopyCode(joinCode)}
                className="btn-secondary text-sm flex items-center gap-1.5 px-3 py-2"
                aria-label={t.pairsCopyCode}
              >
                {codeCopied ? (
                  <>
                    <Check size={14} />
                    {t.pairsCopied}
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    {t.pairsCopyCode}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
