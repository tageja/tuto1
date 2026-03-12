import { NextRequest, NextResponse } from 'next/server'
import { seedModule10 } from '@/lib/db/module-10-content'

/**
 * POST /api/seed/module-10
 *
 * Seeds Module 10 ("Emergency Procedures Communication") into the Emergency
 * Nursing Communication course. The module shell ALREADY EXISTS — this inserts
 * lessons and steps only.
 *
 * Request body:
 * {
 *   "moduleId": "8cf9b3c0-1596-484b-923a-aaf41629a40c"
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

    console.log(`🌱 Seeding Module 10 for module: ${moduleId}`)

    await seedModule10(moduleId)

    return NextResponse.json(
      { success: true, message: 'Module 10 seeded successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed Module 10' },
      { status: 500 }
    )
  }
}
