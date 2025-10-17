import React from 'react';

export function CTA({ title, desc, actionLabel }: { title: string; desc: string; actionLabel: string }) {
  return (
    <div className="rounded-xl bg-primary text-white p-6">
      <div className="text-xl font-semibold">{title}</div>
      <div className="mt-1 opacity-90">{desc}</div>
      <button className="mt-4 rounded-xl bg-white px-4 py-2 text-primary font-medium uppercase">{actionLabel}</button>
    </div>
  );
}


