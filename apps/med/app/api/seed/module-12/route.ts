import { NextRequest, NextResponse } from 'next/server'
import { seedModule12 } from '@/lib/db/module-12-content'

/**
 * POST /api/seed/module-12
 *
 * Seeds Module 12 ("Family Communication in Emergencies") into the Emergency
 * Nursing Communication course. The module shell ALREADY EXISTS — this inserts
 * lessons and steps only.
 *
 * Request body:
 * {
 *   "moduleId": "07174243-2f51-4d1d-bfb1-4756cb2cfff7"
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

    console.log(`🌱 Seeding Module 12 for module: ${moduleId}`)

    await seedModule12(moduleId)

    return NextResponse.json(
      { success: true, message: 'Module 12 seeded successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed Module 12' },
      { status: 500 }
    )
  }
}
