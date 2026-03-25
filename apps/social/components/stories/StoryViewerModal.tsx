'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { markViewed, reactToStory, type StoryGroup, type Story } from '@/lib/stories';

interface Props {
  open: boolean;
  onClose: () => void;
  groups: StoryGroup[];
  initialGroupIndex: number;
}

const PHOTO_DURATION_MS = 5000;

export default function StoryViewerModal({
  open,
  onClose,
  groups,
  initialGroupIndex,
}: Props) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const group = groups[groupIndex];
  const stories = group?.stories ?? [];
  const story = stories[storyIndex];

  const advanceStory = useCallback(() => {
    if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, stories.length, groupIndex, groups.length, onClose]);

  const goBack = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1);
      const prevStories = groups[groupIndex - 1]?.stories ?? [];
      setStoryIndex(prevStories.length - 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, groupIndex, groups, onClose]);

  useEffect(() => {
    if (!open) return;
    setGroupIndex(initialGroupIndex);
    setStoryIndex(0);
    setProgress(0);
  }, [open, initialGroupIndex]);

  useEffect(() => {
    if (!story || !open) return;

    markViewed(story.id).catch(console.warn);

    if (story.media_type === 'video') {
      // Video handles its own duration via onEnded
      return;
    }

    const duration = (story.duration_seconds ?? 5) * 1000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        advanceStory();
      }
    }, 50);
    return () => clearInterval(timer);
  }, [story?.id, story?.media_type, story?.duration_seconds, open, advanceStory]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goBack();
      if (e.key === 'ArrowRight') advanceStory();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, goBack, advanceStory]);

  if (!open) return null;

  if (!group || stories.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white p-2"
          aria-label="Close"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    );
  }

  const author = group.author as { display_name?: string; avatar_url?: string } | undefined;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute top-12 left-2 right-2 flex gap-1 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75"
              style={{ width: `${i < storyIndex ? 100 : i === storyIndex ? progress * 100 : 0}%` }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-14 left-0 right-0 flex items-center gap-3 px-4 z-10">
        <button
          type="button"
          onClick={onClose}
          className="text-white p-2 -ml-2"
          aria-label="Close"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-500 shrink-0">
            {author?.avatar_url ? (
              <Image src={author.avatar_url} alt="" width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                {author?.display_name?.charAt(0) ?? '?'}
              </div>
            )}
          </div>
          <span className="text-white font-semibold text-sm">{author?.display_name ?? 'Unknown'}</span>
        </div>
      </div>

      {/* Content - click areas */}
      <div className="absolute inset-0 flex">
        <button
          type="button"
          className="flex-1"
          onClick={goBack}
          aria-label="Previous"
        />
        <button
          type="button"
          className="flex-1"
          onClick={advanceStory}
          aria-label="Next"
        />
      </div>

      {/* Media */}
      <div className="absolute inset-0 flex items-center justify-center">
        {story.media_type === 'video' ? (
          <video
            src={story.media_url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            playsInline
            onEnded={advanceStory}
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={story.media_url}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        {story.text_overlay && (
          <p
            className="absolute bottom-24 left-4 right-4 text-center text-lg"
            style={{ color: story.text_color || '#FFFFFF' }}
          >
            {story.text_overlay}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="absolute bottom-12 left-4 right-4 flex items-center gap-2 z-10">
        <input
          type="text"
          placeholder="Trả lời..."
          className="flex-1 rounded-full border border-white/50 bg-transparent px-4 py-2 text-white placeholder-white/70 text-sm"
          readOnly
        />
        <button
          type="button"
          onClick={() => story && reactToStory(story.id)}
          className="p-2 text-white"
          aria-label="React"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <span className="text-white/80 text-sm flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {story.view_count}
        </span>
      </div>
    </div>
  );
}
