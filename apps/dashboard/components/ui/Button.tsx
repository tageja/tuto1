import * as React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  asChild?: boolean;
}

export function Button({ 
  variant = 'default', 
  size = 'default',
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#0B5FFF] focus-visible:ring-offset-2';
  
  const variantStyles = {
    default: 'bg-[#0B5FFF] text-white hover:bg-[#0B5FFF]/90',
    secondary: 'bg-[#F9FAFC] text-[#333333] hover:bg-[#F9FAFC]/80',
    outline: 'border border-gray-200 bg-white text-[#333333] hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 hover:text-[#333333]',
  };
  
  const sizeStyles = {
    sm: 'h-8 rounded-md px-3',
    default: 'h-9 px-4 py-2',
    lg: 'h-10 rounded-md px-6',
  };
  
  return (
    <button 
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}

export default Button;






