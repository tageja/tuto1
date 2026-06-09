'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark rounded-button',
        secondary: 'bg-surface text-text-primary border border-gray-200 hover:bg-gray-100 rounded-button',
        ghost: 'text-text-primary hover:bg-surface rounded-button',
        danger: 'bg-red-500 text-white hover:bg-red-600 rounded-button',
        outline: 'border border-primary text-primary hover:bg-blue-50 rounded-button',
      },
      size: {
        sm:  'px-3 py-1.5 text-xs',
        md:  'px-5 py-2.5 text-sm',
        lg:  'px-6 py-3 text-base',
        icon: 'w-9 h-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
