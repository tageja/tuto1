import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';
import { redirect }           from 'next/navigation';
import type { Metadata }      from 'next';
import CreatePageClient       from './CreatePageClient';

export const metadata: Metadata = {
  title: 'Tạo bài viết — Tuto Community',
};

export default async function CreatePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <CreatePageClient />;
}
