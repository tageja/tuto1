'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '../../../../../components/ui/Card';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { useI18n } from '../../../../../contexts/I18nContext';
import { X, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';
import type { Feedback, FeedbackWithMessages, CreateFeedback } from '../../../../../../packages/schemas/src/feedback';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  student_number?: string;
}

interface FeedbackItem extends Feedback {
  student_name: string | null;
  student_code: string | null;
}

export default function ParentFeedbackPage() {
  const { t } = useI18n();
  const params = useParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // State
  const [children, setChildren] = useState<Child[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateFeedback>({
    schoolId: schoolId,
    studentId: '',
    category: 'request',
    title: '',
    description: '',
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Detail drawer
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithMessages | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [closing, setClosing] = useState(false);

  // Fetch children
  useEffect(() => {
    fetchChildren();
  }, [schoolId]);

  // Fetch feedback
  useEffect(() => {
    if (schoolId) {
      fetchFeedbacks();
    }
  }, [schoolId]);

  const fetchChildren = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      // Get user's database ID from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return;
      }

      // Fetch children via parent-student mapping
      const { data: mappings, error: mappingsError } = await supabase
        .from('school_parent_students')
        .select(`
          student_id,
          school_students!inner (
            id,
            first_name,
            last_name,
            student_number
          )
        `)
        .eq('school_id', schoolId)
        .eq('parent_user_id', userData.id);

      if (mappingsError) {
        console.error('Error fetching parent-student mappings:', mappingsError);
        return;
      }

      if (mappings && mappings.length > 0) {
        const childrenList = mappings.map((m: any) => ({
          id: m.school_students.id,
          first_name: m.school_students.first_name,
          last_name: m.school_students.last_name,
          student_number: m.school_students.student_number,
        }));
        
        setChildren(childrenList);
        if (childrenList.length > 0 && !formData.studentId) {
          setFormData(prev => ({ ...prev, studentId: childrenList[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

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

      const response = await fetch(`/api/feedback/my?schoolId=${encodeURIComponent(schoolId)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setFeedbacks(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        alert('No active session. Please log in again.');
        return;
      }

      const response = await fetch('/api/feedback/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFormData({
          schoolId: schoolId,
          studentId: children[0]?.id || '',
          category: 'request',
          title: '',
          description: '',
        });
        setShowCreateForm(false);
        fetchFeedbacks();
      } else {
        alert(result.error || 'Failed to create feedback');
      }
    } catch (error) {
      console.error('Error creating feedback:', error);
      alert('Failed to create feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewFeedback = async (feedbackId: string) => {
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) return;

      const response = await fetch(`/api/feedback/my/${feedbackId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setSelectedFeedback(result.data);
        setShowDetailDrawer(true);
      }
    } catch (error) {
      console.error('Error fetching feedback detail:', error);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedFeedback) return;
    
    setReplying(true);
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        alert('No active session. Please log in again.');
        return;
      }

      const response = await fetch(`/api/feedback/${selectedFeedback.id}/reply`, {
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
        // Refresh feedback detail
        handleViewFeedback(selectedFeedback.id);
        // Refresh list
        fetchFeedbacks();
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
    if (!selectedFeedback) return;
    
    if (!confirm('Are you sure you want to close this feedback?')) return;
    
    setClosing(true);
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        alert('No active session. Please log in again.');
        return;
      }

      const response = await fetch(`/api/feedback/${selectedFeedback.id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: 'closed' }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowDetailDrawer(false);
        fetchFeedbacks();
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

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (statusFilter !== 'all' && fb.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && fb.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text mb-2">{t('dashboard.feedback.title')}</h1>
        <p className="text-text-muted">{t('dashboard.feedback.subtitle')}</p>
      </div>

      {/* Create Feedback Card */}
      {!showCreateForm ? (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text mb-1">{t('dashboard.feedback.create.title')}</h2>
              <p className="text-sm text-text-muted">{t('dashboard.feedback.create.info')}</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              {t('dashboard.feedback.create.title')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">{t('dashboard.feedback.create.title')}</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleCreateFeedback} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('dashboard.feedback.create.studentLabel')}
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card text-text px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                required
              >
                <option value="">{t('common.select') || 'Select student'}</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('dashboard.feedback.create.categoryLabel')}
              </label>
              <div className="flex gap-2">
                {(['request', 'complaint', 'information'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      formData.category === cat
                        ? 'bg-primary text-white'
                        : 'bg-surface text-text hover:bg-surface/80'
                    }`}
                  >
                    {t(`dashboard.feedback.category.${cat}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('dashboard.feedback.create.titleLabel')}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('dashboard.feedback.create.titleLabel')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('dashboard.feedback.create.descriptionLabel')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('dashboard.feedback.create.descriptionLabel')}
                className="w-full rounded-xl border border-border bg-card text-text px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('dashboard.feedback.create.submit')
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-card text-text px-3 py-2 text-sm"
        >
          <option value="all">{t('common.all') || 'All'}</option>
          <option value="open">{t('dashboard.feedback.status.open')}</option>
          <option value="overdue">{t('dashboard.feedback.status.overdue')}</option>
          <option value="closed">{t('dashboard.feedback.status.closed')}</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-border bg-card text-text px-3 py-2 text-sm"
        >
          <option value="all">{t('common.all') || 'All'}</option>
          <option value="request">{t('dashboard.feedback.category.request')}</option>
          <option value="complaint">{t('dashboard.feedback.category.complaint')}</option>
          <option value="information">{t('dashboard.feedback.category.information')}</option>
        </select>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-gray-200" />
          ))}
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">{t('dashboard.feedback.list.noItems')}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <Card
              key={feedback.id}
              hover
              onClick={() => handleViewFeedback(feedback.id)}
              className="cursor-pointer"
            >
                <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-primary">
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
                    <span>•</span>
                    <span>{formatDeadline(feedback.deadline_at)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {showDetailDrawer && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-end z-50">
          <div className="w-full md:w-1/2 lg:w-2/5 h-full md:h-auto md:max-h-[90vh] bg-card md:rounded-l-xl shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
                <div>
                <h2 className="text-xl font-bold text-text">{selectedFeedback.code}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(selectedFeedback.category)}`}>
                    {t(`dashboard.feedback.category.${selectedFeedback.category}`)}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedFeedback.status)}`}>
                    {t(`dashboard.feedback.status.${selectedFeedback.status}`)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailDrawer(false);
                  setSelectedFeedback(null);
                }}
                className="text-text-muted hover:text-text"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Original Feedback */}
              <div>
                <h3 className="font-semibold text-text mb-2">{selectedFeedback.title}</h3>
                <p className="text-text-muted whitespace-pre-wrap">{selectedFeedback.description}</p>
                <div className="mt-4 text-sm text-text-muted">
                  <p>{t('dashboard.feedback.deadline.label')}: {formatDeadline(selectedFeedback.deadline_at)}</p>
                </div>
              </div>

              {/* Conversation Thread */}
              <div>
                <h4 className="font-semibold text-text mb-4">{t('dashboard.feedback.parent.thread.title')}</h4>
                <div className="space-y-4">
                  {selectedFeedback.messages && selectedFeedback.messages.length > 0 ? (
                    selectedFeedback.messages.map((msg) => (
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
                            {msg.sender_name || (msg.sender_role === 'parent' ? 'You' : 'Admin')}
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
              </div>

              {/* Reply Box */}
              {selectedFeedback.status !== 'closed' && (
                <div className="border-t border-border pt-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={t('dashboard.feedback.parent.replyPlaceholder')}
                    className="w-full rounded-xl border border-border bg-card text-text px-3 py-2 text-sm min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 mb-3"
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleReply} disabled={!replyMessage.trim() || replying}>
                      {replying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        t('common.reply') || 'Reply'
                      )}
                    </Button>
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
                        t('dashboard.feedback.parent.closeButton')
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

