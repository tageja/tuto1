"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { School, ArrowRight, ArrowLeft, Shield, Users } from 'lucide-react';
import Image from 'next/image';

interface SchoolAssociation {
  school_id: string;
  school_name: string;
  school_logo_url: string | null;
  role: 'admin' | 'parent';
  access_type: 'teacher' | 'parent';
}

export default function SchoolSelectorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schools, setSchools] = useState<SchoolAssociation[]>([]);

  useEffect(() => {
    // Parse schools from query params
    const schoolsParam = searchParams.get('schools');
    if (schoolsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(schoolsParam));
        setSchools(parsed);
      } catch (err) {
        console.error('Error parsing schools:', err);
        router.push('/welcome');
      }
    } else {
      // No schools provided, redirect back
      router.push('/welcome');
    }
  }, [searchParams]);

  const handleSelectSchool = (school: SchoolAssociation) => {
    router.push(`/school/${school.school_id}/${school.role}`);
  };

  const handleBack = () => {
    router.back();
  };

  if (schools.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No schools found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Select a School
            </h1>
            <p className="text-lg text-gray-600">
              Choose which school you want to access
            </p>
          </div>

          {/* Schools Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {schools.map((school) => (
              <button
                key={school.school_id}
                onClick={() => handleSelectSchool(school)}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 text-left"
              >
                {/* School Header */}
                <div className="flex items-start gap-4 mb-4">
                  {school.school_logo_url ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={school.school_logo_url}
                        alt={school.school_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <School className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                      {school.school_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Your Role:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {school.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3" />
                            Parent
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Select School
                  </span>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

