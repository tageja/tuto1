'use client';

import useSWR from 'swr';

export interface SchoolBranding {
  school_id: string;
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  logo_url: string | null;
  primary_hex: string;
  accent_hex: string;
  header_img_url: string | null;
  updated_at: string | null;
}

interface BrandingResponse {
  success: boolean;
  data: SchoolBranding;
  error?: string;
}

const fetcher = async (url: string): Promise<BrandingResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load school branding');
  }
  return res.json();
};

export function useSchoolBranding(schoolId: string | null) {
  const apiUrl = schoolId
    ? `/api/school/settings/branding?schoolId=${encodeURIComponent(schoolId)}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<BrandingResponse>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    branding: data?.data || null,
    logoUrl: data?.data?.logo_url || null,
    isLoading,
    error,
    refetch: mutate,
  };
}

