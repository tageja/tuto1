import React from 'react';

export function KPIGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-3xl font-semibold">{k.value}</div>
          <div className="mt-1 text-gray-600">{k.label}</div>
        </div>
      ))}
    </div>
  );
}




