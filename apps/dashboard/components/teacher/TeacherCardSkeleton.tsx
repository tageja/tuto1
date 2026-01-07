'use client';

import React from 'react';

export function TeacherCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gray-200" />
        
        {/* Name & Subject */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
        <div className="h-5 bg-gray-200 rounded-lg w-16" />
        <div className="h-5 bg-gray-200 rounded-lg w-12" />
        <div className="h-5 bg-gray-200 rounded-lg w-20" />
      </div>

      {/* Location */}
      <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-4" />

      {/* Languages */}
      <div className="flex gap-2 mb-5">
        <div className="h-6 bg-gray-200 rounded-lg w-16" />
        <div className="h-6 bg-gray-200 rounded-lg w-16" />
      </div>

      {/* CTA Button */}
      <div className="h-12 bg-gray-200 rounded-xl w-full" />
    </div>
  );
}
