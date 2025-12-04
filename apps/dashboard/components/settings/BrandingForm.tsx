'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../ui/Card';

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

interface BrandingFormProps {
  initialData: BrandingData | null;
  onSave: (data: Partial<BrandingData>) => Promise<void>;
  onLogoUpload: (file: File) => Promise<string>;
  onHeaderUpload: (file: File) => Promise<string>;
  isLoading?: boolean;
}

export function BrandingForm({ 
  initialData, 
  onSave, 
  onLogoUpload,
  onHeaderUpload,
  isLoading 
}: BrandingFormProps) {
  const { t } = useI18n();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  
  const defaultValues: BrandingData = {
    school_name: '',
    school_address: '',
    school_phone: '',
    school_email: '',
    logo_url: null,
    primary_hex: '#0B5FFF',
    accent_hex: '#10B981',
    header_img_url: null,
  };

  const [formData, setFormData] = useState<BrandingData>(defaultValues);
  const [initialValues, setInitialValues] = useState<BrandingData>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'header' | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form when initial data loads
  useEffect(() => {
    if (initialData) {
      const values: BrandingData = {
        school_name: (initialData as any).school_name || '',
        school_address: (initialData as any).school_address || '',
        school_phone: (initialData as any).school_phone || '',
        school_email: (initialData as any).school_email || '',
        logo_url: initialData.logo_url || null,
        primary_hex: initialData.primary_hex || '#0B5FFF',
        accent_hex: initialData.accent_hex || '#10B981',
        header_img_url: initialData.header_img_url || null,
      };
      setFormData(values);
      setInitialValues(values);
    }
  }, [initialData]);

  // Track form changes
  useEffect(() => {
    const hasChanges = 
      formData.school_name !== initialValues.school_name ||
      formData.school_address !== initialValues.school_address ||
      formData.school_phone !== initialValues.school_phone ||
      formData.school_email !== initialValues.school_email ||
      formData.primary_hex !== initialValues.primary_hex ||
      formData.accent_hex !== initialValues.accent_hex ||
      formData.logo_url !== initialValues.logo_url ||
      formData.header_img_url !== initialValues.header_img_url;
    setIsDirty(hasChanges);
  }, [formData, initialValues]);

  const handleTextChange = (field: keyof BrandingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  // Apply colors to CSS variables for live preview
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary-preview', formData.primary_hex);
    document.documentElement.style.setProperty('--color-accent-preview', formData.accent_hex);
  }, [formData.primary_hex, formData.accent_hex]);

  const handleColorChange = (field: 'primary_hex' | 'accent_hex', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'header') => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(t('settings.branding.invalidFileType'));
      return;
    }

    setUploading(type);
    setError(null);

    try {
      const url = type === 'logo' 
        ? await onLogoUpload(file)
        : await onHeaderUpload(file);
      
      setFormData(prev => ({
        ...prev,
        [type === 'logo' ? 'logo_url' : 'header_img_url']: url,
      }));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('settings.branding.uploadError'));
    } finally {
      setUploading(null);
    }
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
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('settings.branding.title')}</h3>

        {/* Live Preview */}
        <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('settings.branding.preview')}</p>
          <div 
            className="rounded-lg overflow-hidden"
            style={{ 
              background: formData.header_img_url 
                ? `url(${formData.header_img_url}) center/cover`
                : formData.primary_hex
            }}
          >
            <div className="flex items-center gap-4 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.primary_hex }}
                >
                  {formData.school_name ? formData.school_name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div>
                <div className="font-semibold" style={{ color: formData.primary_hex }}>
                  {formData.school_name || t('settings.branding.schoolName')}
                </div>
                <div className="text-sm" style={{ color: formData.accent_hex }}>
                  {t('settings.branding.tagline')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* School Information Section */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{t('settings.branding.schoolInfo')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.branding.schoolNameLabel')}
              </label>
              <input
                type="text"
                value={formData.school_name}
                onChange={(e) => handleTextChange('school_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('settings.branding.schoolNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.branding.schoolEmail')}
              </label>
              <input
                type="email"
                value={formData.school_email}
                onChange={(e) => handleTextChange('school_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="school@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.branding.schoolPhone')}
              </label>
              <input
                type="tel"
                value={formData.school_phone}
                onChange={(e) => handleTextChange('school_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+84 123 456 789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.branding.schoolAddress')}
              </label>
              <input
                type="text"
                value={formData.school_address}
                onChange={(e) => handleTextChange('school_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('settings.branding.schoolAddressPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.branding.logo')}
          </label>
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain rounded-lg" />
              ) : uploading === 'logo' ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>{t('settings.branding.logoHint')}</p>
              <p className="text-xs mt-1">{t('settings.branding.fileTypes')}</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
            className="hidden"
          />
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.branding.primaryColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_hex}
                onChange={(e) => handleColorChange('primary_hex', e.target.value)}
                className="w-12 h-12 p-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_hex}
                onChange={(e) => handleColorChange('primary_hex', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm uppercase"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.branding.accentColor')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accent_hex}
                onChange={(e) => handleColorChange('accent_hex', e.target.value)}
                className="w-12 h-12 p-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={formData.accent_hex}
                onChange={(e) => handleColorChange('accent_hex', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm uppercase"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
        </div>

        {/* Header Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.branding.headerImage')}
          </label>
          <div 
            className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            style={formData.header_img_url ? { backgroundImage: `url(${formData.header_img_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            onClick={() => headerInputRef.current?.click()}
          >
            {!formData.header_img_url && (
              uploading === 'header' ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">{t('settings.branding.headerHint')}</p>
                </div>
              )
            )}
          </div>
          <input
            ref={headerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'header')}
            className="hidden"
          />
        </div>

        {/* Error/Success Messages */}
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

        {/* Save Button */}
        <div className="flex justify-end">
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

export default BrandingForm;

