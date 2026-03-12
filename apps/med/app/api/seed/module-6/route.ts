import { NextRequest, NextResponse } from 'next/server'
import { seedModule6 } from '@/lib/db/module-6-content'

/**
 * POST /api/seed/module-6
 *
 * Seeds Module 6 ("Reassurance Under Pressure") into the Emergency Nursing
 * Communication course. The module shell ALREADY EXISTS — this inserts
 * lessons and steps only.
 *
 * Request body:
 * {
 *   "moduleId": "26535094-0926-4787-8c98-66afb0640051"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Module 6 seeded successfully"
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

    console.log(`🌱 Seeding Module 6 for module: ${moduleId}`)

    await seedModule6(moduleId)

    return NextResponse.json(
      {
        success: true,
        message: 'Module 6 seeded successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed Module 6',
      },
      { status: 500 }
    )
  }
}
