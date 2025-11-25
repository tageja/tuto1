'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ParentAnnouncementCard } from '../../../../../components/announcements/ParentAnnouncementCard';
import { AnnouncementFilters } from '../../../../../components/announcements/AnnouncementFilters';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../components/shared/ErrorState';
import { Toast } from '../../../../../components/ui/Toast';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useSchool } from '../../../../../contexts/SchoolContext';
import { supabase } from '../../../../../lib/supabase';
import { Announcement, AnnouncementTab, AnnouncementRead } from '../../../../../components/announcements/types';

export default function ParentAnnouncementsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readReceipts, setReadReceipts] = useState<AnnouncementRead[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<AnnouncementTab>((searchParams.get('tab') as AnnouncementTab) || 'active');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const deepLinkId = searchParams.get('id');

  // Refs for deep linking
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get current user ID on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get the users table ID from auth_user_id
          const { data: userProfile } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();
          
          if (userProfile) {
            setCurrentUserId(userProfile.id);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          schoolId,
          status: 'Published',
          tab: activeTab,
        });

        if (searchQuery) {
          params.append('q', searchQuery);
        }

        if (deepLinkId) {
          params.append('id', deepLinkId);
        }

        const response = await fetch(`/api/school/announcements?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }

        const data = await response.json();
        setAnnouncements(data.data || []);
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        setError(err.message || 'Failed to load announcements');
      } finally {
        setIsLoading(false);
      }
    };

    if (schoolId) {
      fetchAnnouncements();
    }
  }, [schoolId, activeTab, searchQuery, deepLinkId]);

  // Scroll to deep-linked announcement
  useEffect(() => {
    if (deepLinkId && !isLoading && cardRefs.current[deepLinkId]) {
      setTimeout(() => {
        cardRefs.current[deepLinkId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [deepLinkId, isLoading]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'active') params.set('tab', activeTab);
    if (searchQuery) params.set('q', searchQuery);
    if (deepLinkId) params.set('id', deepLinkId);

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl);
  }, [activeTab, searchQuery, deepLinkId, router]);

  const handleTabChange = (tab: AnnouncementTab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setActiveTab('active');
    setSearchQuery('');
  };

  const handleMarkAsRead = async (announcementId: string) => {
    if (!currentUserId) {
      setToast({
        message: 'Please log in to mark announcements as read',
        type: 'error',
      });
      return;
    }

    try {
      const response = await fetch(`/api/school/announcements/${announcementId}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setReadReceipts((prev) => [
        ...prev,
        { announcement_id: announcementId, user_id: currentUserId, read_at: new Date().toISOString() },
      ]);

      setToast({
        message: t('dashboard.announcements.messages.markReadSuccess'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      setToast({
        message: t('dashboard.announcements.messages.createError'),
        type: 'error',
      });
    }
  };

  const isAnnouncementRead = (announcementId: string) => {
    return readReceipts.some((r) => r.announcement_id === announcementId);
  };

  // Filter announcements for urgent tab (pin urgent at top)
  const displayedAnnouncements =
    activeTab === 'urgent'
      ? announcements
      : announcements.sort((a, b) => {
          if (a.priority === 'Urgent' && b.priority !== 'Urgent') return -1;
          if (a.priority !== 'Urgent' && b.priority === 'Urgent') return 1;
          return 0;
        });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('dashboard.announcements.title')}
          </h1>
          <p className="text-gray-600">{t('dashboard.announcements.subtitle')}</p>
        </div>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('dashboard.announcements.title')}
          </h1>
          <p className="text-gray-600">{t('dashboard.announcements.subtitle')}</p>
        </div>
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('dashboard.announcements.title')}
        </h1>
        <p className="text-gray-600">{t('dashboard.announcements.subtitle')}</p>
      </div>

      {/* Filters */}
      <AnnouncementFilters
        role="parent"
        activeTab={activeTab}
        searchQuery={searchQuery}
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {/* Announcements List */}
      <div className="space-y-4">
        {displayedAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {activeTab === 'urgent'
                ? t('dashboard.announcements.empty.noUrgent')
                : activeTab === 'expired'
                ? t('dashboard.announcements.empty.noExpired')
                : t('dashboard.announcements.empty.noActive')}
            </p>
          </div>
        ) : (
          displayedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              ref={(el) => {
                cardRefs.current[announcement.id] = el;
              }}
            >
              <ParentAnnouncementCard
                announcement={announcement}
                isRead={isAnnouncementRead(announcement.id)}
                isHighlighted={deepLinkId === announcement.id}
                onMarkAsRead={handleMarkAsRead}
              />
            </div>
          ))
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
