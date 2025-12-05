'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '../../../../../../components/ui/Card';
import { Input } from '../../../../../../components/ui/Input';
import { Button } from '../../../../../../components/ui/Button';
import { useI18n } from '../../../../../../contexts/I18nContext';
import { supabase } from '../../../../../../lib/supabase';
import { Loader2, ArrowLeft, User } from 'lucide-react';
import type { FeedbackWithMessages, FeedbackMessage } from '@tuto/schemas';

export default function AdminFeedbackDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const feedbackId = params.feedbackId as string;

  // State
  const [feedback, setFeedback] = useState<FeedbackWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [closing, setClosing] = useState(false);

  // Fetch feedback detail
  useEffect(() => {
    if (feedbackId) {
      fetchFeedback();
    }
  }, [feedbackId]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        console.error('No active session');
        return;
      }

      const response = await fetch(`/api/feedback/school/${feedbackId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setFeedback(result.data);
      } else {
        console.error('Error fetching feedback:', result.error);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !feedback) return;
    
    setReplying(true);
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        alert('No active session. Please log in again.');
        return;
      }

      const response = await fetch(`/api/feedback/${feedback.id}/reply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReplyMessage('');
        fetchFeedback();
      } else {
        alert(result.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleCloseFeedback = async () => {
    if (!feedback) return;
    
    if (!confirm('Are you sure you want to mark this feedback as closed?')) return;
    
    setClosing(true);
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        alert('No active session. Please log in again.');
        return;
      }

      const response = await fetch(`/api/feedback/${feedback.id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: 'closed' }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchFeedback();
      } else {
        alert(result.error || 'Failed to close feedback');
      }
    } catch (error) {
      console.error('Error closing feedback:', error);
      alert('Failed to close feedback');
    } finally {
      setClosing(false);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <p className="text-text-muted">Feedback not found</p>
            <Button
              variant="outline"
              onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/feedback`)}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feedback List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isOverdue = new Date(feedback.deadline_at) < new Date() && feedback.status !== 'closed';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/feedback`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back') || 'Back'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text">{feedback.code}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                {t(`dashboard.feedback.category.${feedback.category}`)}
              </span>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(feedback.status)}`}>
                {t(`dashboard.feedback.status.${feedback.status}`)}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800">
                  {t('dashboard.feedback.deadline.overdue')}
                </span>
              )}
            </div>
          </div>
        </div>
        {feedback.status !== 'closed' && (
          <Button
            variant="outline"
            onClick={handleCloseFeedback}
            disabled={closing}
          >
            {closing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('dashboard.feedback.admin.markClosed')
            )}
          </Button>
        )}
      </div>

      {/* Feedback Meta */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-muted mb-1 block">
              {t('students') || 'Student'}
            </label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-text-muted" />
              <button
                onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/students/${feedback.student_id}`)}
                className="text-primary hover:underline font-medium"
              >
                {feedback.student_name || 'Unknown Student'}
              </button>
              {feedback.student_code && (
                <span className="text-text-muted">({feedback.student_code})</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text-muted mb-1 block">
              {t('parent') || 'Parent'}
            </label>
            <p className="text-text">{feedback.parent_name || 'Unknown Parent'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-muted mb-1 block">
              {t('dashboard.feedback.deadline.label')}
            </label>
            <p className={`text-text ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              {formatDeadline(feedback.deadline_at)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-muted mb-1 block">
              {t('common.created') || 'Created'}
            </label>
            <p className="text-text">
              {new Date(feedback.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Original Feedback Content */}
      <Card>
        <h2 className="text-lg font-semibold text-text mb-4">{feedback.title}</h2>
        <p className="text-text-muted whitespace-pre-wrap">{feedback.description}</p>
      </Card>

      {/* Conversation Thread */}
      <Card>
        <h3 className="text-lg font-semibold text-text mb-4">
          {t('dashboard.feedback.parent.thread.title')}
        </h3>
        <div className="space-y-4">
          {feedback.messages && feedback.messages.length > 0 ? (
            (feedback.messages as Array<FeedbackMessage & { sender_name?: string | null }>).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_role === 'parent' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    msg.sender_role === 'parent'
                      ? 'bg-surface text-text'
                      : 'bg-primary text-white'
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {msg.sender_name || (msg.sender_role === 'parent' ? 'Parent' : 'Admin')}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-muted text-center py-8">
              {t('dashboard.feedback.list.noItems')}
            </p>
          )}
        </div>
      </Card>

      {/* Reply Box */}
      {feedback.status !== 'closed' && (
        <Card>
          <h3 className="text-lg font-semibold text-text mb-4">
            {t('dashboard.feedback.admin.replyPlaceholder')}
          </h3>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder={t('dashboard.feedback.admin.replyPlaceholder')}
            className="w-full rounded-xl border border-border bg-card text-text px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 mb-4"
          />
          <Button onClick={handleReply} disabled={!replyMessage.trim() || replying}>
            {replying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('common.reply') || 'Send Reply'
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}

