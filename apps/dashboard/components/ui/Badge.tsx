import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export function Badge({ 
  children, 
  variant = 'gray', 
  size = 'md',
  dot = false,
  className = '' 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variantStyles = {
    primary: 'bg-primary-light text-primary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {dot && (
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          variant === 'primary' ? 'bg-primary' :
          variant === 'success' ? 'bg-green-600' :
          variant === 'warning' ? 'bg-yellow-600' :
          variant === 'error' ? 'bg-red-600' :
          'bg-gray-600'
        }`} />
      )}
      {children}
    </span>
  );
}

export default Badge;


























