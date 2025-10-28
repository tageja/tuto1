"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from "../../lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  children: React.ReactNode;
}

export function Select({ 
  value: controlledValue, 
  defaultValue = '', 
  onValueChange,
  required,
  children 
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
        {required && !value && (
          <input
            type="text"
            required
            value=""
            onChange={() => {}}
            className="absolute inset-0 opacity-0 pointer-events-none"
            tabIndex={-1}
          />
        )}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export function SelectTrigger({ id, className = '', children }: SelectTriggerProps) {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectTrigger must be used within Select');
  }

  return (
    <button
      id={id}
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5FFF] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <svg
        className={cn('h-4 w-4 opacity-50 transition-transform', context.open && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectValue must be used within Select');
  }

  // Map the value to a display label
  const displayLabels: Record<string, string> = {
    'parent': 'Parent',
    'student': 'Student',
    'teacher': 'Teacher',
    'school_admin': 'School Admin',
  };

  const displayValue = context.value ? displayLabels[context.value] || context.value : placeholder;

  return (
    <span className={!context.value ? 'text-gray-400' : 'text-gray-900'}>
      {displayValue}
    </span>
  );
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

export function SelectContent({ className = '', children }: SelectContentProps) {
  const context = useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('SelectContent must be used within Select');
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        context.setOpen(false);
      }
    };

    if (context.open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [context, context.open]);

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-md',
        className
      )}
    >
      <div className="p-1 max-h-60 overflow-auto">
        {children}
      </div>
    </div>
  );
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function SelectItem({ value, className = '', children }: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectItem must be used within Select');
  }

  const isSelected = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
        isSelected && 'bg-gray-100 text-[#0B5FFF] font-medium',
        className
      )}
    >
      {children}
    </button>
  );
}

