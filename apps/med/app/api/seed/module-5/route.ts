import { NextRequest, NextResponse } from 'next/server'
import { seedModule5 } from '@/lib/db/module-5-content'

/**
 * POST /api/seed/module-5
 *
 * Seeds Module 5 ("Communicating Patient Deterioration & Escalation Protocols")
 * into the Emergency Nursing Communication course.
 *
 * Request body:
 * {
 *   "courseId": "uuid-of-emergency-nursing-course"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Module 5 seeded successfully",
 *   "moduleId": "uuid-of-module-5"
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

    console.log(`🌱 Seeding Module 5 for course: ${courseId}`)

    const module = await seedModule5(courseId)

    return NextResponse.json(
      {
        success: true,
        message: 'Module 5 seeded successfully',
        moduleId: module.id,
        module,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Seeding failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed Module 5',
      },
      { status: 500 }
    )
  }
}
