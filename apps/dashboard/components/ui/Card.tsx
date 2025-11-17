'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated';
}

export function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'lg',
  variant = 'elevated',
  ...props 
}: CardProps) {
  const baseStyles = 'bg-white rounded-lg transition-all duration-200';
  
  const variantStyles = {
    default: 'shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
    bordered: 'border border-[#E4E6EB]',
    elevated: 'shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverStyles = hover ? 'hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}






