import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Root page — checks auth and redirects accordingly.
 * Authenticated → /feed
 * Unauthenticated → /login (also handled by middleware, this is a fallback)
 */
export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/feed');
  } else {
    redirect('/login');
  }
}
