'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Role-based dashboard redirect.
 * Teachers → /school/teacher, others → /school (school selector / admin or parent).
 */
export default function DashboardRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const role = user.role?.toLowerCase?.() ?? user.role;
    if (role === 'teacher') {
      router.replace('/school/teacher');
    } else {
      router.replace('/school');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
    </div>
  );
}
