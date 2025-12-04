'use client';

import { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../ui/Card';

interface Integration {
  id: string;
  type: 'payments' | 'push' | 'sms';
  provider: string;
  config: Record<string, any>;
  connected_at: string;
}

interface IntegrationsFormProps {
  integrations: Integration[];
  onConnect: (type: string, provider: string, config: Record<string, any>) => Promise<void>;
  onDisconnect: (type: string) => Promise<void>;
  isLoading?: boolean;
}

type IntegrationType = 'payments' | 'push' | 'sms';

const PROVIDERS: Record<IntegrationType, { name: string; icon: string }[]> = {
  payments: [
    { name: 'stripe', icon: '💳' },
    { name: 'momo', icon: '💰' },
  ],
  push: [
    { name: 'onesignal', icon: '🔔' },
    { name: 'webpush', icon: '🌐' },
  ],
  sms: [
    { name: 'twilio', icon: '📱' },
    { name: 'nexmo', icon: '📲' },
  ],
};

export function IntegrationsForm({ integrations, onConnect, onDisconnect, isLoading }: IntegrationsFormProps) {
  const { t, lang } = useI18n();
  const [expandedType, setExpandedType] = useState<IntegrationType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getIntegration = (type: IntegrationType) => {
    return integrations.find(i => i.type === type);
  };

  const handleExpand = (type: IntegrationType) => {
    setExpandedType(expandedType === type ? null : type);
    setSelectedProvider('');
    setConfig({});
    setError(null);
    setSuccess(false);
  };

  const handleConnect = async (type: IntegrationType) => {
    if (!selectedProvider) {
      setError(t('settings.integrations.selectProvider'));
      return;
    }

    setConnecting(true);
    setError(null);
    setSuccess(false);

    try {
      await onConnect(type, selectedProvider, config);
      setSuccess(true);
      setExpandedType(null);
      setSelectedProvider('');
      setConfig({});
    } catch (err: any) {
      setError(err.message || t('settings.integrations.connectError'));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (type: IntegrationType) => {
    setDisconnecting(type);
    setError(null);

    try {
      await onDisconnect(type);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('settings.integrations.disconnectError'));
    } finally {
      setDisconnecting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderConfigFields = (type: IntegrationType, provider: string) => {
    if (type === 'payments') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {provider === 'stripe' ? 'Publishable Key' : 'Partner Code'}
            </label>
            <input
              type="text"
              value={config.api_key || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder={provider === 'stripe' ? 'pk_...' : 'Partner code'}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {provider === 'stripe' ? 'Secret Key' : 'Secret Key'}
            </label>
            <input
              type="password"
              value={config.secret_key || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, secret_key: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder={provider === 'stripe' ? 'sk_...' : 'Secret key'}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="test_mode"
              checked={config.test_mode === 'true'}
              onChange={(e) => setConfig(prev => ({ ...prev, test_mode: e.target.checked ? 'true' : 'false' }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="test_mode" className="text-sm text-gray-600">
              {t('settings.integrations.testMode')}
            </label>
          </div>
        </div>
      );
    }

    if (type === 'push') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">App ID</label>
            <input
              type="text"
              value={config.app_id || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, app_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">API Key</label>
            <input
              type="password"
              value={config.api_key || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      );
    }

    if (type === 'sms') {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Account SID</label>
            <input
              type="text"
              value={config.account_sid || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, account_sid: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Auth Token</label>
            <input
              type="password"
              value={config.auth_token || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, auth_token: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('settings.integrations.fromNumber')}</label>
            <input
              type="text"
              value={config.from_number || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, from_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="+84..."
            />
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  const integrationTypes: IntegrationType[] = ['payments', 'push', 'sms'];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t('settings.integrations.title')}</h3>
      <p className="text-sm text-gray-500 mb-6">{t('settings.integrations.description')}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {t('settings.toasts.saved')}
        </div>
      )}

      <div className="space-y-4">
        {integrationTypes.map((type) => {
          const integration = getIntegration(type);
          const isExpanded = expandedType === type;

          return (
            <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => !integration && handleExpand(type)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    {type === 'payments' ? '💳' : type === 'push' ? '🔔' : '📱'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {t(`settings.integrations.${type}.title`)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {integration 
                        ? `${integration.provider.toUpperCase()} • ${t('settings.integrations.connectedOn')} ${formatDate(integration.connected_at)}`
                        : t(`settings.integrations.${type}.description`)
                      }
                    </div>
                  </div>
                </div>
                <div>
                  {integration ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisconnect(type);
                      }}
                      disabled={disconnecting === type}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {disconnecting === type ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t('settings.integrations.disconnect')
                      )}
                    </button>
                  ) : (
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && !integration && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.integrations.selectProvider')}
                    </label>
                    <div className="flex gap-3 mb-4">
                      {PROVIDERS[type].map((provider) => (
                        <button
                          key={provider.name}
                          type="button"
                          onClick={() => {
                            setSelectedProvider(provider.name);
                            setConfig({});
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedProvider === provider.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span>{provider.icon}</span>
                          <span className="font-medium capitalize">{provider.name}</span>
                        </button>
                      ))}
                    </div>

                    {selectedProvider && (
                      <>
                        {renderConfigFields(type, selectedProvider)}
                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedType(null)}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            {t('common.cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConnect(type)}
                            disabled={connecting}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {connecting ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {t('settings.integrations.connecting')}
                              </span>
                            ) : (
                              t('settings.integrations.connect')
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default IntegrationsForm;

