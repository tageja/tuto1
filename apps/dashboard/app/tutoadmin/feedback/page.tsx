'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../../../components/ui/Card';
import { Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Row {
  id: string;
  school_id: string;
  category: string;
  body: string;
  status: string;
  created_at: string;
  school_name: string;
  submitter_name: string;
  submitter_email: string;
}

export default function TutoAdminFeedbackInboxPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setRows([]);
        setTotal(0);
        return;
      }
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (category !== 'all') params.set('category', category);
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      const res = await fetch(`/api/platform-feedback/admin?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setRows(json.data || []);
        setTotal(typeof json.total === 'number' ? json.total : (json.data || []).length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [status, category, offset]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setOffset(0);
  }, [status, category]);

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.body.toLowerCase().includes(q) ||
      (r.school_name || '').toLowerCase().includes(q) ||
      (r.submitter_name || '').toLowerCase().includes(q) ||
      (r.submitter_email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Platform feedback</h1>
        <p className="text-text-muted text-sm">Submissions from school admins</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search school, submitter, body…"
              className="w-full rounded-xl border border-border bg-card pl-10 pr-3 py-2 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">All categories</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="improvement">Improvement</option>
            <option value="question">Question</option>
            <option value="other">Other</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <p className="text-text-muted text-sm">Loading…</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">School</th>
                <th className="py-2 pr-4">Submitter</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Excerpt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const excerpt = r.body.length > 120 ? `${r.body.slice(0, 120)}…` : r.body;
                return (
                  <tr key={r.id} className="border-b border-border/60 hover:bg-surface/60">
                    <td className="py-3 pr-4 whitespace-nowrap text-text-muted">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </td>
                    <td className="py-3 pr-4">
                      <Link href={`/tutoadmin/feedback/${r.id}`} className="text-primary hover:underline font-medium">
                        {r.school_name || '—'}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <div>{r.submitter_name || '—'}</div>
                      <div className="text-xs text-text-muted">{r.submitter_email}</div>
                    </td>
                    <td className="py-3 pr-4 capitalize">{r.category.replace('_', ' ')}</td>
                    <td className="py-3 pr-4 capitalize">{r.status.replace('_', ' ')}</td>
                    <td className="py-3">
                      <Link href={`/tutoadmin/feedback/${r.id}`} className="text-text hover:text-primary line-clamp-2">
                        {excerpt}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? <p className="py-6 text-text-muted text-center">No rows match filters.</p> : null}
          <div className="flex items-center justify-between pt-4 text-xs text-text-muted">
            <span>
              Showing {offset + 1}–{offset + rows.length} of {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="px-3 py-1 rounded-lg border border-border disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={offset + limit >= total}
                onClick={() => setOffset(offset + limit)}
                className="px-3 py-1 rounded-lg border border-border disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
