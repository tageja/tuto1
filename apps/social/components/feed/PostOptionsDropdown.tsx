'use client';

import { useState, useRef, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Flag, Ban } from 'lucide-react';

interface Props {
  postId: string;
  authorId: string;
  authorName: string;
  isOwnPost: boolean;
  onBlock?: () => void;
}

export default function PostOptionsDropdown({
  postId,
  authorId,
  authorName,
  isOwnPost,
  onBlock,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReport = async () => {
    setReporting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Chưa đăng nhập');

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (!profile) throw new Error('Không tìm thấy hồ sơ');

      const { error } = await supabase.from('social_reports').insert({
        reporter_id: profile.id,
        target_type: 'post',
        target_id:   postId,
        reason:      'other',
        description: '',
      });
      if (error) throw error;
      setOpen(false);
    } catch (err) {
      console.error('Report error', err);
      alert(err instanceof Error ? err.message : 'Báo cáo thất bại');
    } finally {
      setReporting(false);
    }
  };

  const handleBlock = async () => {
    if (isOwnPost) return;
    setBlocking(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not logged in');

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!profile) throw new Error('Profile not found');

      await supabase.from('social_blocks').insert({
        blocker_id: profile.id,
        blocked_id: authorId,
      });

      setOpen(false);
      onBlock?.();
    } catch (err) {
      console.error('Block error', err);
      alert(err instanceof Error ? err.message : 'Block failed');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
        aria-label="Options"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            type="button"
            onClick={handleReport}
            disabled={reporting}
            className={cn(
              'w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50',
              reporting && 'opacity-60'
            )}
          >
            <Flag className="w-4 h-4 text-amber-600" />
            {reporting ? 'Đang gửi...' : 'Báo cáo'}
          </button>
          {!isOwnPost && (
            <button
              type="button"
              onClick={handleBlock}
              disabled={blocking}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50',
                blocking && 'opacity-60'
              )}
            >
              <Ban className="w-4 h-4" />
              {blocking ? 'Đang chặn...' : 'Chặn người dùng'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
