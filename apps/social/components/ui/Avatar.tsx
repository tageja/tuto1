import React from 'react';
import Image from 'next/image';
import { cn, getInitials } from '@/lib/utils';

const sizeMap = {
  xs:  { wh: 'w-6 h-6',   text: 'text-[10px]', px: 24 },
  sm:  { wh: 'w-8 h-8',   text: 'text-xs',     px: 32 },
  md:  { wh: 'w-10 h-10', text: 'text-sm',      px: 40 },
  lg:  { wh: 'w-14 h-14', text: 'text-base',    px: 56 },
  xl:  { wh: 'w-20 h-20', text: 'text-xl',      px: 80 },
};

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: keyof typeof sizeMap;
  className?: string;
  /** Background color for initials fallback (Tailwind bg-* class) */
  fallbackBg?: string;
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className,
  fallbackBg = 'bg-blue-100',
}: AvatarProps) {
  const { wh, text, px } = sizeMap[size];
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0',
        wh,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name || 'Avatar'}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center',
            fallbackBg,
          )}
        >
          <span className={cn('font-semibold text-primary', text)}>
            {initials || '?'}
          </span>
        </div>
      )}
    </div>
  );
}
