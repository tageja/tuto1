import { getAuthSafe } from '../config/firebase';
import { firebaseConfig } from '../config/firebase';

const FUNCTIONS_BASE = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL || '';
const FUNCTIONS_REGION = process.env.EXPO_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1';

const getBaseUrl = (): string => {
  if (FUNCTIONS_BASE) return FUNCTIONS_BASE.replace(/\/$/, '');
  const project = firebaseConfig.projectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '';
  return `https://${FUNCTIONS_REGION}-${project}.cloudfunctions.net/api`;
};

async function authedFetch(path: string, init?: RequestInit) {
  const auth = getAuthSafe();
  const token = await auth.currentUser?.getIdToken?.(true);
  if (!token) throw new Error('NO_AUTH');
  return fetch(`${getBaseUrl()}${path}`, {
    ...(init || {}),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

export async function searchStudentById(studentCode: string) {
  const res = await authedFetch('/api/students/searchById', {
    method: 'POST',
    body: JSON.stringify({ studentCode }),
  });
  return res.json() as Promise<
    | { ok: true; student: { id: string; fullNameInitials: string; grade: string } }
    | { ok: false; code: string; message?: string }
  >;
}























