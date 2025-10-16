import React from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: string;
  rows?: number;
}

export function Field({ 
  label, 
  error, 
  helperText,
  leftIcon,
  rightIcon,
  className = '', 
  type = 'text',
  rows,
  id,
  ...props 
}: FieldProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const baseStyles = 'w-full px-4 py-3 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-500 transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const borderStyles = error 
    ? 'border-error focus:border-error focus:ring-4 focus:ring-error/10'
    : 'border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10';
  
  const iconPaddingLeft = leftIcon ? 'pl-11' : '';
  const iconPaddingRight = rightIcon ? 'pr-11' : '';
  
  const inputStyles = `${baseStyles} ${borderStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={inputId}
            className={inputStyles}
            rows={rows || 4}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            className={inputStyles}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default Field;






