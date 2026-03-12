import { NextRequest, NextResponse } from 'next/server'
import { seedModule9 } from '@/lib/db/module-9-content'

/**
 * POST /api/seed/module-9
 *
 * Seeds Module 9 ("Simulation and Emergency Review") into the Emergency
 * Nursing Communication course. The module shell ALREADY EXISTS — this inserts
 * lessons and steps only.
 *
 * Request body:
 * {
 *   "moduleId": "3c3d30a2-3c0f-4f4e-8ff0-593eedc2370c"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Module 9 seeded successfully"
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

    console.log(`🌱 Seeding Module 9 for module: ${moduleId}`)

    await seedModule9(moduleId)

    return NextResponse.json(
      {
        success: true,
        message: 'Module 9 seeded successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed Module 9',
      },
      { status: 500 }
    )
  }
}
