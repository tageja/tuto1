'use client';

import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../ui/Card';

interface PrivacyPanelProps {
  isLoading?: boolean;
}

export function PrivacyPanel({ isLoading }: PrivacyPanelProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t('settings.privacy.title')}</h3>
      <p className="text-sm text-gray-500 mb-6">{t('settings.privacy.description')}</p>

      <div className="space-y-6">
        {/* Data Visibility */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{t('settings.privacy.dataVisibility.title')}</h4>
              <p className="text-sm text-gray-500 mt-1">{t('settings.privacy.dataVisibility.description')}</p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {t('settings.privacy.dataVisibility.schoolOnly')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{t('settings.privacy.dataExport.title')}</h4>
              <p className="text-sm text-gray-500 mt-1">{t('settings.privacy.dataExport.description')}</p>
              <button
                disabled
                className="mt-3 px-3 py-1.5 text-sm text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
              >
                {t('settings.privacy.dataExport.comingSoon')}
              </button>
            </div>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{t('settings.privacy.deleteAccount.title')}</h4>
              <p className="text-sm text-gray-500 mt-1">{t('settings.privacy.deleteAccount.description')}</p>
              <p className="mt-2 text-xs text-gray-400">{t('settings.privacy.deleteAccount.contactAdmin')}</p>
            </div>
          </div>
        </div>

        {/* Privacy Policy Links */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('settings.privacy.links.title')}</h4>
          <div className="flex flex-wrap gap-4">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {t('settings.privacy.links.privacyPolicy')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {t('settings.privacy.links.termsOfService')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="/data-retention"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {t('settings.privacy.links.dataRetention')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default PrivacyPanel;

