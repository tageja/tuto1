import React from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {subtitle ? <p className="mt-2 text-gray-600">{subtitle}</p> : null}
    </header>
  );
}




