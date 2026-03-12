import { NextRequest, NextResponse } from 'next/server'
import { seedModule11 } from '@/lib/db/module-11-content'

/**
 * POST /api/seed/module-11
 *
 * Seeds Module 11 ("Trauma & Acute Injuries") into the Emergency
 * Nursing Communication course. The module shell ALREADY EXISTS — this inserts
 * lessons and steps only.
 *
 * Request body:
 * {
 *   "moduleId": "04ba2139-65d1-450b-8721-7d6edbe56455"
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

    console.log(`🌱 Seeding Module 11 for module: ${moduleId}`)

    await seedModule11(moduleId)

    return NextResponse.json(
      { success: true, message: 'Module 11 seeded successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed Module 11' },
      { status: 500 }
    )
  }
}
