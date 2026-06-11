'use client';

import { useState } from 'react';
import FeedComposerCard from './FeedComposerCard';
import CreatePostModal  from './CreatePostModal';

type PostMode = 'text' | 'photo' | 'event' | 'achievement';

export default function FeedComposerWrapper() {
  const [open, setOpen]       = useState(false);
  const [mode, setMode] = useState<PostMode>('text');

  const handleOpen = (m?: PostMode) => {
    setMode(m ?? 'text');
    setOpen(true);
  };

  return (
    <>
      <FeedComposerCard onOpen={handleOpen} />
      <CreatePostModal
        open={open}
        onClose={() => setOpen(false)}
        initialMode={mode}
      />
    </>
  );
}
