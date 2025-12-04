'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../ui/Card';
import { TIMEZONES } from '../../lib/validation/settings';
import { setTheme, initializeTheme, setupSystemPreferenceListener } from '../../lib/theme';

interface PreferencesData {
  locale: 'en' | 'vi';
  theme: 'system' | 'light' | 'dark';
  timezone: string;
}

interface PreferencesFormProps {
  initialData: PreferencesData | null;
  onSave: (data: PreferencesData) => Promise<void>;
  isLoading?: boolean;
}

export function PreferencesForm({ initialData, onSave, isLoading }: PreferencesFormProps) {
  const { t, lang, setLang } = useI18n();
  
  const defaultValues: PreferencesData = {
    locale: (lang as 'en' | 'vi') || 'vi',
    theme: 'system',
    timezone: 'Asia/Ho_Chi_Minh',
  };

  const [formData, setFormData] = useState<PreferencesData>(defaultValues);
  const [initialValues, setInitialValues] = useState<PreferencesData>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
    const cleanup = setupSystemPreferenceListener();
    return cleanup;
  }, []);

  // Update form when initial data loads
  useEffect(() => {
    if (initialData) {
      const values: PreferencesData = {
        locale: initialData.locale || (lang as 'en' | 'vi') || 'vi',
        theme: initialData.theme || 'system',
        timezone: initialData.timezone || 'Asia/Ho_Chi_Minh',
      };
      setFormData(values);
      setInitialValues(values);
      // Apply theme from initial data
      if (values.theme) {
        setTheme(values.theme);
      }
    }
  }, [initialData, lang]);

  // Track form changes
  useEffect(() => {
    const hasChanges = 
      formData.locale !== initialValues.locale ||
      formData.theme !== initialValues.theme ||
      formData.timezone !== initialValues.timezone;
    setIsDirty(hasChanges);
  }, [formData, initialValues]);

  const handleLocaleChange = (locale: 'en' | 'vi') => {
    setFormData(prev => ({ ...prev, locale }));
    // Live apply language
    setLang(locale);
    setError(null);
    setSuccess(false);
  };

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    setFormData(prev => ({ ...prev, theme }));
    // Live apply theme
    setTheme(theme);
    setError(null);
    setSuccess(false);
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, timezone: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave(formData);
      setSuccess(true);
      setIsDirty(false);
    } catch (err: any) {
      setError(err.message || t('settings.toasts.error'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-surface rounded w-1/4" />
          <div className="h-12 bg-surface rounded" />
          <div className="h-12 bg-surface rounded" />
          <div className="h-12 bg-surface rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-6">{t('settings.preferences.title')}</h3>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-3">
            {t('settings.preferences.language')}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleLocaleChange('en')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                formData.locale === 'en'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <span className="text-2xl">🇺🇸</span>
              <span className="font-medium text-text">English</span>
              {formData.locale === 'en' && (
                <svg className="w-5 h-5 text-primary ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange('vi')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                formData.locale === 'vi'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <span className="text-2xl">🇻🇳</span>
              <span className="font-medium text-text">Tiếng Việt</span>
              {formData.locale === 'vi' && (
                <svg className="w-5 h-5 text-primary ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-3">
            {t('settings.preferences.theme')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['system', 'light', 'dark'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => handleThemeChange(theme)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  formData.theme === theme
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <div className={`w-12 h-8 rounded-md border ${
                  theme === 'light' ? 'bg-card border-border' :
                  theme === 'dark' ? 'bg-surface border-border' :
                  'bg-gradient-to-r from-card to-surface border-border'
                }`} />
                <span className="text-sm font-medium capitalize text-text">
                  {t(`settings.preferences.${theme}`)}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-muted">{t('settings.preferences.themeHint')}</p>
        </div>

        {/* Timezone Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-2">
            {t('settings.preferences.timezone')}
          </label>
          <select
            value={formData.timezone}
            onChange={handleTimezoneChange}
            className="w-full px-3 py-2 border border-border bg-card text-text rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg text-sm text-success">
            {t('settings.toasts.saved')}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDirty && !saving
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-surface text-text-muted cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
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

export default PreferencesForm;

