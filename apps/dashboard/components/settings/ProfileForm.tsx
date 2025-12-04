'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { Card } from '../ui/Card';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  twofa_enabled: boolean;
}

interface ProfileFormProps {
  initialData: ProfileData | null;
  onSave: (data: Partial<ProfileData>) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<string>;
  onAvatarUpdated?: (url: string) => void;
  onNameUpdated?: (name: string) => void;
  isLoading?: boolean;
}

export function ProfileForm({ initialData, onSave, onAvatarUpload, onAvatarUpdated, onNameUpdated, isLoading }: ProfileFormProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Track initial values for comparison
  const [initialValues, setInitialValues] = useState({
    full_name: '',
    phone: '',
    bio: '',
  });

  // Update initial values when data loads
  useEffect(() => {
    if (initialData) {
      const values = {
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        bio: initialData.bio || '',
      };
      setInitialValues(values);
      setFormData(values);
    }
  }, [initialData]);

  // Track form changes
  useEffect(() => {
    const hasChanges = 
      formData.full_name !== initialValues.full_name ||
      formData.phone !== initialValues.phone ||
      formData.bio !== initialValues.bio;
    setIsDirty(hasChanges);
  }, [formData, initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.85);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(t('settings.profile.invalidFileType'));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Compress image
      const compressedFile = await compressImage(file);
      
      // Check size after compression
      if (compressedFile.size > 1572864) {
        setError(t('settings.profile.fileTooLarge'));
        return;
      }

      const url = await onAvatarUpload(compressedFile);
      setAvatarUrl(url);
      setSuccess(true);
      // Update the avatar in AuthContext so header updates immediately
      if (onAvatarUpdated) {
        onAvatarUpdated(url);
      }
    } catch (err: any) {
      setError(err.message || t('settings.profile.uploadError'));
    } finally {
      setUploading(false);
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
      // Update the name in AuthContext so header updates immediately
      if (onNameUpdated && formData.full_name) {
        onNameUpdated(formData.full_name);
      }
      // Update initial values to match saved data
      setInitialValues(formData);
    } catch (err: any) {
      setError(err.message || t('settings.toasts.error'));
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="h-10 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{t('settings.profile.title')}</h3>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="flex-shrink-0 text-center">
            <div 
              className="relative w-24 h-24 mx-auto cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {getInitials(formData.full_name || 'U')}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="mt-2 text-xs text-gray-500">{t('settings.profile.avatarHint')}</p>
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('settings.profile.fullName')}
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('settings.profile.fullNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('settings.profile.email')}
              </label>
              <input
                type="email"
                value={initialData?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('settings.profile.emailManaged')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('settings.profile.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+84 123 456 789"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('settings.profile.bio')}
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder={t('settings.profile.bioPlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 text-right">
                {formData.bio.length}/500
              </p>
            </div>
          </div>
        </div>

        {/* Password Reset Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('settings.profile.password')}</h4>
          <p className="text-sm text-gray-500 mb-3">{t('settings.profile.passwordHint')}</p>
          <a
            href="https://accounts.google.com/signin/recovery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            {t('settings.profile.resetPassword')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* 2FA Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">{t('settings.profile.twoFactor')}</h4>
              <p className="text-sm text-gray-500">{t('settings.profile.twoFactorHint')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${initialData?.twofa_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {initialData?.twofa_enabled ? t('settings.profile.enabled') : t('settings.profile.disabled')}
              </span>
            </div>
          </div>
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

export default ProfileForm;

