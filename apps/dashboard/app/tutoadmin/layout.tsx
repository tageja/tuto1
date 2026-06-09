'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { TutoAdminSidebar } from '../../components/tutoadmin/TutoAdminSidebar';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * TutoAdmin Layout
 * 
 * Provides:
 * - Authentication guard (only @tutoglobal.com emails)
 * - Sidebar navigation
 * - Header with search
 */
export default function TutoAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, supabaseUser } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  // Check authorization directly from Supabase session (more reliable)
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('[TutoAdmin] Starting auth check...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('[TutoAdmin] Session result:', { 
          hasSession: !!session, 
          email: session?.user?.email,
          error: error?.message 
        });
        
        if (!session?.user?.email) {
          console.log('[TutoAdmin] No session, redirecting to login');
          router.push('/login?redirectTo=/tutoadmin');
          return;
        }

        const email = session.user.email.toLowerCase();
        setSessionEmail(email);
        
        if (!email.endsWith('@tutoglobal.com')) {
          console.warn('[TutoAdmin] Unauthorized access attempt:', email);
          router.push('/home');
          return;
        }

        console.log('[TutoAdmin] Authorized:', email);
        setIsAuthorized(true);
      } catch (error) {
        console.error('[TutoAdmin] Auth check error:', error);
        if (mounted) {
          router.push('/login?redirectTo=/tutoadmin');
        }
      } finally {
        if (mounted) {
          setAuthChecked(true);
        }
      }
    };

    // Wait for auth to initialize before checking
    // Listen for auth state changes and check when ready
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[TutoAdmin] Auth state change:', event, session?.user?.email);
      
      if (event === 'INITIAL_SESSION') {
        // Auth has initialized, now check
        checkAuth();
      } else if (event === 'SIGNED_IN') {
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          router.push('/login?redirectTo=/tutoadmin');
        }
      }
    });

    // Also check immediately in case auth is already ready
    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authorized, show redirecting message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Use user from context if available, otherwise use session email
  const displayEmail = user?.email || sessionEmail;
  const displayName = user?.name || displayEmail?.split('@')[0] || 'Admin';

  // User is authenticated and is a tuto admin - show the content
  return (
    <div className="flex min-h-screen bg-bg">
      <TutoAdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search schools, metrics..."
                  className="w-full pl-10 pr-4 py-2 border border-border bg-card text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Admin badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">Tuto Admin</span>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-text">{displayName}</p>
                  <p className="text-xs text-text-muted">{displayEmail}</p>
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {displayName?.charAt(0)?.toUpperCase() || 'T'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
