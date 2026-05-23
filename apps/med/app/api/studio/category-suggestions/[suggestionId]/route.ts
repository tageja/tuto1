import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceServerClient, getSessionAndProfile } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/utils/slug'

type RouteContext = {
  params: Promise<{ suggestionId: string }>
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user, profile } = await getSessionAndProfile()
    if (!user || profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { suggestionId } = await context.params
    const body = await req.json()
    const status = body.status === 'approved' || body.status === 'rejected'
      ? body.status
      : null

    if (!status) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const db = await createSupabaseServiceServerClient()
    const { data: suggestion, error: fetchError } = await db
      .from('course_category_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single()

    if (fetchError) throw fetchError

    let approvedCategoryId: string | null = null
    if (status === 'approved') {
      const slugBase = generateSlug(suggestion.suggested_path) || generateSlug(suggestion.suggested_name)
      const slug = slugBase || `category-${suggestionId.slice(0, 8)}`
      const { data: category, error: categoryError } = await db
        .from('course_categories')
        .upsert({
          parent_id: suggestion.parent_id,
          name: suggestion.suggested_name,
          slug,
          status: 'approved',
          created_by: suggestion.creator_id,
        }, { onConflict: 'slug' })
        .select()
        .single()

      if (categoryError) throw categoryError
      approvedCategoryId = category.id
    }

    const reviewNotes = typeof body.review_notes === 'string'
      ? body.review_notes.trim().slice(0, 1000)
      : null

    const { data, error } = await db
      .from('course_category_suggestions')
      .update({
        status,
        approved_category_id: approvedCategoryId,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        review_notes: reviewNotes,
      })
      .eq('id', suggestionId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[studio/category-suggestions PATCH]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
