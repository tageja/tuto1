'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGate } from '@/contexts/AuthGateContext';

interface Props {
  onOpen: (mode?: 'photo' | 'event' | 'achievement') => void;
}

export default function FeedComposerCard({ onOpen }: Props) {
  const { user, profile } = useAuth();
  const { promptAuth } = useAuthGate();

  const handleClick = (mode?: 'photo' | 'event' | 'achievement') => {
    if (!user) {
      promptAuth('Đăng nhập để chia sẻ với cộng đồng.');
      return;
    }
    onOpen(mode);
  };

  const initials = profile?.displayName?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="card mb-3">
      <div className="flex items-center gap-3 mb-3">
        {profile?.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.displayName ?? ''}
            width={40}
            height={40}
            className="rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
            {initials}
          </div>
        )}
        <button
          type="button"
          onClick={() => handleClick()}
          className="flex-1 text-left px-4 py-2.5 bg-surface rounded-full text-sm text-gray-400 hover:bg-gray-100 transition-colors"
        >
          Chia sẻ với cộng đồng trường...
        </button>
      </div>

      <div className="flex items-center justify-around border-t border-gray-100 pt-2.5">
        <button
          type="button"
          onClick={() => handleClick('photo')}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base">📷</span>
          <span>Ảnh</span>
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <button
          type="button"
          onClick={() => handleClick('event')}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base">📅</span>
          <span>Sự kiện</span>
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <button
          type="button"
          onClick={() => handleClick('achievement')}
          className="flex items-center gap-2 flex-1 justify-center py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base">🏆</span>
          <span>Thành tích</span>
        </button>
      </div>
    </div>
  );
}
