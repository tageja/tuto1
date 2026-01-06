/**
 * Supabase Auth Callback Route
 * Handles OAuth redirects (Google, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createServerSupabaseClient();
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  // Redirect to welcome after successful auth
  return NextResponse.redirect(`${origin}/welcome`);
}

