'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useFeedInvalidation } from '@/contexts/FeedInvalidationContext';

type Visibility = 'public' | 'schoolOnly' | 'classOnly' | 'followers' | 'private';
type PostMode = 'text' | 'photo' | 'event' | 'achievement';

const AUDIENCE_OPTIONS: { key: Visibility; label: string }[] = [
  { key: 'schoolOnly', label: 'Trường học' },
  { key: 'classOnly',  label: 'Lớp học'   },
  { key: 'followers',  label: 'Người theo dõi' },
  { key: 'public',     label: 'Công khai'  },
];

const SUBJECTS = [
  'Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học',
  'Sinh học', 'Lịch sử', 'Địa lý', 'IELTS', 'STEM', 'Tin học',
];

const CHAR_LIMIT = 500;
const MAX_IMAGES = 4;
const MAX_FILE_SIZE_MB = 5;

interface Props {
  open:       boolean;
  onClose:    () => void;
  initialMode?: PostMode;
}

export default function CreatePostModal({ open, onClose, initialMode = 'text' }: Props) {
  const supabase = getSupabaseBrowserClient();
  const { invalidateFeed } = useFeedInvalidation();

  const [mode,       setMode]       = useState<PostMode>(initialMode);
  const [content,    setContent]    = useState('');
  const [audience,   setAudience]   = useState<Visibility>('schoolOnly');
  const [subjects,   setSubjects]   = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Photo state
  const [photoFiles,    setPhotoFiles]    = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading,     setUploading]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Event fields
  const [eventTitle,    setEventTitle]    = useState('');
  const [eventDate,     setEventDate]     = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Achievement fields
  const [achTitle, setAchTitle] = useState('');
  const [achType,  setAchType]  = useState<'academic' | 'streak' | 'score' | 'first' | 'certificate'>('academic');
  const [achDesc,  setAchDesc]  = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setContent('');
      setAudience('schoolOnly');
      setSubjects([]);
      setSuccess(false);
      setError(null);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
      setAchTitle('');
      setAchType('academic');
      setAchDesc('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open, initialMode]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`Ảnh quá lớn (tối đa ${MAX_FILE_SIZE_MB}MB)`);
        return false;
      }
      return true;
    });

    const combined = [...photoFiles, ...valid].slice(0, MAX_IMAGES);
    setPhotoFiles(combined);
    setPhotoPreviews(combined.map((f) => URL.createObjectURL(f)));
    if (e.target) e.target.value = '';
  }, [photoFiles]);

  const removePhoto = (idx: number) => {
    const next = photoFiles.filter((_, i) => i !== idx);
    setPhotoFiles(next);
    setPhotoPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return [];
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const urls: string[] = [];
      for (const file of photoFiles) {
        const ext  = file.name.split('.').pop() ?? 'jpg';
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('social-media')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage
          .from('social-media')
          .getPublicUrl(path);
        urls.push(publicUrl);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (mode === 'event' && !eventTitle.trim()) {
      setError('Vui lòng nhập tiêu đề sự kiện.'); return;
    }
    if (mode === 'event' && !eventDate) {
      setError('Vui lòng chọn ngày sự kiện.'); return;
    }
    if (mode === 'achievement' && !achTitle.trim()) {
      setError('Vui lòng nhập tên thành tích.'); return;
    }
    if (mode !== 'event' && mode !== 'achievement' && !content.trim()) {
      setError('Vui lòng nhập nội dung.'); return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const mediaUrls = await uploadPhotos();

      const body: Record<string, unknown> = {
        visibility: audience,
        subjects,
        content: content.trim() || (mode === 'event' ? eventTitle : achTitle),
      };

      if (mediaUrls.length > 0) body.mediaUrls = mediaUrls;

      if (mode === 'event') {
        body.postType = 'event';
        body.event = {
          title:    eventTitle.trim(),
          date:     eventDate,
          location: eventLocation.trim() || null,
          rsvpCount: 0,
        };
      } else if (mode === 'achievement') {
        body.postType = 'achievement';
        body.achievement = {
          type:        achType,
          title:       achTitle.trim(),
          description: achDesc.trim() || null,
        };
      } else if (mediaUrls.length > 0) {
        body.postType = 'photo';
      } else {
        body.postType = 'text';
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const json = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Đăng bài thất bại.');

      setSuccess(true);
      invalidateFeed();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('feedNeedsRefresh', '1');
      }
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng bài thất bại. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const charsLeft  = CHAR_LIMIT - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit  = !submitting && !isOverLimit && (
    (mode === 'event'       && eventTitle.trim().length > 0 && eventDate.length > 0) ||
    (mode === 'achievement' && achTitle.trim().length > 0) ||
    (mode === 'photo'       && (content.trim().length > 0 || photoFiles.length > 0)) ||
    (mode === 'text'        && content.trim().length > 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Đóng">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-900">Tạo bài viết</h2>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={['px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
              canSubmit ? 'bg-primary text-white hover:bg-blue-700' : 'bg-blue-200 text-white cursor-not-allowed',
            ].join(' ')}
          >
            {submitting || uploading ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {uploading ? 'Đang tải...' : 'Đang đăng...'}
              </span>
            ) : 'Đăng'}
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-gray-100">
          {(['text', 'photo', 'event', 'achievement'] as PostMode[]).map((m) => {
            const icons: Record<PostMode, string> = { text: '📝', photo: '📷', event: '📅', achievement: '🏆' };
            const labels: Record<PostMode, string> = { text: 'Văn bản', photo: 'Ảnh', event: 'Sự kiện', achievement: 'Thành tích' };
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={['flex-1 py-2.5 text-xs font-medium flex flex-col items-center gap-0.5 transition-colors',
                  mode === m ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600',
                ].join(' ')}
              >
                <span>{icons[m]}</span>
                <span>{labels[m]}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-4">
          {success && (
            <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm text-center font-medium">
              ✅ Bài viết đã được gửi — đang chờ kiểm duyệt.
            </div>
          )}

          {/* Audience */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Đối tượng</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button key={opt.key} onClick={() => setAudience(opt.key)}
                  className={['px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    audience === opt.key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content textarea (all modes) */}
          {mode !== 'event' && mode !== 'achievement' && (
            <div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={mode === 'photo' ? 'Mô tả ảnh của bạn...' : 'Bạn muốn chia sẻ gì?'}
                rows={4}
                className="w-full text-gray-900 placeholder-gray-400 text-sm leading-relaxed resize-none outline-none border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20"
                maxLength={CHAR_LIMIT + 10}
              />
              <p className={`text-xs text-right mt-1 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                {content.length}/{CHAR_LIMIT}
              </p>
            </div>
          )}

          {/* Photo picker */}
          {mode === 'photo' && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Ảnh (tối đa {MAX_IMAGES})</p>
              <div className="grid grid-cols-4 gap-2">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image src={src} alt="" fill className="object-cover" sizes="100px" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photoFiles.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                  >
                    <span className="text-xl">+</span>
                    <span className="text-xs">Thêm</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Event fields */}
          {mode === 'event' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Tên sự kiện *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="VD: Họp phụ huynh cuối kỳ 2"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mô tả</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Thông tin chi tiết về sự kiện..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Ngày *</label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Địa điểm</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="VD: Phòng họp tầng 2"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Achievement fields */}
          {mode === 'achievement' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Loại thành tích</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: 'academic',    label: '🏆 Học tập' },
                    { key: 'streak',      label: '🔥 Chuỗi ngày' },
                    { key: 'score',       label: '⭐ Điểm số' },
                    { key: 'first',       label: '🎀 Lần đầu' },
                    { key: 'certificate', label: '📜 Chứng chỉ' },
                  ] as const).map(({ key, label }) => (
                    <button key={key} type="button" onClick={() => setAchType(key)}
                      className={['px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                        achType === key
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Tên thành tích *</label>
                <input
                  type="text"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="VD: Đạt điểm 10 môn Toán"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mô tả</label>
                <textarea
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  placeholder="Thêm chi tiết về thành tích này..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mô tả thêm</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ cảm xúc của bạn..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* Subject tags */}
          {(mode === 'text' || mode === 'photo') && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Môn học (tối đa 3)</p>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((tag) => {
                  const isSelected = subjects.includes(tag);
                  const isDisabled = !isSelected && subjects.length >= 3;
                  return (
                    <button key={tag} onClick={() => {
                      setSubjects((prev) =>
                        prev.includes(tag) ? prev.filter((s) => s !== tag) : prev.length < 3 ? [...prev, tag] : prev
                      );
                    }} disabled={isDisabled}
                      className={['px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                        isSelected ? 'bg-primary text-white border-primary'
                        : isDisabled ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary',
                      ].join(' ')}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Bài viết của bạn sẽ được kiểm duyệt trước khi xuất hiện trên bảng tin.
          </p>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
