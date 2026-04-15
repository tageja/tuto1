import { getServiceClient, NursedPeerReview, NursedSubmission } from '../supabase'
import { getPublicUrl } from '../storage'

export async function getUserPairGroupId(userId: string): Promise<string | null> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_pair_members')
    .select('pair_group_id, nursed_pair_groups!inner(active)')
    .eq('user_id', userId)
    .eq('nursed_pair_groups.active', true)
    .limit(1)
    .single()
  if (error || !data) return null
  return data.pair_group_id
}

export type GroupActivityItem = {
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

export async function getGroupRecentRecordings(
  pairGroupId: string,
  limit = 10,
): Promise<GroupActivityItem[]> {
  const memberIds = await getGroupMemberIds(pairGroupId)
  if (memberIds.length === 0) return []

  const db = getServiceClient()
  const { data: submissions, error } = await db
    .from('nursed_submissions')
    .select('id, user_id, step_id, lesson_id, storage_path, created_at')
    .eq('type', 'recording')
    .in('user_id', memberIds)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !submissions?.length) return []

  const userIds = [...new Set(submissions.map((s) => s.user_id))]
  const { data: profiles } = await db
    .from('nursed_profiles')
    .select('id, full_name')
    .in('id', userIds)
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name]),
  )

  const stepIds = [...new Set(submissions.map((s) => s.step_id))]
  const { data: steps } = await db
    .from('nursed_lesson_steps')
    .select('id, title, title_vi')
    .in('id', stepIds)
  const stepMap = new Map(
    (steps ?? []).map((s) => [s.id, s.title_vi ?? s.title]),
  )

  const results: GroupActivityItem[] = []
  for (const sub of submissions) {
    let publicUrl: string | null = null
    if (sub.storage_path) {
      try {
        publicUrl = await getPublicUrl(sub.storage_path)
      } catch { /* storage error — skip URL */ }
    }
    results.push({
      id: sub.id,
      user_id: sub.user_id,
      display_name: profileMap.get(sub.user_id) ?? null,
      step_id: sub.step_id,
      step_title: stepMap.get(sub.step_id) ?? null,
      lesson_id: sub.lesson_id,
      storage_path: sub.storage_path,
      public_url: publicUrl,
      created_at: sub.created_at,
    })
  }
  return results
}

export async function getGroupMemberIds(pairGroupId: string): Promise<string[]> {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_pair_members')
    .select('user_id')
    .eq('pair_group_id', pairGroupId)
  if (error || !data) return []
  return data.map((m) => m.user_id)
}

export type PeerRecording = {
  id: string
  user_id: string
  display_name: string | null
  storage_path: string | null
  public_url: string | null
  created_at: string
  my_review: { id: string; rating: number } | null
}

export async function getGroupRecordingsForStep(
  pairGroupId: string,
  stepId: string,
  currentUserId: string,
): Promise<PeerRecording[]> {
  const memberIds = await getGroupMemberIds(pairGroupId)
  const peerIds = memberIds.filter((id) => id !== currentUserId)
  if (peerIds.length === 0) return []

  const db = getServiceClient()
  const { data: submissions, error } = await db
    .from('nursed_submissions')
    .select('id, user_id, storage_path, created_at')
    .eq('step_id', stepId)
    .eq('type', 'recording')
    .in('user_id', peerIds)
    .order('created_at', { ascending: false })
  if (error || !submissions?.length) return []

  const submissionIds = submissions.map((s) => s.id)
  const { data: reviews } = await db
    .from('nursed_peer_reviews')
    .select('id, submission_id, rating')
    .eq('reviewer_id', currentUserId)
    .in('submission_id', submissionIds)
  const reviewMap = new Map(
    (reviews ?? []).map((r) => [r.submission_id, { id: r.id, rating: r.rating }]),
  )

  const userIds = [...new Set(submissions.map((s) => s.user_id))]
  const { data: profiles } = await db
    .from('nursed_profiles')
    .select('id, full_name')
    .in('id', userIds)
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name]),
  )

  const results: PeerRecording[] = []
  for (const sub of submissions) {
    let publicUrl: string | null = null
    if (sub.storage_path) {
      try {
        publicUrl = await getPublicUrl(sub.storage_path)
      } catch { /* storage error — skip URL */ }
    }
    results.push({
      id: sub.id,
      user_id: sub.user_id,
      display_name: profileMap.get(sub.user_id) ?? null,
      storage_path: sub.storage_path,
      public_url: publicUrl,
      created_at: sub.created_at,
      my_review: reviewMap.get(sub.id) ?? null,
    })
  }
  return results
}

export async function createPeerReview(
  reviewerId: string,
  submissionId: string,
  rating: number,
): Promise<NursedPeerReview> {
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5')

  const db = getServiceClient()

  const { data: submission, error: subErr } = await db
    .from('nursed_submissions')
    .select('id, user_id')
    .eq('id', submissionId)
    .single()
  if (subErr || !submission) throw new Error('Submission not found')
  if (submission.user_id === reviewerId) throw new Error('Cannot review your own submission')

  const reviewerGroupId = await getUserPairGroupId(reviewerId)
  if (!reviewerGroupId) throw new Error('Reviewer is not in a group')

  const submitterGroupId = await getUserPairGroupId(submission.user_id)
  if (reviewerGroupId !== submitterGroupId) throw new Error('Submission is not from your group')

  const { data, error } = await db
    .from('nursed_peer_reviews')
    .upsert(
      { reviewer_id: reviewerId, submission_id: submissionId, rating },
      { onConflict: 'reviewer_id,submission_id' },
    )
    .select()
    .single()
  if (error) throw error
  return data as NursedPeerReview
}

export async function getPeerReviewsByReviewer(
  reviewerId: string,
  stepId: string,
): Promise<NursedPeerReview[]> {
  const db = getServiceClient()
  const { data: submissions } = await db
    .from('nursed_submissions')
    .select('id')
    .eq('step_id', stepId)
    .eq('type', 'recording')
  if (!submissions?.length) return []

  const submissionIds = submissions.map((s) => s.id)
  const { data, error } = await db
    .from('nursed_peer_reviews')
    .select('*')
    .eq('reviewer_id', reviewerId)
    .in('submission_id', submissionIds)
  if (error) throw error
  return (data ?? []) as NursedPeerReview[]
}

export type StepReviewStatus = {
  stepId: string
  stepTitle: string | null
  hasRecording: boolean
  hasReview: boolean
}

export type ModuleGateResult = {
  gateOpen: boolean
  steps: StepReviewStatus[]
  totalRequired: number
  completedRecordings: number
  completedReviews: number
}

export async function getModulePeerReviewStatus(
  userId: string,
  moduleId: string,
): Promise<ModuleGateResult> {
  const db = getServiceClient()

  const { data: lessons } = await db
    .from('nursed_lessons')
    .select('id')
    .eq('module_id', moduleId)
    .eq('published', true)
  if (!lessons?.length) return { gateOpen: true, steps: [], totalRequired: 0, completedRecordings: 0, completedReviews: 0 }

  const lessonIds = lessons.map((l) => l.id)
  const { data: allSteps } = await db
    .from('nursed_lesson_steps')
    .select('id, lesson_id, title, title_vi')
    .eq('type', 'recording_submit')
    .in('lesson_id', lessonIds)
    .order('order_index')
  if (!allSteps?.length) return { gateOpen: true, steps: [], totalRequired: 0, completedRecordings: 0, completedReviews: 0 }

  const stepIds = allSteps.map((s) => s.id)

  const { data: userSubmissions } = await db
    .from('nursed_submissions')
    .select('id, step_id')
    .eq('user_id', userId)
    .eq('type', 'recording')
    .in('step_id', stepIds)

  const submittedStepIds = new Set((userSubmissions ?? []).map((s) => s.step_id))

  const allRecordingSubmissionIds = (userSubmissions ?? []).map((s) => s.id)

  const { data: allSubmissionsForSteps } = await db
    .from('nursed_submissions')
    .select('id, step_id')
    .eq('type', 'recording')
    .in('step_id', stepIds)
    .neq('user_id', userId)

  const peerSubmissionIds = (allSubmissionsForSteps ?? []).map((s) => s.id)

  let reviewedStepIds = new Set<string>()
  if (peerSubmissionIds.length > 0) {
    const { data: reviews } = await db
      .from('nursed_peer_reviews')
      .select('submission_id')
      .eq('reviewer_id', userId)
      .in('submission_id', peerSubmissionIds)

    const reviewedSubmissionIds = new Set((reviews ?? []).map((r) => r.submission_id))

    for (const sub of (allSubmissionsForSteps ?? [])) {
      if (reviewedSubmissionIds.has(sub.id)) {
        reviewedStepIds.add(sub.step_id)
      }
    }
  }

  const steps: StepReviewStatus[] = allSteps.map((s) => ({
    stepId: s.id,
    stepTitle: s.title_vi ?? s.title,
    hasRecording: submittedStepIds.has(s.id),
    hasReview: reviewedStepIds.has(s.id),
  }))

  const completedRecordings = steps.filter((s) => s.hasRecording).length
  const completedReviews = steps.filter((s) => s.hasReview).length
  const gateOpen = steps.every((s) => s.hasRecording && s.hasReview)

  return {
    gateOpen,
    steps,
    totalRequired: steps.length,
    completedRecordings,
    completedReviews,
  }
}
