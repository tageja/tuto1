// Server-only util: Providers search via Firebase Functions
// Never expose secrets to client components

const getBaseUrl = (): string => {
  const override = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
  if (override && override.trim()) return override.replace(/\/$/, '');
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const region = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1';
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
    return 'http://localhost:5001';
  }
  return `https://${region}-${projectId}.cloudfunctions.net/api`;
};

export interface ProviderItem {
  id: string;
  displayName: string;
  subjects: string[];
  rating: number;
  priceRange: { min: number; max: number; currency: string };
  location: { city: string; district: string };
  thumbnail: string | null;
}

export async function searchProviders(params: {
  q?: string;
  subjects?: string[];
  modalities?: string[];
  priceMin?: number;
  priceMax?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: string;
}): Promise<{ items: ProviderItem[] }> {
  const url = `${getBaseUrl()}/api/providers/search`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {}),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`providers.search ${res.status}: ${text}`);
  }
  return res.json();
}



