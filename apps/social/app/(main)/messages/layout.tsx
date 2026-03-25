import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

// Auth guard only. Each child page manages its own two-panel layout so there
// is never more than one ConversationList mounted at a time (fixes BUG-048/049).
export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-white">
      {children}
    </div>
  );
}
