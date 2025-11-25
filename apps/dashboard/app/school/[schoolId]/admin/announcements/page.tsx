'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Plus, Zap } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { AdminAnnouncementsTable } from '../../../../../components/announcements/AdminAnnouncementsTable';
import { AnnouncementFilters } from '../../../../../components/announcements/AnnouncementFilters';
import { QuickAddAnnouncementModal } from '../../../../../components/announcements/QuickAddAnnouncementModal';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import { ErrorState } from '../../../../../components/shared/ErrorState';
import { Toast } from '../../../../../components/ui/Toast';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useSchool } from '../../../../../contexts/SchoolContext';
import { supabase } from '../../../../../lib/supabase';
import {
  Announcement,
  AnnouncementTab,
  ClassOption,
  CreateAnnouncementData,
} from '../../../../../components/announcements/types';

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<AnnouncementTab>(
    (searchParams.get('tab') as AnnouncementTab) || 'published'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

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
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch announcements
        const announcementParams = new URLSearchParams({
          schoolId,
        });

        // Map tab to status for admin view
        if (activeTab === 'draft') announcementParams.append('status', 'Draft');
        else if (activeTab === 'published') announcementParams.append('status', 'Published');
        else if (activeTab === 'archived') announcementParams.append('status', 'Archived');

        if (searchQuery) {
          announcementParams.append('q', searchQuery);
        }

        const [announcementsRes, classesRes] = await Promise.all([
          fetch(`/api/school/announcements?${announcementParams.toString()}`),
          fetch(`/api/school/classes?schoolId=${schoolId}`),
        ]);

        if (!announcementsRes.ok) {
          throw new Error('Failed to fetch announcements');
        }

        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData.data || []);

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          // API returns { success: true, data: { records: [...] } }
          setClasses(classesData.data?.records || []);
        } else {
          setClasses([]);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (schoolId) {
      fetchData();
    }
  }, [schoolId, activeTab, searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'published') params.set('tab', activeTab);
    if (searchQuery) params.set('q', searchQuery);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;

    router.replace(newUrl);
  }, [activeTab, searchQuery, router]);

  const handleTabChange = (tab: AnnouncementTab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setActiveTab('published');
    setSearchQuery('');
  };

  const handleQuickAddSubmit = async (data: CreateAnnouncementData) => {
    try {
      const response = await fetch('/api/school/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          created_by: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      const result = await response.json();
      setAnnouncements((prev) => [result.data, ...prev]);
      setToast({
        message: t('dashboard.announcements.messages.createSuccess'),
        type: 'success',
      });
      setShowQuickAdd(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      setToast({
        message: t('dashboard.announcements.messages.createError'),
        type: 'error',
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    router.push(`/school/${schoolId}/admin/announcements/${announcement.id}`);
  };

  const handlePublish = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('dashboard.announcements.confirm.publishTitle'),
      message: t('dashboard.announcements.confirm.publishMessage'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/school/announcements/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Published' }),
          });

          if (!response.ok) {
            throw new Error('Failed to publish announcement');
          }

          const result = await response.json();
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === id ? result.data : a))
          );
          setToast({
            message: t('dashboard.announcements.messages.publishSuccess'),
            type: 'success',
          });
        } catch (error) {
          console.error('Error publishing announcement:', error);
          setToast({
            message: t('dashboard.announcements.messages.publishError'),
            type: 'error',
          });
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleArchive = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('dashboard.announcements.confirm.archiveTitle'),
      message: t('dashboard.announcements.confirm.archiveMessage'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/school/announcements/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Archived' }),
          });

          if (!response.ok) {
            throw new Error('Failed to archive announcement');
          }

          const result = await response.json();
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === id ? result.data : a))
          );
          setToast({
            message: t('dashboard.announcements.messages.archiveSuccess'),
            type: 'success',
          });
        } catch (error) {
          console.error('Error archiving announcement:', error);
          setToast({
            message: t('dashboard.announcements.messages.archiveError'),
            type: 'error',
          });
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch(`/api/school/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Published' }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore announcement');
      }

      const result = await response.json();
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? result.data : a)));
      setToast({
        message: t('dashboard.announcements.messages.restoreSuccess'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error restoring announcement:', error);
      setToast({
        message: t('dashboard.announcements.messages.publishError'),
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('dashboard.announcements.confirm.deleteTitle'),
      message: t('dashboard.announcements.confirm.deleteMessage'),
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/school/announcements/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete announcement');
          }

          setAnnouncements((prev) => prev.filter((a) => a.id !== id));
          setToast({
            message: t('dashboard.announcements.messages.deleteSuccess'),
            type: 'success',
          });
        } catch (error) {
          console.error('Error deleting announcement:', error);
          setToast({
            message: t('dashboard.announcements.messages.deleteError'),
            type: 'error',
          });
        }
        setConfirmDialog(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
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
          <h1 className="text-2xl font-bold text-gray-900">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.announcements.title')}
          </h1>
          <p className="text-gray-600">{t('dashboard.announcements.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowQuickAdd(true)}>
            <Zap className="w-4 h-4" />
            {t('dashboard.announcements.actions.quickAdd')}
          </Button>
          <Button
            className="gap-2"
            onClick={() => router.push(`/school/${schoolId}/admin/announcements/new`)}
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.announcements.actions.create')}
          </Button>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddAnnouncementModal
          isOpen={showQuickAdd}
          schoolId={schoolId}
          onClose={() => setShowQuickAdd(false)}
          onSubmit={handleQuickAddSubmit}
          fullFormRoute={`/school/${schoolId}/admin/announcements/new`}
        />
      )}

      {/* Filters */}
      <AnnouncementFilters
        role="admin"
        activeTab={activeTab}
        searchQuery={searchQuery}
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {/* Announcements Table */}
      <AdminAnnouncementsTable
        announcements={announcements}
        classes={classes}
        onEdit={handleEdit}
        onPublish={handlePublish}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />

      {/* Confirm Dialog */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmDialog.title}
            </h3>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                {t('dashboard.announcements.confirm.cancel')}
              </Button>
              <Button onClick={confirmDialog.onConfirm} className="bg-red-600 hover:bg-red-700">
                {confirmDialog.title.includes('Delete')
                  ? t('dashboard.announcements.confirm.confirmDelete')
                  : confirmDialog.title.includes('Archive')
                  ? t('dashboard.announcements.confirm.confirmArchive')
                  : t('dashboard.announcements.confirm.confirmPublish')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
