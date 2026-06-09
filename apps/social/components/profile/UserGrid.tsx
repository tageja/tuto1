'use client';

import Link from 'next/link';
import Image from 'next/image';
import ProfileFollowButton from './FollowButton';
import type { SocialProfile } from './types';
import { cn } from '@/lib/utils';

const ROLE_COLOR: Record<string, string> = {
  student:     'bg-[#0B5FFF] text-white',
  parent:      'bg-emerald-500 text-white',
  teacher:     'bg-violet-500 text-white',
  coach:       'bg-cyan-500 text-white',
  schoolAdmin: 'bg-orange-500 text-white',
  institute:   'bg-pink-500 text-white',
  guest:       'bg-gray-400 text-white',
};

const ROLE_LABEL: Record<string, string> = {
  student:     'Học sinh',
  parent:      'Phụ huynh',
  teacher:     'Giáo viên',
  coach:       'Huấn luyện',
  schoolAdmin: 'Trường',
  institute:   'Trung tâm',
  guest:       'Khách',
};

interface Props {
  users: SocialProfile[];
  currentProfileId?: string;
}

export default function UserGrid({ users, currentProfileId }: Props) {
  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Không tìm thấy người dùng
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {users.map((user) => {
        const isOwn = user.id === currentProfileId;
        return (
          <div
            key={user.id}
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow"
          >
            <Link href={`/profile/${encodeURIComponent(user.username)}`} className="flex flex-col items-center w-full">
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-3">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                    {user.displayName?.charAt(0) ?? '?'}
                  </div>
                )}
              </div>
              <p className="font-semibold text-gray-900 truncate w-full" title={user.displayName}>
                {user.displayName}
              </p>
              <span
                className={cn(
                  'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  ROLE_COLOR[user.role] ?? ROLE_COLOR.guest,
                )}
              >
                {ROLE_LABEL[user.role] ?? user.role}
                {user.isVerified && ' ✓'}
              </span>
              {user.schoolName && (
                <p className="mt-1 text-xs text-gray-500 truncate w-full" title={user.schoolName}>
                  {user.schoolName}
                </p>
              )}
            </Link>
            {!isOwn && (
              <div className="mt-3">
                <ProfileFollowButton targetProfileId={user.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
