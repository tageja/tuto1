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
  const baseStyles = 'bg-card rounded-lg transition-all duration-200';
  
  const variantStyles = {
    default: 'shadow-sm',
    bordered: 'border border-border',
    elevated: 'shadow-sm',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverStyles = hover ? 'hover:shadow-md cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}






