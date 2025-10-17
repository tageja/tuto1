import React from 'react';

export function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-lg font-medium">{title}</div>
      <div className="mt-2 text-gray-600">{desc}</div>
    </div>
  );
}


