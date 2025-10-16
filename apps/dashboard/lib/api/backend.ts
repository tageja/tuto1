/**
 * Backend API Service for Tuto Web Dashboard
 * 
 * This service communicates with Firebase Functions which proxy all Airtable operations.
 * Never access Airtable directly from the client - always go through this service.
 * 
 * Architecture:
 * Dashboard → backend.ts → Firebase Functions → Airtable
 * 
 * @see functions/src/index.ts for backend API implementation
 */

import { getFirebaseAuth } from '../firebase/config';

// Types
export interface ListResult<T> {
  records: T[];
  offset?: string;
}

export interface ApiError {
  ok: false;
  code: string;
  message: string;
}

export interface ApiSuccess<T = any> {
  ok: true;
  data?: T;
  [key: string]: any;
}

type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

/**
 * Get the base URL for Firebase Functions
 */
const getBaseUrl = (): string => {
  // Optional explicit override for troubleshooting or custom domains
  const override = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
  if (override && override.trim()) {
    return override.replace(/\/$/, '');
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const region = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1';

  // Use emulator in development if configured
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
    return 'http://localhost:5001';
  }

  return `https://${region}-${projectId}.cloudfunctions.net/api`;
};

/**
 * Make HTTP request to Firebase Functions
 */
const http = async <T = any>(
  path: string,
  options?: RequestInit
): Promise<T> => {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  
  // Get ID token for authentication
  let authHeader: Record<string, string> = {};
  if (user) {
    try {
      const idToken = await user.getIdToken();
      authHeader = { Authorization: `Bearer ${idToken}` };
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
  }
  
  const url = `${getBaseUrl()}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorText;
      } catch {
        // Use text as-is
      }
      
      throw new Error(
        `API Error ${response.status}: ${errorMessage}`
      );
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API call failed [${path}]:`, error);
    throw error;
  }
};

/**
 * Backend API service
 * 
 * Provides methods to interact with the backend Firebase Functions
 */
export const Backend = {
  // === Authentication & Users ===
  
  /**
   * Get user by Firebase UID
   */
  getUserByUid: async (uid?: string): Promise<ApiResponse<any>> => {
    // Directly query Users by {UID} to avoid schema mismatch
    const qs = new URLSearchParams({ filterByFormula: `{UID} = '${uid || ''}'`, maxRecords: '1' }).toString();
    const data = await http<any>(`/tables/${encodeURIComponent('Users')}${qs ? `?${qs}` : ''}`);
    const rec = (data?.records || [])[0];
    if (rec) return { ok: true, user: rec } as any;
    return { ok: false, code: 'NOT_FOUND', message: 'User not found' } as any;
  },
  
  /**
   * Upsert user role
   */
  upsertUserRole: async (
    uid: string,
    role: 'teacher' | 'parent' | 'student' | 'admin' | 'school_admin'
  ): Promise<ApiResponse> => {
    // Direct table upsert using schema fields: UID, Role, Email, Name, PhotoURL, Created AT
    const qs = new URLSearchParams({ filterByFormula: `{UID} = '${uid}'`, maxRecords: '1' }).toString();
    const data = await http<any>(`/tables/${encodeURIComponent('Users')}${qs ? `?${qs}` : ''}`);
    const rec = (data?.records || [])[0];
    if (rec) {
      await http(`/tables/${encodeURIComponent('Users')}/${encodeURIComponent(rec.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ fields: { Role: role } }),
      });
      return { ok: true } as any;
    }
    await http(`/tables/${encodeURIComponent('Users')}`, {
      method: 'POST',
      body: JSON.stringify({ fields: { UID: uid, Role: role, 'Created AT': new Date().toISOString() } }),
    });
    return { ok: true } as any;
  },
  
  // === Tables CRUD (Generic) ===
  
  /**
   * List records from a table with optional filtering and pagination
   */
  list: async <T = any>(
    table: string,
    options?: {
      filterByFormula?: string;
      maxRecords?: number;
      pageSize?: number;
      sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
      offset?: string;
    }
  ): Promise<ListResult<T>> => {
    const query: Record<string, string> = {};
    
    if (options?.filterByFormula) query.filterByFormula = options.filterByFormula;
    if (options?.maxRecords) query.maxRecords = String(options.maxRecords);
    if (options?.pageSize) query.pageSize = String(options.pageSize);
    if (options?.sort) query.sort = JSON.stringify(options.sort);
    if (options?.offset) query.offset = options.offset;
    
    const queryString = new URLSearchParams(query).toString();
    const path = `/tables/${encodeURIComponent(table)}${queryString ? `?${queryString}` : ''}`;
    
    return http<ListResult<T>>(path);
  },
  
  /**
   * Get a single record by ID
   */
  get: async <T = any>(table: string, id: string): Promise<T> => {
    return http<T>(`/tables/${encodeURIComponent(table)}/${encodeURIComponent(id)}`);
  },
  
  /**
   * Create a new record
   */
  create: async <T = any>(
    table: string,
    fields: Record<string, any>
  ): Promise<T> => {
    return http<T>(`/tables/${encodeURIComponent(table)}`, {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
  },
  
  /**
   * Update an existing record
   */
  update: async <T = any>(
    table: string,
    id: string,
    fields: Record<string, any>
  ): Promise<T> => {
    return http<T>(
      `/tables/${encodeURIComponent(table)}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ fields }),
      }
    );
  },
  
  /**
   * Delete a record
   */
  remove: async (table: string, id: string): Promise<boolean> => {
    await http(`/tables/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return true;
  },
  
  // === Teachers API ===
  
  /**
   * Get nearby teachers based on location
   */
  listNearbyTeachers: async (params: {
    lat: number;
    lng: number;
    radiusKm?: number;
    max?: number;
  }): Promise<ApiResponse<any[]>> => {
    return http('/api/teachers/nearby', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
  
  // === Feed API ===
  
  /**
   * Get feed posts with pagination
   */
  getFeedPosts: async (
    page: number = 1,
    limit: number = 20,
    filterByFormula?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filterByFormula) {
      params.append('filterByFormula', filterByFormula);
    }
    
    return http(`/api/feed/posts?${params.toString()}`);
  },
  
  /**
   * Create a new feed post
   */
  createFeedPost: async (postData: {
    contentText: string;
    contentMediaType?: string;
    contentMediaUrl?: string;
    subjects: string[];
    privacy?: string;
  }) => {
    return http('/api/feed/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },
  
  /**
   * Like or unlike a post
   */
  likeFeedPost: async (postId: string, like: boolean) => {
    return http(`/api/feed/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ like }),
    });
  },
  
  /**
   * Add a comment to a post
   */
  addFeedComment: async (postId: string, content: string) => {
    return http(`/api/feed/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  
  /**
   * Get comments for a post
   */
  getFeedComments: async (postId: string, page: number = 1, limit: number = 50) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return http(`/api/feed/posts/${postId}/comments?${params.toString()}`);
  },
  
  /**
   * Report a post
   */
  reportFeedPost: async (postId: string, reason: string, details?: string) => {
    return http(`/api/feed/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, details }),
    });
  },
  
  // === Health Check ===
  
  /**
   * Health check endpoint
   */
  healthCheck: async (): Promise<{ ok: boolean }> => {
    return http('/');
  },
};

export default Backend;

