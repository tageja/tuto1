'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  UserPlus,
  Shield,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

export function TutoAdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/tutoadmin' },
    { icon: Building2, label: 'Schools', href: '/tutoadmin/schools' },
    { icon: UserPlus, label: 'Onboard School', href: '/tutoadmin/schools/onboard' },
    { icon: BarChart3, label: 'Analytics', href: '/tutoadmin/analytics' },
    { icon: MessageSquare, label: 'Feedback', href: '/tutoadmin/feedback' },
    { icon: Shield, label: 'Community Moderation', href: '/tutoadmin/moderation' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/tutoadmin') {
      return pathname === '/tutoadmin';
    }
    // For "Onboard School", only match exact path
    if (href === '/tutoadmin/schools/onboard') {
      return pathname === '/tutoadmin/schools/onboard';
    }
    // For "Schools", match /tutoadmin/schools but NOT /tutoadmin/schools/onboard
    if (href === '/tutoadmin/schools') {
      return pathname === '/tutoadmin/schools' || 
        (pathname?.startsWith('/tutoadmin/schools/') && !pathname?.startsWith('/tutoadmin/schools/onboard'));
    }
    if (href === '/tutoadmin/feedback') {
      return pathname === '/tutoadmin/feedback' || pathname?.startsWith('/tutoadmin/feedback/');
    }
    // Default: starts with check
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <Link href="/tutoadmin" className="block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text">tuto. admin</h1>
              <p className="text-xs text-text-muted">Internal Management</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text hover:bg-surface'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'T'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {user?.name || 'Tuto Admin'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-center text-text-muted">
          Tuto Global Admin Portal
        </p>
      </div>
    </div>
  );
}

