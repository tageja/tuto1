'use client';

import { useState }         from 'react';
import { useRouter }        from 'next/navigation';
import CreatePostModal      from '@/components/feed/CreatePostModal';

export default function CreatePageClient() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CreatePostModal open={open} onClose={handleClose} />
    </div>
  );
}
