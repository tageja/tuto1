import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  status?: 'online' | 'offline' | 'busy';
}

export function Avatar({ 
  src, 
  alt = '', 
  name = '', 
  size = 'md',
  status,
  className = '' 
}: AvatarProps) {
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };
  
  const statusSizeStyles = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };
  
  const statusColorStyles = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
  };
  
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizeStyles[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center font-semibold text-gray-600 border-2 border-white shadow-sm`}>
        {src ? (
          <Image
            src={src}
            alt={alt || name}
            width={parseInt(sizeStyles[size].split(' ')[0].replace('w-', '')) * 4}
            height={parseInt(sizeStyles[size].split(' ')[0].replace('w-', '')) * 4}
            className="object-cover w-full h-full"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      
      {status && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizeStyles[size]} ${statusColorStyles[status]} rounded-full border-2 border-white`}
          aria-label={status}
        />
      )}
    </div>
  );
}

export default Avatar;


























