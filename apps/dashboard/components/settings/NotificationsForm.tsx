'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../ui/Card';
import { NOTIFICATION_CHANNELS, NOTIFICATION_TOPICS } from '../../lib/validation/settings';

interface NotificationPref {
  channel: string;
  topic: string;
  enabled: boolean;
}

interface NotificationsFormProps {
  initialData: NotificationPref[] | null;
  onSave: (prefs: NotificationPref[]) => Promise<void>;
  onEnablePush: () => Promise<void>;
  pushEnabled?: boolean;
  isLoading?: boolean;
}

export function NotificationsForm({ 
  initialData, 
  onSave, 
  onEnablePush,
  pushEnabled = false,
  isLoading 
}: NotificationsFormProps) {
  const { t } = useI18n();
  
  // Initialize matrix with all enabled by default
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    for (const channel of NOTIFICATION_CHANNELS) {
      m[channel] = {};
      for (const topic of NOTIFICATION_TOPICS) {
        m[channel][topic] = true;
      }
    }
    return m;
  });
  
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);

  // Initialize from data
  useEffect(() => {
    if (initialData) {
      const m: Record<string, Record<string, boolean>> = {};
      for (const channel of NOTIFICATION_CHANNELS) {
        m[channel] = {};
        for (const topic of NOTIFICATION_TOPICS) {
          const pref = initialData.find(p => p.channel === channel && p.topic === topic);
          m[channel][topic] = pref?.enabled ?? true;
        }
      }
      setMatrix(m);
    }
  }, [initialData]);

  const handleToggle = (channel: string, topic: string) => {
    setMatrix(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [topic]: !prev[channel][topic],
      },
    }));
    setIsDirty(true);
    setError(null);
    setSuccess(false);
  };

  const handleToggleRow = (topic: string) => {
    const allEnabled = NOTIFICATION_CHANNELS.every(ch => matrix[ch][topic]);
    setMatrix(prev => {
      const m = { ...prev };
      for (const channel of NOTIFICATION_CHANNELS) {
        m[channel] = { ...m[channel], [topic]: !allEnabled };
      }
      return m;
    });
    setIsDirty(true);
  };

  const handleToggleColumn = (channel: string) => {
    const allEnabled = NOTIFICATION_TOPICS.every(topic => matrix[channel][topic]);
    setMatrix(prev => {
      const m = { ...prev };
      m[channel] = {};
      for (const topic of NOTIFICATION_TOPICS) {
        m[channel][topic] = !allEnabled;
      }
      return m;
    });
    setIsDirty(true);
  };

  const handleEnablePush = async () => {
    setEnablingPush(true);
    setError(null);
    try {
      await onEnablePush();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('settings.notifications.pushError'));
    } finally {
      setEnablingPush(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const prefs: NotificationPref[] = [];
      for (const channel of NOTIFICATION_CHANNELS) {
        for (const topic of NOTIFICATION_TOPICS) {
          prefs.push({
            channel,
            topic,
            enabled: matrix[channel][topic],
          });
        }
      }
      await onSave(prefs);
      setSuccess(true);
      setIsDirty(false);
    } catch (err: any) {
      setError(err.message || t('settings.toasts.error'));
    } finally {
      setSaving(false);
    }
  };

  const topicLabels: Record<string, string> = {
    announcements: t('settings.notifications.topics.announcements'),
    homework: t('settings.notifications.topics.homework'),
    events: t('settings.notifications.topics.events'),
    payments: t('settings.notifications.topics.payments'),
    messages: t('settings.notifications.topics.messages'),
    health: t('settings.notifications.topics.health'),
  };

  const channelLabels: Record<string, string> = {
    email: t('settings.notifications.channels.email'),
    push: t('settings.notifications.channels.push'),
    sms: t('settings.notifications.channels.sms'),
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{t('settings.notifications.title')}</h3>
          
          {/* Push Notification Enable Button */}
          {!pushEnabled && (
            <button
              type="button"
              onClick={handleEnablePush}
              disabled={enablingPush}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {enablingPush ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
              {t('settings.notifications.enablePush')}
            </button>
          )}
          
          {pushEnabled && (
            <span className="flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('settings.notifications.pushEnabled')}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4">{t('settings.notifications.description')}</p>

        {/* Notification Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 pr-4 text-sm font-medium text-gray-700">
                  {t('settings.notifications.topic')}
                </th>
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <th key={channel} className="text-center px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleColumn(channel)}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                      {channelLabels[channel]}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TOPICS.map((topic) => (
                <tr key={topic} className="border-b border-gray-100">
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => handleToggleRow(topic)}
                      className="text-sm text-gray-700 hover:text-blue-600"
                    >
                      {topicLabels[topic]}
                    </button>
                  </td>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <td key={channel} className="text-center px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(channel, topic)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          matrix[channel]?.[topic] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            matrix[channel]?.[topic] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {t('settings.toasts.saved')}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDirty && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('common.saving')}
              </span>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </form>
    </Card>
  );
}

export default NotificationsForm;

