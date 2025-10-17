import React from 'react';

export function FAQ({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      {items.map((it, idx) => (
        <div key={idx} className="p-6">
          <div className="font-medium">{it.q}</div>
          <div className="mt-1 text-gray-600">{it.a}</div>
        </div>
      ))}
    </div>
  );
}


