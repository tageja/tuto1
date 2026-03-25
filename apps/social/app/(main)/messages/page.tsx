import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import MessagesIndexClient from './MessagesIndexClient';

export default async function MessagesIndexPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: myProfile } = await supabase
    .from('social_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const myProfileId = myProfile?.id as string | undefined;
  if (!myProfileId) redirect('/login');

  return <MessagesIndexClient myProfileId={myProfileId} />;
}
