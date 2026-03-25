'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  read: boolean;
  created_at: string;
  post_id: string | null;
  data: Record<string, unknown>;
  actor: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
}

interface Props {
  initialNotifications: Notification[];
  userId: string;
  profileUsername: string;
}

function getNotificationText(type: string, actorName: string, data: Record<string, unknown>): string {
  const actor = actorName || 'Ai đó';
  switch (type) {
    case 'like':
      return `${actor} đã thích bài viết của bạn`;
    case 'applaud':
      return `${actor} đã hoan nghênh bài viết của bạn`;
    case 'curious':
      return `${actor} tò mò về bài viết của bạn`;
    case 'comment':
      return `${actor} đã bình luận: "${(data.preview as string) ?? ''}"`;
    case 'comment_like':
      return `${actor} đã thích bình luận của bạn`;
    case 'follow':
      return `${actor} đã theo dõi bạn`;
    case 'mention':
      return `${actor} đã đề cập đến bạn`;
    case 'achievement':
      return `Chúc mừng! Bạn đã đạt thành tích: ${(data.achievementTitle as string) ?? ''}`;
    case 'level_up':
      return `Bạn đã lên cấp ${(data.level as number) ?? ''}! 🎉`;
    case 'shield_earned':
      return `Bạn nhận được ${(data.shieldCount as number) ?? 0} Shield 🛡`;
    case 'school_announcement':
      return `Thông báo mới từ trường: ${(data.title as string) ?? ''}`;
    case 'moderation_approved':
      return 'Bài viết của bạn đã được duyệt ✓';
    case 'moderation_rejected':
      return 'Bài viết của bạn đã bị từ chối';
    case 'reel_like':
      return `${actor} đã thích Reel của bạn`;
    default:
      return 'Cập nhật mới';
  }
}

function getNotificationLink(n: Notification, profileUsername: string): string | null {
  switch (n.type) {
    case 'like':
    case 'applaud':
    case 'curious':
    case 'comment':
    case 'comment_like':
    case 'moderation_approved':
    case 'moderation_rejected':
      return n.post_id ? `/post/${n.post_id}` : null;
    case 'follow':
      return n.actor?.username ? `/profile/${encodeURIComponent(n.actor.username)}` : null;
    case 'achievement':
    case 'level_up':
    case 'shield_earned':
      return profileUsername ? `/profile/${encodeURIComponent(profileUsername)}` : null;
    case 'school_announcement':
      return '/feed';
    case 'reel_like':
    case 'mention':
    default:
      return n.post_id ? `/post/${n.post_id}` : null;
  }
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function NotificationsClient({
  initialNotifications,
  userId,
  profileUsername,
}: Props) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (unreadCount === 0) return;
    const supabase = getSupabaseBrowserClient();
    void (async () => {
      try {
        await supabase
          .from('social_notifications')
          .update({ read: true })
          .eq('recipient_id', userId)
          .eq('read', false);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [userId, unreadCount]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    const supabase = getSupabaseBrowserClient();
    await supabase
      .from('social_notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <span className="text-5xl mb-4">🔔</span>
        <p className="font-medium text-gray-700">Chưa có thông báo nào</p>
        <p className="text-sm mt-1 text-center max-w-xs">
          Khi có người thích hoặc bình luận bài viết của bạn, sẽ hiển thị ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="text-sm text-primary font-medium mb-2 hover:underline"
        >
          Đánh dấu tất cả đã đọc
        </button>
      )}
      {notifications.map((n) => {
        const actorName = n.actor?.display_name ?? n.actor?.username ?? '';
        const text = getNotificationText(n.type, actorName, n.data);
        const href = getNotificationLink(n, profileUsername);

        const rowClass = cn(
          'flex items-start gap-3 p-3 rounded-xl transition-colors',
          !n.read ? 'bg-blue-50 border-l-2 border-primary' : 'bg-white hover:bg-gray-50',
          href ? 'cursor-pointer' : 'cursor-default'
        );

        const content = (
          <>
            {n.actor?.avatar_url ? (
              <Image
                src={n.actor.avatar_url}
                alt={actorName}
                width={40}
                height={40}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                {actorName?.charAt(0) ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{text}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(n.created_at)}</p>
            </div>
          </>
        );

        return href ? (
          <Link key={n.id} href={href} className={rowClass}>
            {content}
          </Link>
        ) : (
          <div key={n.id} className={rowClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
