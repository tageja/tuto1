import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ADMIN_ROLES } from '@/lib/supabase-server'
import { insertFeedback, getUserFeedback, getAllFeedback } from '@/lib/db/feedback'
import type { FeedbackCategory, FeedbackStatus } from '@/lib/supabase'

const VALID_CATEGORIES: FeedbackCategory[] = ['bug', 'suggestion', 'content', 'other']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { category, message, pageContext } = body as Record<string, unknown>

    if (!category || !VALID_CATEGORIES.includes(category as FeedbackCategory)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const trimmed = message.trim()
    if (trimmed.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }
    if (trimmed.length > 500) {
      return NextResponse.json({ error: 'Message must be at most 500 characters' }, { status: 400 })
    }

    const data = await insertFeedback({
      user_id: user.id,
      category: category as FeedbackCategory,
      message: trimmed,
      page_context: typeof pageContext === 'string' ? pageContext : null,
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('nursed_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile && ADMIN_ROLES.includes(profile.role)

    if (isAdmin) {
      const url = new URL(req.url)
      const status = url.searchParams.get('status') as FeedbackStatus | null
      const category = url.searchParams.get('category') as FeedbackCategory | null
      const filters: Record<string, string> = {}
      if (status) filters.status = status
      if (category) filters.category = category

      const data = await getAllFeedback(
        Object.keys(filters).length > 0 ? filters as { status?: FeedbackStatus; category?: FeedbackCategory } : undefined,
      )
      return NextResponse.json({ data })
    }

    const data = await getUserFeedback(user.id)
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
