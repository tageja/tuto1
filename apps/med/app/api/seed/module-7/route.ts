import { NextRequest, NextResponse } from 'next/server'
import { seedModule7 } from '@/lib/db/module-7-content'

/**
 * POST /api/seed/module-7
 *
 * Seeds Module 7 ("Red Flags & Escalation") into the Emergency Nursing
 * Communication course. The module shell ALREADY EXISTS — this inserts
 * lessons and steps only.
 *
 * Request body:
 * {
 *   "moduleId": "9ca8fd8d-10a5-4131-9f13-56144b938a8d"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Module 7 seeded successfully"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { moduleId } = body

    if (!moduleId) {
      return NextResponse.json(
        { error: 'moduleId is required' },
        { status: 400 }
      )
    }

    console.log(`🌱 Seeding Module 7 for module: ${moduleId}`)

    await seedModule7(moduleId)

    return NextResponse.json(
      {
        success: true,
        message: 'Module 7 seeded successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed Module 7',
      },
      { status: 500 }
    )
  }
}
