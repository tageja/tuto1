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

export type LinkStatus = 'pending' | 'active' | 'declined' | 'revoked';

export async function lookupCode(code: string) {
  const res = await authedFetch('/api/guardian/lookupCode', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return res.json() as Promise<
    | { ok: true; student: { id: string; fullNameInitials: string; grade: string }; expiresAt: string | null }
    | { ok: false; code: string; message?: string }
  >;
}

export async function createLink(studentId: string, method: 'code' | 'qr' | 'id') {
  const res = await authedFetch('/api/guardian/createLink', {
    method: 'POST',
    body: JSON.stringify({ studentId, method }),
  });
  return res.json() as Promise<
    | { ok: true; link: { id: string; status: Exclude<LinkStatus, 'declined' | 'revoked'> } }
    | { ok: false; code: string; message?: string }
  >;
}

export async function getLinkById(linkId: string) {
  const res = await authedFetch('/api/guardian/getLinkById', {
    method: 'POST',
    body: JSON.stringify({ linkId }),
  });
  return res.json() as Promise<
    | { ok: true; link: { id: string; status: LinkStatus } }
    | { ok: false; code: string; message?: string }
  >;
}

export async function getLinksForGuardian() {
  const res = await authedFetch('/api/guardian/getLinksForGuardian', { method: 'POST', body: JSON.stringify({}) });
  return res.json();
}

export async function revokeLink(linkId: string, reason?: string) {
  const res = await authedFetch('/api/guardian/revokeLink', {
    method: 'POST',
    body: JSON.stringify({ linkId, reason }),
  });
  return res.json();
}





















