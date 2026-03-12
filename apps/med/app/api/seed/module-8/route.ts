import { NextRequest, NextResponse } from 'next/server'
import { seedModule8 } from '@/lib/db/module-8-content'

/**
 * POST /api/seed/module-8
 *
 * Seeds Module 8 ("Documentation and Rapid Reporting") into the Emergency
 * Nursing Communication course. The module shell ALREADY EXISTS — this inserts
 * lessons and steps only.
 *
 * Request body:
 * {
 *   "moduleId": "f6435350-43d2-4ee4-a749-8523744ad8a7"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Module 8 seeded successfully"
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

    console.log(`🌱 Seeding Module 8 for module: ${moduleId}`)

    await seedModule8(moduleId)

    return NextResponse.json(
      {
        success: true,
        message: 'Module 8 seeded successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed Module 8',
      },
      { status: 500 }
    )
  }
}
