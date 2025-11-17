'use client';

import { useState } from 'react';
import { useSchool } from '../../contexts/SchoolContext';
import { School as SchoolIcon, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SchoolDropdown() {
  const { selectedSchool, availableSchools, setSelectedSchool } = useSchool();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSchoolChange = (school: typeof selectedSchool) => {
    setSelectedSchool(school);
    setIsOpen(false);
    // Refresh the page to load new school data
    router.refresh();
  };

  if (!selectedSchool) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <SchoolIcon className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-sm">{selectedSchool.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[240px] z-20">
            {availableSchools.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSchoolChange(school)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-sm">{school.name}</span>
                {school.id === selectedSchool.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}













