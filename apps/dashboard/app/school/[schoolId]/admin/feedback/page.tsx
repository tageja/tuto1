'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { useI18n } from '../../../../../contexts/I18nContext';
import { supabase } from '../../../../../lib/supabase';
import { Loader2, MessageSquare, Search } from 'lucide-react';
import type { Feedback } from '@tuto/schemas';

interface FeedbackItem extends Feedback {
  student_name: string | null;
  student_code: string | null;
  parent_name: string | null;
}

export default function AdminFeedbackPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline'>('newest');

  // Fetch feedback
  useEffect(() => {
    fetchFeedbacks();
  }, [schoolId, categoryFilter, statusFilter, search]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        console.error('No active session');
        return;
      }

      const params = new URLSearchParams({
        schoolId: schoolId,
      });
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/feedback/school?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        let data = result.data || [];
        
        // Sort
        if (sortBy === 'deadline') {
          data = data.sort((a: FeedbackItem, b: FeedbackItem) => 
            new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime()
          );
        } else {
          data = data.sort((a: FeedbackItem, b: FeedbackItem) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        
        setFeedbacks(data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDeadline = (deadlineAt: string) => {
    const deadline = new Date(deadlineAt);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return t('dashboard.feedback.deadline.overdueBy').replace('{days}', String(Math.abs(diffDays)));
    } else if (diffDays === 0) {
      return t('dashboard.feedback.deadline.overdue');
    } else {
      return t('dashboard.feedback.deadline.dueIn').replace('{days}', String(diffDays));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'request': return 'bg-blue-100 text-blue-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'information': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewFeedback = (feedbackId: string) => {
    router.push(`/school/${encodeURIComponent(schoolId)}/admin/feedback/${feedbackId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text mb-2">{t('dashboard.feedback.admin.title')}</h1>
        <p className="text-text-muted">{t('dashboard.feedback.admin.subtitle')}</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-border bg-card text-text px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="all">{t('common.all') || 'All'}</option>
            <option value="request">{t('dashboard.feedback.category.request')}</option>
            <option value="complaint">{t('dashboard.feedback.category.complaint')}</option>
            <option value="information">{t('dashboard.feedback.category.information')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-card text-text px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="all">{t('common.all') || 'All'}</option>
            <option value="open">{t('dashboard.feedback.status.open')}</option>
            <option value="overdue">{t('dashboard.feedback.status.overdue')}</option>
            <option value="closed">{t('dashboard.feedback.status.closed')}</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'deadline')}
            className="rounded-xl border border-border bg-card text-text px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="newest">{t('common.newest') || 'Newest'}</option>
            <option value="deadline">{t('dashboard.feedback.deadline.label')}</option>
          </select>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface text-text hover:bg-surface/80'
            }`}
          >
            {t('common.all') || 'All'}
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'open'
                ? 'bg-green-100 text-green-800'
                : 'bg-surface text-text hover:bg-surface/80'
            }`}
          >
            {t('dashboard.feedback.status.open')}
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'overdue'
                ? 'bg-red-100 text-red-800'
                : 'bg-surface text-text hover:bg-surface/80'
            }`}
          >
            {t('dashboard.feedback.status.overdue')}
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'closed'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-surface text-text hover:bg-surface/80'
            }`}
          >
            {t('dashboard.feedback.status.closed')}
          </button>
        </div>
      </Card>

      {/* Feedback List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <div className="h-24 animate-pulse bg-gray-200 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">{t('dashboard.feedback.list.noItems')}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              hover
              onClick={() => handleViewFeedback(feedback.id)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span 
                      className="font-mono text-sm font-semibold text-primary hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFeedback(feedback.id);
                      }}
                    >
                      {feedback.code}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                      {t(`dashboard.feedback.category.${feedback.category}`)}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {t(`dashboard.feedback.status.${feedback.status}`)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text mb-1">{feedback.title}</h3>
                  <p className="text-sm text-text-muted mb-2 line-clamp-2">{feedback.description}</p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>
                      {feedback.student_name || 'Unknown Student'}
                      {feedback.student_code && ` (${feedback.student_code})`}
                    </span>
                    {feedback.parent_name && (
                      <>
                        <span>•</span>
                        <span>{feedback.parent_name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className={feedback.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                      {formatDeadline(feedback.deadline_at)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

