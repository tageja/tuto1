'use client';

import { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../ui/Card';

interface Device {
  id: string;
  device_info: {
    browser?: string;
    os?: string;
    device_type?: string;
  };
  user_agent: string;
  ip_address: string;
  last_seen_at: string;
  created_at: string;
}

interface DevicesListProps {
  devices: Device[];
  onRevoke: (deviceId: string) => Promise<void>;
  isLoading?: boolean;
}

export function DevicesList({ devices, onRevoke, isLoading }: DevicesListProps) {
  const { t, lang } = useI18n();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async (deviceId: string) => {
    setRevokingId(deviceId);
    setError(null);
    try {
      await onRevoke(deviceId);
    } catch (err: any) {
      setError(err.message || t('settings.devices.revokeError'));
    } finally {
      setRevokingId(null);
    }
  };

  const parseUserAgent = (ua: string): { browser: string; os: string; type: string } => {
    let browser = 'Unknown';
    let os = 'Unknown';
    let type = 'desktop';

    // Browser detection
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    // OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) { os = 'Android'; type = 'mobile'; }
    else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; type = 'mobile'; }

    return { browser, os, type };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('settings.devices.justNow');
    if (diffMins < 60) return `${diffMins} ${t('settings.devices.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('settings.devices.hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('settings.devices.daysAgo')}`;
    
    return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getDeviceIcon = (type: string) => {
    if (type === 'mobile') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t('settings.devices.title')}</h3>
      <p className="text-sm text-gray-500 mb-6">{t('settings.devices.description')}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {devices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p>{t('settings.devices.noDevices')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => {
            const info = device.device_info || parseUserAgent(device.user_agent);
            const parsed = parseUserAgent(device.user_agent);
            const browser = info.browser || parsed.browser;
            const os = info.os || parsed.os;
            const type = info.device_type || parsed.type;

            return (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                    {getDeviceIcon(type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {browser} {t('settings.devices.on')} {os}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{device.ip_address}</span>
                      <span>•</span>
                      <span>{formatDate(device.last_seen_at)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(device.id)}
                  disabled={revokingId === device.id}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {revokingId === device.id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t('settings.devices.revoke')
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default DevicesList;

