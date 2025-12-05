'use client';

import { useSchoolBranding } from '../../hooks/useSchoolBranding';
import { useState, useEffect } from 'react';

interface SchoolLogoProps {
  schoolId: string | null;
  size?: 'sm' | 'md' | 'lg';
  showFallback?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { container: 'w-8 h-8', icon: 'text-xs' },
  md: { container: 'w-10 h-10', icon: 'text-sm' },
  lg: { container: 'w-12 h-12', icon: 'text-base' },
};

export function SchoolLogo({
  schoolId,
  size = 'md',
  showFallback = true,
  className = '',
}: SchoolLogoProps) {
  const { logoUrl, isLoading, branding } = useSchoolBranding(schoolId);
  const [imgError, setImgError] = useState(false);

  // Reset imgError when logoUrl changes
  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const config = sizeConfig[size];

  // Fallback: Show school initial or generic icon
  const schoolInitial = branding?.school_name?.charAt(0)?.toUpperCase() || 'S';
  
  const FallbackDisplay = () => (
    <div
      className={`${config.container} rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center ${className}`}
      title={branding?.school_name || 'School'}
    >
      <span className={`${config.icon} font-bold text-blue-600`}>{schoolInitial}</span>
    </div>
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={`${config.container} rounded-lg bg-gray-100 animate-pulse border border-gray-200 ${className}`}
        title="Loading..."
      />
    );
  }

  // No schoolId provided - show fallback
  if (!schoolId) {
    return showFallback ? <FallbackDisplay /> : null;
  }

  // Logo available and no error - show the actual logo
  if (logoUrl && !imgError) {
    return (
      <div
        className={`${config.container} rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center ${className}`}
        title={branding?.school_name || 'School logo'}
      >
        <img
          src={logoUrl}
          alt={branding?.school_name || 'School logo'}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Show fallback for missing logo or load error
  return showFallback ? <FallbackDisplay /> : null;
}

