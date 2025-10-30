'use client';

import { useState } from 'react';
import { School, useSchool } from '../../contexts/SchoolContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { School as SchoolIcon, Users, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SchoolSelectorProps {
  role: 'admin' | 'parent';
}

export function SchoolSelector({ role }: SchoolSelectorProps) {
  const { availableSchools, setSelectedSchool } = useSchool();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const handleSelect = (school: School) => {
    setSelectedSchool(school);
    // Redirect to appropriate dashboard based on role
    router.push(`/school/${role}`);
  };

  if (availableSchools.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <SchoolIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-2">No Schools Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have access to any schools yet. Please contact your administrator.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Select Your School</h1>
          <p className="text-gray-600">Choose a school to access your dashboard</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSchools.map((school) => (
            <Card
              key={school.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedId === school.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedId(school.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <SchoolIcon className="w-6 h-6 text-blue-600" />
                </div>
                {school.type && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {school.type}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2">{school.name}</h3>

              {school.address && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {school.address}
                </div>
              )}

              {school.studentCount !== undefined && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {school.studentCount} students
                </div>
              )}

              <Button
                className="w-full mt-4"
                variant={selectedId === school.id ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(school);
                }}
              >
                {selectedId === school.id ? 'Access Dashboard' : 'Select'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}




