'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const BIO_MAX = 150;
const SUBJECTS = [
  'Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học',
  'Lịch sử', 'Địa lý', 'IELTS', 'STEM', 'Tin học',
];

const SOCIAL_MEDIA_BUCKET = 'social-media';

interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  coverUrl?: string;
  role: string;
  subjects: string[];
}

interface Props {
  profile: Profile;
}

function getMediaUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return '';
  return `${url}/storage/v1/object/public/${SOCIAL_MEDIA_BUCKET}/${path}`;
}

export default function EditProfileClient({ profile }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [subjects, setSubjects] = useState<string[]>(profile.subjects);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | undefined>(profile.avatarUrl);
  const [localCoverUrl, setLocalCoverUrl] = useState<string | undefined>(profile.coverUrl);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const u = username.trim().toLowerCase().replace(/\s/g, '_');
    if (!u || u.length < 2) {
      setError('Username phải có ít nhất 2 ký tự');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(u)) {
      setError('Username: chữ thường, số, gạch dưới');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from('social_profiles')
        .update({
          display_name: displayName.trim() || profile.displayName,
          username: u,
          bio: bio.trim().slice(0, BIO_MAX),
          subjects,
        })
        .eq('id', profile.id);

      if (updateError) {
        if (updateError.code === '23505') setError('Username đã được sử dụng');
        else setError(updateError.message);
        return;
      }
      router.push(`/profile/${encodeURIComponent(u)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File, type: 'avatar' | 'cover'): Promise<string> => {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Chưa đăng nhập');

    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${user.id}/${type}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(SOCIAL_MEDIA_BUCKET)
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;
    return getMediaUrl(fileName);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const url = await uploadFile(file, 'avatar');
      const supabase = getSupabaseBrowserClient();
      await supabase
        .from('social_profiles')
        .update({ avatar_url: url })
        .eq('id', profile.id);
      setLocalAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const url = await uploadFile(file, 'cover');
      const supabase = getSupabaseBrowserClient();
      await supabase
        .from('social_profiles')
        .update({ cover_url: url })
        .eq('id', profile.id);
      setLocalCoverUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const bioCount = bio.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href={`/profile/${encodeURIComponent(profile.username)}`} className="text-gray-600 hover:text-[#0B5FFF]">
          ← Hủy
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-[#0B5FFF] font-semibold disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Cover */}
      <div
        className="relative h-32 bg-gray-200 rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => coverInputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && coverInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
          disabled={uploadingCover}
        />
        {localCoverUrl ? (
          <Image src={localCoverUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploadingCover ? (
            <span className="text-white text-sm">Đang tải...</span>
          ) : (
            <span className="text-white text-sm">📷 Thay ảnh bìa</span>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="flex justify-center -mt-12 relative z-10">
        <div
          className="relative h-24 w-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group"
          onClick={() => avatarInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && avatarInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={uploadingAvatar}
          />
          {localAvatarUrl ? (
            <Image src={localAvatarUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-3xl font-bold text-gray-500">
              {profile.displayName?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadingAvatar ? (
              <span className="text-white text-xs">...</span>
            ) : (
              <span className="text-white text-xs">📷</span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
            placeholder="Tên hiển thị"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username (@)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent"
            placeholder="username"
            autoCapitalize="none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B5FFF] focus:border-transparent resize-none"
            placeholder="Viết vài dòng về bạn..."
          />
          <p className="text-xs text-gray-500 mt-1">{bioCount}/{BIO_MAX}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
          <button
            type="button"
            onClick={() => setSubjectPickerOpen(!subjectPickerOpen)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-left text-gray-700 hover:bg-gray-50"
          >
            {subjects.length > 0 ? subjects.join(', ') : 'Thêm môn học'}
          </button>
          {subjectPickerOpen && (
            <div className="mt-2 p-4 border border-gray-200 rounded-xl bg-white">
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      subjects.includes(s)
                        ? 'bg-[#0B5FFF] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
