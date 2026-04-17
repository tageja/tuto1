import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getFullProfile } from '@/lib/db/profile'
import ProfilePageClient from '@/components/learn/ProfilePageClient'

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5 animate-pulse">
      <div className="h-48 bg-surface rounded-2xl border border-border" />
      <div className="flex gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-24 bg-surface rounded-xl border border-border" />
        ))}
      </div>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-surface rounded-2xl border border-border" />
      ))}
    </div>
  )
}

async function ProfileContent() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profileData = await getFullProfile(user.id)
  return <ProfilePageClient data={profileData} />
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}
