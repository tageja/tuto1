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
  BrandingForm,
  IntegrationsForm,
} from '../../../../../components/settings';
import { ParentPinDisplay } from '../../../../../components/school/ParentPinDisplay';

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

interface BrandingData {
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  logo_url: string | null;
  primary_hex: string;
  accent_hex: string;
  header_img_url: string | null;
}

interface Integration {
  id: string;
  type: 'payments' | 'push' | 'sms';
  provider: string;
  config: Record<string, any>;
  connected_at: string;
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

const ADMIN_TABS: SettingsTab[] = ['profile', 'preferences', 'integrations', 'notifications'];

export default function AdminSettingsPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const resolvedParams = use(params);
  const decodedSchoolId = decodeURIComponent(resolvedParams.schoolId);
  
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const { school } = useSchool();
  const { user, updateUserAvatar, updateUserName } = useAuth();
  
  const activeTab = (searchParams.get('tab') as SettingsTab) || 'profile';
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [notifications, setNotifications] = useState<NotificationPref[] | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [parentPin, setParentPin] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

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

  // Fetch branding data
  const fetchBranding = useCallback(async () => {
    try {
      const res = await fetch(`/api/school/settings/branding?schoolId=${encodeURIComponent(decodedSchoolId)}`);
      const data = await res.json();
      if (data.success) {
        setBranding(data.data);
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  }, [decodedSchoolId]);

  // Fetch integrations
  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/school/settings/integrations?schoolId=${encodeURIComponent(decodedSchoolId)}`);
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  }, [decodedSchoolId]);

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

  // Fetch parent PIN
  const fetchParentPin = useCallback(async () => {
    try {
      setPinLoading(true);
      
      // Get auth token from Supabase client
      const { supabase } = await import('../../../../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/school/parent-pin?schoolId=${encodeURIComponent(decodedSchoolId)}`, {
        headers,
      });
      const data = await res.json();
      console.log('🔑 PIN API Response (Settings):', { success: data.success, pin: data.pin, error: data.error });
      if (data.success && data.pin) {
        setParentPin(data.pin);
      } else {
        console.warn('⚠️ PIN not loaded in settings:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error fetching parent PIN:', error);
    } finally {
      setPinLoading(false);
    }
  }, [decodedSchoolId]);

  // Load data on mount and tab change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      await fetchProfile();
      
      if (activeTab === 'integrations') {
        await Promise.all([fetchBranding(), fetchIntegrations(), fetchParentPin()]);
      } else if (activeTab === 'notifications') {
        await Promise.all([fetchNotifications(), fetchDevices(), fetchPushStatus()]);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [activeTab, fetchProfile, fetchBranding, fetchIntegrations, fetchNotifications, fetchDevices, fetchPushStatus]);

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

  const handleBrandingSave = async (data: Partial<BrandingData>) => {
    const res = await fetch(`/api/school/settings/branding?schoolId=${encodeURIComponent(decodedSchoolId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    setBranding(prev => prev ? { ...prev, ...data } : null);
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleLogoUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`/api/school/settings/branding-upload?schoolId=${encodeURIComponent(decodedSchoolId)}&type=logo`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data.url;
  };

  const handleHeaderUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`/api/school/settings/branding-upload?schoolId=${encodeURIComponent(decodedSchoolId)}&type=header`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data.url;
  };

  const handleIntegrationConnect = async (type: string, provider: string, config: Record<string, any>) => {
    const res = await fetch(`/api/school/settings/integrations?schoolId=${encodeURIComponent(decodedSchoolId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, provider, config }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    await fetchIntegrations();
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleIntegrationDisconnect = async (type: string) => {
    const res = await fetch(`/api/school/settings/integrations?schoolId=${encodeURIComponent(decodedSchoolId)}&type=${type}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    await fetchIntegrations();
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
      
      case 'integrations':
        return (
          <div className="space-y-6">
            {/* Parent PIN Display */}
            {pinLoading && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Loading PIN code...</p>
              </div>
            )}
            {!pinLoading && parentPin && (
              <ParentPinDisplay pin={parentPin} schoolName={school?.name || decodedSchoolId} />
            )}
            {!pinLoading && !parentPin && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ PIN code not available. Check browser console. Migration may need to be applied.
                </p>
              </div>
            )}
            <BrandingForm
              initialData={branding}
              onSave={handleBrandingSave}
              onLogoUpload={handleLogoUpload}
              onHeaderUpload={handleHeaderUpload}
              isLoading={loading}
            />
            <IntegrationsForm
              integrations={integrations}
              onConnect={handleIntegrationConnect}
              onDisconnect={handleIntegrationDisconnect}
              isLoading={loading}
            />
          </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('settings.subtitle')} • {school?.name || decodedSchoolId}
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs 
        tabs={ADMIN_TABS} 
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
