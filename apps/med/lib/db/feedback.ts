import { getServiceClient, NursedFeedback, FeedbackCategory, FeedbackStatus } from '../supabase'

export type InsertFeedback = {
  user_id: string
  category: FeedbackCategory
  message: string
  page_context?: string | null
}

export async function insertFeedback(payload: InsertFeedback) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_feedback')
    .insert({
      user_id: payload.user_id,
      category: payload.category,
      message: payload.message,
      page_context: payload.page_context ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as NursedFeedback
}

export async function getUserFeedback(userId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as NursedFeedback[]
}

export type FeedbackFilters = {
  status?: FeedbackStatus
  category?: FeedbackCategory
}

export async function getAllFeedback(filters?: FeedbackFilters) {
  const db = getServiceClient()
  let query = db
    .from('nursed_feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  const { data, error } = await query
  if (error) throw error

  const feedbacks = data as NursedFeedback[]
  if (feedbacks.length === 0) return []

  const userIds = [...new Set(feedbacks.map((f) => f.user_id))]
  const { data: profiles } = await db
    .from('nursed_profiles')
    .select('id, full_name')
    .in('id', userIds)

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]),
  )

  return feedbacks.map((f) => ({
    ...f,
    learner_name: profileMap.get(f.user_id) ?? null,
  }))
}

export type FeedbackWithLearner = NursedFeedback & { learner_name: string | null }

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus,
  adminResponse?: string | null,
) {
  const db = getServiceClient()
  const update: Record<string, unknown> = { status }
  if (adminResponse !== undefined) {
    update.admin_response = adminResponse
  }

  const { data, error } = await db
    .from('nursed_feedback')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as NursedFeedback
}

export async function getFeedbackById(id: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('nursed_feedback')
    .select('*')
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data as NursedFeedback | null
}
