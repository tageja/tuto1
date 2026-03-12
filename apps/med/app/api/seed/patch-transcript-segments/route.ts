import { NextRequest, NextResponse } from 'next/server'
import { patchTranscriptSegments } from '@/lib/db/patch-transcript-segments'

/**
 * POST /api/seed/patch-transcript-segments
 *
 * Adds transcriptSegments (EN→VI) to audio_shadow steps. Enables hover/tap-to-translate.
 *
 * Request body: { courseId?: string }
 * - If courseId provided: patches module 1, lesson 1, step 2 (First emergency contact)
 * - Else: finds steps by transcript content (I am here to help, My chest, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const courseId = body?.courseId as string | undefined
    const result = await patchTranscriptSegments(courseId)

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to patch transcript segments'
    console.error('❌ Patch transcript segments failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
