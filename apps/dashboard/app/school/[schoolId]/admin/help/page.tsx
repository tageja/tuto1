'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { useI18n } from '../../../../../contexts/I18nContext';
import { supabase } from '../../../../../lib/supabase';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

type Category = 'bug' | 'feature' | 'improvement' | 'question' | 'other';

interface Row {
  id: string;
  school_id: string;
  submitted_by_user_id: string;
  category: string;
  body: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  submitter_name: string;
  submitter_email: string;
}

const CATEGORIES: Category[] = ['bug', 'feature', 'improvement', 'question', 'other'];

export default function AdminHelpPage() {
  const { t } = useI18n();
  const params = useParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('question');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successUntil, setSuccessUntil] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    try {
      const h = await authHeader();
      if (!h) return;
      const res = await fetch(`/api/platform-feedback?schoolId=${encodeURIComponent(schoolId)}`, { headers: h });
      const json = await res.json();
      if (json.success) setList(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authHeader, schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const trimmed = body.trim();
    if (trimmed.length < 1 || trimmed.length > 5000) {
      setFormError(t('helpSupport.form.error'));
      return;
    }
    const h = await authHeader();
    if (!h) {
      setFormError(t('helpSupport.form.error'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/platform-feedback', {
        method: 'POST',
        headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, category, body: trimmed }),
      });
      const json = await res.json();
      if (!json.success) {
        setFormError(json.error || t('helpSupport.form.error'));
        return;
      }
      setBody('');
      setSuccessUntil(Date.now() + 4000);
      await load();
    } catch {
      setFormError(t('helpSupport.form.error'));
    } finally {
      setSubmitting(false);
    }
  }

  function categoryLabel(c: string) {
    return t(`helpSupport.category.${c}`);
  }

  function statusLabel(s: string) {
    return t(`helpSupport.status.${s}`);
  }

  function badge(cat: string) {
    const map: Record<string, string> = {
      bug: 'bg-red-100 text-red-800',
      feature: 'bg-blue-100 text-blue-800',
      improvement: 'bg-amber-100 text-amber-900',
      question: 'bg-gray-100 text-gray-800',
      other: 'bg-slate-100 text-slate-800',
    };
    return map[cat] || 'bg-gray-100 text-gray-800';
  }

  function statusBadge(s: string) {
    const map: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return map[s] || 'bg-gray-100 text-gray-800';
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text mb-2">{t('helpSupport.title')}</h1>
        <p className="text-text-muted">{t('helpSupport.subtitle')}</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('helpSupport.form.category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full max-w-md rounded-xl border border-border bg-card text-text px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('helpSupport.form.body')}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={5000}
              rows={6}
              placeholder={t('helpSupport.form.bodyPlaceholder')}
              className="w-full rounded-xl border border-border bg-card text-text px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <p className="text-xs text-text-muted mt-1">
              {body.trim().length} / 5000
            </p>
          </div>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          {successUntil > Date.now() ? (
            <p className="text-sm text-green-700">{t('helpSupport.form.success')}</p>
          ) : null}
          <Button type="submit" disabled={submitting} className="bg-primary">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('helpSupport.form.submitting')}
              </>
            ) : (
              t('helpSupport.form.submit')
            )}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-text mb-3">{t('helpSupport.list.title')}</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <Card>
            <p className="text-text-muted">{t('helpSupport.list.empty')}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((item) => {
              const open = expanded === item.id;
              const excerpt = item.body.length > 200 ? `${item.body.slice(0, 200)}…` : item.body;
              return (
                <Card key={item.id} className="cursor-pointer" onClick={() => setExpanded(open ? null : item.id)}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge(item.category)}`}>
                        {categoryLabel(item.category)}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {open ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </div>
                  <p className="text-sm text-text mt-2 whitespace-pre-wrap">{open ? item.body : excerpt}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {t('helpSupport.list.submittedBy').replace('{name}', item.submitter_name || item.submitter_email || '—')}
                  </p>
                  {open && item.admin_response ? (
                    <div className="mt-3 rounded-lg bg-surface p-3 text-sm">
                      <p className="font-medium text-text mb-1">{t('helpSupport.list.tutoResponse')}</p>
                      <p className="text-text whitespace-pre-wrap">{item.admin_response}</p>
                      {item.responded_at ? (
                        <p className="text-xs text-text-muted mt-2">
                          {formatDistanceToNow(new Date(item.responded_at), { addSuffix: true })}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
