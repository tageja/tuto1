'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Calendar, Award } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { LoadingState } from '../../../../../components/shared/LoadingState';
import {
  SettingsTabs,
  SettingsTab,
  ProfileForm,
  PreferencesForm,
  NotificationsForm,
  DevicesList,
} from '../../../../../components/settings';

interface TeachingInfo {
  subjects: string[] | null;
  hire_date: string | null;
  qualifications: string | null;
  status: string;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  locale: 'en' | 'vi';
  theme: 'system' | 'light' | 'dark';
  timezone: string;
  twofa_enabled: boolean;
}

interface NotificationPref {
  channel: string;
  topic: string;
  enabled: boolean;
}

interface Device {
  id: string;
  device_info: { browser?: string; os?: string; device_type?: string };
  user_agent: string;
  ip_address: string;
  last_seen_at: string;
  created_at: string;
}

const TEACHER_TABS: SettingsTab[] = ['profile', 'preferences', 'notifications'];

export default function TeacherSettingsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();
  const { user, accessToken, updateUserAvatar, updateUserName } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);

  const activeTab = (searchParams.get('tab') as SettingsTab) || 'profile';

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [teachingInfo, setTeachingInfo] = useState<TeachingInfo | null>(null);
  const [notifications, setNotifications] = useState<NotificationPref[] | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const authHeaders = useCallback(
    (): Record<string, string> => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  // Fetch user profile (same endpoint as admin)
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/profile?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setProfile(data.data);
    } catch (e) {
      console.error('Profile fetch error:', e);
    }
  }, [user?.id]);

  // Fetch teacher-specific teaching info from school_teachers table
  const fetchTeachingInfo = useCallback(async () => {
    if (!accessToken) return;
    try {
      const classRes = await fetch(
        `/api/school/teacher/classes?schoolId=${encodedSchoolId}`,
        { headers: authHeaders() }
      );
      const classData = await classRes.json();
      const records: any[] = classData?.data?.records ?? [];
      if (records.length === 0) return;

      const teacherId = records[0]?.teacher_id;
      if (!teacherId) return;

      const tRes = await fetch(`/api/school/teachers/${teacherId}?schoolId=${encodedSchoolId}`);
      if (!tRes.ok) return;
      const tData = await tRes.json();
      const td = tData?.data ?? tData;
      setTeachingInfo({
        subjects: Array.isArray(td.subjects) ? td.subjects : null,
        hire_date: td.hire_date || null,
        qualifications: td.qualifications || null,
        status: td.status || 'active',
      });
    } catch (e) {
      console.error('Teaching info fetch error:', e);
    }
  }, [encodedSchoolId, accessToken, authHeaders]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/notifications?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setNotifications(data.data.preferences);
    } catch (e) {
      console.error('Notifications fetch error:', e);
    }
  }, [user?.id]);

  const fetchDevices = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/devices?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setDevices(data.data || []);
    } catch (e) {
      console.error('Devices fetch error:', e);
    }
  }, [user?.id]);

  const fetchPushStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/push-subscription?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setPushEnabled(data.data.subscribed);
    } catch (e) {
      console.error('Push status fetch error:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProfile();
      if (activeTab === 'profile') {
        await fetchTeachingInfo();
      } else if (activeTab === 'notifications') {
        await Promise.all([fetchNotifications(), fetchDevices(), fetchPushStatus()]);
      }
      setLoading(false);
    };
    load();
  }, [activeTab, fetchProfile, fetchTeachingInfo, fetchNotifications, fetchDevices, fetchPushStatus]);

  // Save handlers
  const handleProfileSave = async (data: Partial<ProfileData>) => {
    if (!user?.id) throw new Error('Not authenticated');
    const res = await fetch(`/api/school/settings/profile?userId=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('Not authenticated');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/school/settings/avatar?userId=${user.id}`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    setProfile((prev) => (prev ? { ...prev, avatar_url: result.data.avatar_url } : null));
    return result.data.avatar_url;
  };

  const handlePreferencesSave = async (data: { locale: 'en' | 'vi'; theme: 'system' | 'light' | 'dark'; timezone: string }) => {
    if (!user?.id) throw new Error('Not authenticated');
    const res = await fetch(`/api/school/settings/profile?userId=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleNotificationsSave = async (prefs: NotificationPref[]) => {
    if (!user?.id) throw new Error('Not authenticated');
    const res = await fetch(`/api/school/settings/notifications?userId=${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: prefs }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    setNotifications(prefs);
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permission denied');
    setPushEnabled(true);
  };

  const handleDeviceRevoke = async (deviceId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const res = await fetch(`/api/school/settings/devices?userId=${user.id}&id=${deviceId}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
    } catch { return d; }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <ProfileForm
              initialData={profile}
              onSave={handleProfileSave}
              onAvatarUpload={handleAvatarUpload}
              onAvatarUpdated={updateUserAvatar}
              onNameUpdated={updateUserName}
              isLoading={loading}
            />
            {/* Teaching Info — read-only card below profile form */}
            {!loading && teachingInfo && (
              <Card className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  {lang === 'vi' ? 'Thông tin giảng dạy' : 'Teaching Info'}
                </h3>
                <div className="space-y-4 text-sm">
                  {teachingInfo.subjects && teachingInfo.subjects.length > 0 && (
                    <div>
                      <p className="text-gray-500 mb-1.5">{lang === 'vi' ? 'Môn giảng dạy' : 'Subjects'}</p>
                      <div className="flex flex-wrap gap-2">
                        {teachingInfo.subjects.map((s) => (
                          <span key={s} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {teachingInfo.hire_date && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500">{lang === 'vi' ? 'Ngày vào trường' : 'Hire date'}</p>
                        <p className="text-gray-900">{formatDate(teachingInfo.hire_date)}</p>
                      </div>
                    </div>
                  )}
                  {teachingInfo.qualifications && (
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-500">{lang === 'vi' ? 'Bằng cấp / Chứng chỉ' : 'Qualifications'}</p>
                        <p className="text-gray-900">{teachingInfo.qualifications}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 mb-1">{lang === 'vi' ? 'Trạng thái' : 'Status'}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      teachingInfo.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {teachingInfo.status === 'active'
                        ? (lang === 'vi' ? 'Đang dạy' : 'Active')
                        : teachingInfo.status === 'inactive'
                          ? (lang === 'vi' ? 'Không hoạt động' : 'Inactive')
                          : teachingInfo.status}
                    </span>
                  </div>
                </div>
              </Card>
            )}
            {!loading && !teachingInfo && (
              <Card className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  {lang === 'vi' ? 'Thông tin giảng dạy' : 'Teaching Info'}
                </h3>
                <p className="text-sm text-gray-500">
                  {lang === 'vi' ? 'Không có thông tin giảng dạy.' : 'No teaching info available.'}
                </p>
              </Card>
            )}
          </div>
        );

      case 'preferences':
        return (
          <PreferencesForm
            initialData={profile ? {
              locale: profile.locale,
              theme: profile.theme,
              timezone: profile.timezone,
            } : null}
            onSave={handlePreferencesSave}
            isLoading={loading}
          />
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <NotificationsForm
              initialData={notifications}
              onSave={handleNotificationsSave}
              onEnablePush={handleEnablePush}
              pushEnabled={pushEnabled}
              isLoading={loading}
            />
            <DevicesList
              devices={devices}
              onRevoke={handleDeviceRevoke}
              isLoading={loading}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title') || t('settings')}</h1>
        <p className="text-gray-600 mt-1">
          {lang === 'vi' ? 'Quản lý hồ sơ, tùy chọn và thông báo của bạn' : 'Manage your profile, preferences, and notifications'}
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs
        tabs={TEACHER_TABS}
        activeTab={activeTab}
        lastSaved={lastSaved}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
