import React from 'react';

export function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`mt-10 ${className}`.trim()}>{children}</section>;
}


