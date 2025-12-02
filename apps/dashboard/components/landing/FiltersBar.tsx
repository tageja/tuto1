"use client";

import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { subjects, distances, prices } from "../../lib/demoData";
import { motion } from "framer-motion";

export default function FiltersBar() {
  return (
    <div className="bg-white border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 whitespace-nowrap">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </div>
          
          <div className="h-6 w-px bg-gray-200 mx-1 flex-shrink-0" />

          {subjects.slice(0, 4).map((subject) => (
            <button
              key={subject}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary hover:bg-blue-50 transition-all whitespace-nowrap shadow-sm"
            >
              {subject}
            </button>
          ))}
          
          <div className="h-6 w-px bg-gray-200 mx-1 flex-shrink-0 hidden md:block" />
          
          {distances.slice(0, 2).map((dist) => (
            <button
              key={dist}
              className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary hover:bg-blue-50 transition-all whitespace-nowrap shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              {dist}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

