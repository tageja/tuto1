'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSchool } from '../../../../../contexts/SchoolContext';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import {
  SettingsTabs,
  SettingsTab,
  ProfileForm,
  PreferencesForm,
  NotificationsForm,
  DevicesList,
  PrivacyPanel,
} from '../../../../../components/settings';

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

const PARENT_TABS: SettingsTab[] = ['profile', 'preferences', 'notifications', 'privacy'];

export default function ParentSettingsPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const resolvedParams = use(params);
  const decodedSchoolId = decodeURIComponent(resolvedParams.schoolId);
  
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { school } = useSchool();
  const { user, updateUserAvatar, updateUserName } = useAuth();
  
  const activeTab = (searchParams.get('tab') as SettingsTab) || 'profile';
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [notifications, setNotifications] = useState<NotificationPref[] | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/profile?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user?.id]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/notifications?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user?.id]);

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/devices?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setDevices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  }, [user?.id]);

  // Fetch push status
  const fetchPushStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/school/settings/push-subscription?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setPushEnabled(data.data.subscribed);
      }
    } catch (error) {
      console.error('Error fetching push status:', error);
    }
  }, [user?.id]);

  // Load data on mount and tab change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      await fetchProfile();
      
      if (activeTab === 'notifications') {
        await Promise.all([fetchNotifications(), fetchDevices(), fetchPushStatus()]);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [activeTab, fetchProfile, fetchNotifications, fetchDevices, fetchPushStatus]);

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
    setProfile(prev => prev ? { ...prev, ...data } : null);
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
    
    setProfile(prev => prev ? { ...prev, avatar_url: result.data.avatar_url } : null);
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
    setProfile(prev => prev ? { ...prev, ...data } : null);
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
    if (permission !== 'granted') {
      throw new Error('Permission denied');
    }

    // In production, register service worker and get subscription
    // For now, just mark as enabled
    setPushEnabled(true);
  };

  const handleDeviceRevoke = async (deviceId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const res = await fetch(`/api/school/settings/devices?userId=${user.id}&id=${deviceId}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileForm
            initialData={profile}
            onSave={handleProfileSave}
            onAvatarUpload={handleAvatarUpload}
            onAvatarUpdated={updateUserAvatar}
            onNameUpdated={updateUserName}
            isLoading={loading}
          />
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
      
      case 'privacy':
        return <PrivacyPanel isLoading={loading} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('settings.parentSubtitle')} • {school?.name || decodedSchoolId}
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs 
        tabs={PARENT_TABS} 
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
