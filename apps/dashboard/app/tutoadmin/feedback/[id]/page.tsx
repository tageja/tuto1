'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { supabase } from '../../../../lib/supabase';

interface Detail {
  id: string;
  school_id: string;
  category: string;
  body: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  school_name: string;
  submitter_name: string;
  submitter_email: string;
}

const STATUSES = ['open', 'in_progress', 'closed', 'rejected'] as const;

export default function TutoAdminFeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [row, setRow] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('open');
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeader = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const h = await authHeader();
      if (!h) {
        setError('Not authenticated');
        setRow(null);
        return;
      }
      const res = await fetch(`/api/platform-feedback/${id}`, { headers: h });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to load');
        setRow(null);
        return;
      }
      const d = json.data as Detail;
      setRow(d);
      setStatus(d.status);
      setResponse(d.admin_response || '');
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id, authHeader]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave() {
    if (!row) return;
    setSaving(true);
    setError(null);
    try {
      const h = await authHeader();
      if (!h) {
        setError('Not authenticated');
        return;
      }
      const res = await fetch(`/api/platform-feedback/${id}`, {
        method: 'PATCH',
        headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_response: response.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Save failed');
        return;
      }
      router.push('/tutoadmin/feedback');
    } catch {
      setError('Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/tutoadmin/feedback" className="text-primary text-sm hover:underline">
          ← Back to inbox
        </Link>
        <p className="text-red-600">{error || 'Not found'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Link href="/tutoadmin/feedback" className="text-primary text-sm hover:underline inline-block">
        ← Back to inbox
      </Link>

      <Card>
        <h1 className="text-xl font-bold text-text mb-4">Feedback detail</h1>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-text-muted">School</dt>
            <dd className="font-medium">{row.school_name}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Created</dt>
            <dd>{format(new Date(row.created_at), 'PPpp')}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Submitter</dt>
            <dd>
              {row.submitter_name}
              <div className="text-text-muted text-xs">{row.submitter_email}</div>
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Category</dt>
            <dd className="capitalize">{row.category}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-text-muted mb-2">Message</h2>
        <p className="text-text whitespace-pre-wrap text-sm">{row.body}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text mb-4">Respond</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Response (optional)</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              maxLength={5000}
              rows={6}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            />
            <p className="text-xs text-text-muted mt-1">{response.length} / 5000</p>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="button" onClick={onSave} disabled={saving} className="bg-primary">
            {saving ? 'Saving…' : 'Save & notify submitter'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
