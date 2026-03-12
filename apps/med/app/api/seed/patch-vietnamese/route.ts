import { NextRequest, NextResponse } from 'next/server'
import { patchVietnameseModules } from '@/lib/db/patch-vietnamese-modules'

/**
 * POST /api/seed/patch-vietnamese
 *
 * Updates modules 5–12 with Vietnamese title_vi and description_vi.
 * Use after seeding to ensure module headlines display in Vietnamese.
 *
 * Request body:
 * {
 *   "courseId": "9113d5cb-cedb-4bea-9678-7321020230e8"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      )
    }

    const result = await patchVietnameseModules(courseId)

    return NextResponse.json(
      {
        success: true,
        message: 'Vietnamese module translations patched',
        ...result,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Patch failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to patch Vietnamese',
      },
      { status: 500 }
    )
  }
}
