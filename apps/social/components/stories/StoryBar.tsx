'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getFeedStories, type StoryGroup } from '@/lib/stories';
import { useAuth } from '@/contexts/AuthContext';
import StoryViewerModal from './StoryViewerModal';
import CreateStoryModal from './CreateStoryModal';

export default function StoryBar() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [initialGroupIndex, setInitialGroupIndex] = useState(0);

  const loadStories = useCallback(async () => {
    try {
      const data = await getFeedStories();
      setGroups(data);
    } catch (err) {
      console.warn('Stories load error', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleOwnPress = () => setCreateOpen(true);

  const handleGroupPress = (group: StoryGroup) => {
    const idx = groups.findIndex((g) => g.authorId === group.authorId);
    setInitialGroupIndex(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex gap-4 py-4 px-4 border-b border-gray-200 overflow-x-auto">
        <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse shrink-0" />
      </div>
    );
  }

  type Item =
    | { type: 'own'; profile: { id: string; displayName: string; avatarUrl?: string } }
    | { type: 'group'; group: StoryGroup };

  const items: Item[] = [];
  if (profile) {
    items.push({
      type: 'own',
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      },
    });
  }
  groups.forEach((g) => items.push({ type: 'group', group: g }));

  if (items.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 py-4 px-4 border-b border-gray-200 overflow-x-auto">
        {items.map((item) => {
          if (item.type === 'own') {
            return (
              <button
                key="own"
                type="button"
                onClick={handleOwnPress}
                className="flex flex-col items-center shrink-0 gap-1"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#F58529] ring-offset-2 bg-gray-100">
                  {item.profile.avatarUrl ? (
                    <Image
                      src={item.profile.avatarUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-semibold text-xl">
                      {item.profile.displayName?.charAt(0) ?? '?'}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">Tin của bạn</span>
              </button>
            );
          }
          const g = item.group;
          const author = g.author as { display_name?: string; avatar_url?: string } | undefined;
          return (
            <button
              key={g.authorId}
              type="button"
              onClick={() => handleGroupPress(g)}
              className="flex flex-col items-center shrink-0 gap-1"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#F58529] ring-offset-2 bg-gray-100">
                {author?.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-semibold text-xl">
                    {author?.display_name?.charAt(0) ?? '?'}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 max-w-[72px] truncate">
                {author?.display_name ?? 'Unknown'}
              </span>
            </button>
          );
        })}
      </div>

      <StoryViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        groups={groups}
        initialGroupIndex={initialGroupIndex}
      />

      <CreateStoryModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={loadStories}
      />
    </>
  );
}
