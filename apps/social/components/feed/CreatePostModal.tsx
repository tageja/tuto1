'use client';

import { useState, useRef, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Visibility = 'school_only' | 'class_only' | 'followers' | 'public';

const AUDIENCE_OPTIONS: { key: Visibility; label: string }[] = [
  { key: 'school_only', label: 'Trường học' },
  { key: 'class_only',  label: 'Lớp học'   },
  { key: 'followers',   label: 'Người theo dõi' },
  { key: 'public',      label: 'Công khai'  },
];

const SUBJECTS = [
  'Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học',
  'Sinh học', 'Lịch sử', 'Địa lý', 'IELTS', 'STEM', 'Tin học',
];

const CHAR_LIMIT = 500;

interface Props {
  open:    boolean;
  onClose: () => void;
}

export default function CreatePostModal({ open, onClose }: Props) {
  const [content,    setContent]    = useState('');
  const [audience,   setAudience]   = useState<Visibility>('school_only');
  const [subjects,   setSubjects]   = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setContent('');
      setAudience('school_only');
      setSubjects([]);
      setSuccess(false);
      setError(null);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  const toggleSubject = (tag: string) => {
    setSubjects((prev) =>
      prev.includes(tag)
        ? prev.filter((s) => s !== tag)
        : prev.length < 3 ? [...prev, tag] : prev,
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id, school_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Social profile not found');

      const { error: insertError } = await supabase.from('social_posts').insert({
        author_id:        profile.id,
        school_id:        profile.school_id,
        post_type:        'text',
        content:          content.trim(),
        visibility:       audience,
        subjects,
        moderation_status: 'pending',
        media_urls:       [],
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng bài thất bại. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const charsLeft = CHAR_LIMIT - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-900">Tạo bài viết</h2>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
              canSubmit
                ? 'bg-primary text-white hover:bg-blue-700'
                : 'bg-blue-200 text-white cursor-not-allowed',
            ].join(' ')}
          >
            {submitting ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Đang đăng…
              </span>
            ) : 'Đăng'}
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Success state */}
          {success && (
            <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm text-center font-medium">
              ✅ Đang chờ kiểm duyệt — bài viết của bạn sẽ xuất hiện sau khi được duyệt.
            </div>
          )}

          {/* Audience selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Đối tượng</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAudience(opt.key)}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    audience === opt.key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn muốn chia sẻ gì?"
              rows={5}
              className="w-full text-gray-900 placeholder-gray-400 text-sm leading-relaxed resize-none outline-none border-0 focus:ring-0 p-0"
              maxLength={CHAR_LIMIT + 10}
            />
            <p className={`text-xs text-right mt-1 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {content.length}/{CHAR_LIMIT}
            </p>
          </div>

          {/* Subject tags */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Môn học (tối đa 3)</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((tag) => {
                const isSelected = subjects.includes(tag);
                const isDisabled = !isSelected && subjects.length >= 3;
                return (
                  <button
                    key={tag}
                    onClick={() => toggleSubject(tag)}
                    disabled={isDisabled}
                    className={[
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : isDisabled
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary',
                    ].join(' ')}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Moderation notice */}
          <p className="text-xs text-gray-400">
            Bài viết của bạn sẽ được kiểm duyệt trước khi xuất hiện trên bảng tin.
          </p>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
