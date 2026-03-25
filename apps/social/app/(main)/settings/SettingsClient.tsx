'use client';

import { useState, useCallback } from 'react';
import Avatar from '@/components/ui/Avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { SettingsUserRow } from './page';

type Tab = 'blocked' | 'muted';

interface Props {
  myProfileId: string;
  initialBlocked: SettingsUserRow[];
  initialMuted: SettingsUserRow[];
}

export default function SettingsClient({
  myProfileId,
  initialBlocked,
  initialMuted,
}: Props) {
  const [tab, setTab] = useState<Tab>('blocked');
  const [blocked, setBlocked] = useState(initialBlocked);
  const [muted, setMuted] = useState(initialMuted);

  const unblock = useCallback(
    async (userId: string) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('social_blocks')
        .delete()
        .eq('blocker_id', myProfileId)
        .eq('blocked_id', userId);
      if (!error) setBlocked((prev) => prev.filter((u) => u.id !== userId));
    },
    [myProfileId],
  );

  const unmute = useCallback(
    async (userId: string) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('social_mutes')
        .delete()
        .eq('muter_id', myProfileId)
        .eq('muted_id', userId);
      if (!error) setMuted((prev) => prev.filter((u) => u.id !== userId));
    },
    [myProfileId],
  );

  const list = tab === 'blocked' ? blocked : muted;
  const emptyText =
    tab === 'blocked' ? 'Bạn chưa chặn ai' : 'Bạn chưa tắt tiếng ai nào';

  return (
    <div>
      <div className="flex border-b border-gray-100 mb-4">
        <button
          type="button"
          onClick={() => setTab('blocked')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            tab === 'blocked'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary',
          )}
        >
          Người dùng bị chặn
        </button>
        <button
          type="button"
          onClick={() => setTab('muted')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            tab === 'muted'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary',
          )}
        >
          Bị tắt tiếng
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-text-secondary text-sm py-8 text-center">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {list.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-3 p-3 rounded-card bg-surface border border-gray-100"
            >
              <Avatar
                src={u.avatar_url}
                name={u.display_name ?? u.username}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {u.display_name || u.username}
                </p>
                <p className="text-sm text-text-secondary truncate">@{u.username}</p>
              </div>
              {tab === 'blocked' ? (
                <button
                  type="button"
                  onClick={() => void unblock(u.id)}
                  className="px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200 text-text-primary hover:bg-white transition-colors flex-shrink-0"
                >
                  Bỏ chặn
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void unmute(u.id)}
                  className="px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200 text-text-primary hover:bg-white transition-colors flex-shrink-0"
                >
                  Bỏ tắt tiếng
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
