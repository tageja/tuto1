// Client SDK to call Firebase Functions proxy for Airtable
// Uses fetch to call HTTPS function `api`

export interface ListResult<T> {
  records: T[];
  offset?: string;
}

import { firebaseConfig, getAuthSafe } from '../config/firebase';
const FUNCTIONS_BASE = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL || '';
const FUNCTIONS_REGION = process.env.EXPO_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1';

const getBaseUrl = (): string => {
  if (FUNCTIONS_BASE) return FUNCTIONS_BASE.replace(/\/$/, '');
  // Derive from firebase projectId and configurable region
  const project = firebaseConfig.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '';
  return `https://${FUNCTIONS_REGION}-${project}.cloudfunctions.net/api`;
};

const http = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let authHeader: Record<string, string> = {};
  try {
    const auth = getAuthSafe();
    const idToken = await auth.currentUser?.getIdToken?.();
    if (idToken) authHeader = { Authorization: `Bearer ${idToken}` };
  } catch {}
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init && (init as any).headers ? (init as any).headers : {}),
      ...authHeader,
    },
  } as RequestInit);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
};

export const Backend = {
  // Users API
  getUserByUid: async (uid?: string): Promise<{ ok: boolean; user?: any }> => {
    return http('/api/users/getByUid', { method: 'POST', body: JSON.stringify({ uid }) });
  },
  upsertUserRole: async (uid: string, role: 'teacher' | 'parent' | 'student'): Promise<{ ok: boolean }> => {
    return http('/api/users/upsertRole', { method: 'POST', body: JSON.stringify({ uid, role }) });
  },

  // Tables CRUD
  list: async <T = any>(
    table: string,
    options?: {
      filterByFormula?: string;
      maxRecords?: number;
      pageSize?: number;
      sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
      offset?: string;
    },
  ): Promise<ListResult<T>> => {
    const query: Record<string, string> = {};
    if (options?.filterByFormula) query.filterByFormula = options.filterByFormula;
    if (options?.maxRecords) query.maxRecords = String(options.maxRecords);
    if (options?.pageSize) query.pageSize = String(options.pageSize);
    if (options?.sort) query.sort = JSON.stringify(options.sort);
    if (options?.offset) query.offset = options.offset;
    const qs = new URLSearchParams(query).toString();
    return http<ListResult<T>>(`/tables/${encodeURIComponent(table)}${qs ? `?${qs}` : ''}`);
  },

  get: async <T = any>(table: string, id: string): Promise<T> => {
    return http<T>(`/tables/${encodeURIComponent(table)}/${encodeURIComponent(id)}`);
  },

  create: async <T = any>(table: string, fields: Record<string, any>): Promise<T> => {
    return http<T>(`/tables/${encodeURIComponent(table)}`, {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
  },

  update: async <T = any>(table: string, id: string, fields: Record<string, any>): Promise<T> => {
    return http<T>(`/tables/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields }),
    });
  },

  remove: async (table: string, id: string): Promise<boolean> => {
    await http(`/tables/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },

  listNearbyTeachers: async (params: { lat: number; lng: number; radiusKm?: number; max?: number }): Promise<{ ok: boolean; teachers: any[] }> => {
    return http('/api/teachers/nearby', { method: 'POST', body: JSON.stringify(params) });
  },

  // Feed endpoints
  getFeedPosts: async (page: number = 1, limit: number = 20, filterByFormula?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filterByFormula) {
      params.append('filterByFormula', filterByFormula);
    }
    return http(`/api/feed/posts?${params.toString()}`);
  },

  createFeedPost: async (postData: {
    contentText: string;
    contentMediaType?: string;
    contentMediaUrl?: string;
    subjects: string[];
    privacy?: string;
  }) => {
    return http('/api/feed/posts', { method: 'POST', body: JSON.stringify(postData) });
  },

  likeFeedPost: async (postId: string, like: boolean) => {
    return http(`/api/feed/posts/${postId}/like`, { method: 'POST', body: JSON.stringify({ like }) });
  },

  addFeedComment: async (postId: string, content: string) => {
    return http(`/api/feed/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
  },

  getFeedComments: async (postId: string, page: number = 1, limit: number = 50) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return http(`/api/feed/posts/${postId}/comments?${params.toString()}`);
  },

  reportFeedPost: async (postId: string, reason: string, details?: string) => {
    return http(`/api/feed/posts/${postId}/report`, { method: 'POST', body: JSON.stringify({ reason, details }) });
  },
};


