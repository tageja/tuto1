import { firebaseConfig } from '../config/firebase';

const FUNCTIONS_BASE = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL || '';
const FUNCTIONS_REGION = process.env.EXPO_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1';
const getBaseUrl = (): string => {
  if (FUNCTIONS_BASE) return FUNCTIONS_BASE.replace(/\/$/, '');
  const project = firebaseConfig.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '';
  return `https://${FUNCTIONS_REGION}-${project}.cloudfunctions.net/api`;
};

async function httpPublic<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${getBaseUrl()}${path}`, { ...(init || {}), headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
	const text = await res.text();
	if (!res.ok) throw new Error(text || res.statusText);
	return text ? JSON.parse(text) : ({} as any);
}

export const ProvidersApi = {
	async search(params: any): Promise<{ items: any[] }> {
		return httpPublic('/api/providers/search', { method: 'POST', body: JSON.stringify(params || {}) });
	},
	async get(params: { providerId: string }): Promise<{ provider: any }> {
		return httpPublic('/api/providers/get', { method: 'POST', body: JSON.stringify(params) });
	},
};


