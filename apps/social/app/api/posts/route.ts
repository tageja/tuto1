// Server-side post creation — uses cookie-based auth so RLS auth.uid() is always correct
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type Visibility = 'public' | 'schoolOnly' | 'classOnly' | 'followers' | 'private';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('social_profiles')
      .select('id, school_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: 'Profile lookup failed', detail: profileError.message }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ error: 'Social profile not found' }, { status: 404 });
    }

    const body = await request.json() as {
      content: string;
      visibility: Visibility;
      subjects: string[];
    };

    const { content, visibility, subjects } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const VALID_VISIBILITIES: Visibility[] = ['public', 'schoolOnly', 'classOnly', 'followers', 'private'];
    if (!VALID_VISIBILITIES.includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
    }

    const { data: post, error: insertError } = await supabase
      .from('social_posts')
      .insert({
        author_id:        profile.id,
        school_id:        profile.school_id,
        post_type:        'text',
        content:          content.trim(),
        visibility,
        subjects:         subjects ?? [],
        moderation_status: 'pending',
        media_urls:       [],
      })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message, code: insertError.code }, { status: 500 });
    }

    // Trigger AI content screening (async — do not block response)
    supabase.functions.invoke('social-moderation', {
      body: { action: 'screenPost', postId: post.id },
    }).catch(() => {});

    return NextResponse.json({ success: true, postId: post.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
