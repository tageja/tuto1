import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { getUserFromBearer } from '../../../../lib/school/apiAuth';

type ContentType = 'post' | 'reel' | 'story';
type ModerationAction = 'approve' | 'reject';

interface ModerateBody {
  type: ContentType;
  id: string;
  action: ModerationAction;
}

const TABLE_MAP: Record<ContentType, string> = {
  post: 'social_posts',
  reel: 'social_reels',
  story: 'social_stories',
};

const STATUS_MAP: Record<ModerationAction, string> = {
  approve: 'ai_reviewed',
  reject: 'rejected',
};

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<ModerateBody>;
    const { type, id, action } = body;

    if (!type || !id || !action) {
      return NextResponse.json(
        { success: false, error: 'type, id, and action are required' },
        { status: 400 }
      );
    }

    if (!['post', 'reel', 'story'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const db = createServerSupabaseClient();
    const table = TABLE_MAP[type];
    const newStatus = STATUS_MAP[action];

    const { error } = await db
      .from(table)
      .update({ moderation_status: newStatus })
      .eq('id', id);

    if (error) {
      console.error(`[social/moderate] DB update failed:`, error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Best-effort: keep social_moderation_queue in sync for posts
    if (type === 'post') {
      const queueStatus = action === 'approve' ? 'approved' : 'rejected';
      await db
        .from('social_moderation_queue')
        .update({
          status: queueStatus,
          moderator_type: 'manual',
          decision_at: new Date().toISOString(),
        })
        .eq('post_id', id)
        .eq('status', 'pending');
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('[social/moderate] Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
