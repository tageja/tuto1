"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { School, Home, Users, Key, Loader2, AlertCircle } from 'lucide-react';

interface SchoolAssociation {
  school_id: string;
  school_name: string;
  school_logo_url: string | null;
  role: 'admin' | 'parent';
  access_type: 'teacher' | 'parent';
}

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolAssociation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadSchoolAssociations();
    } else {
      // No user, redirect to login
      router.push('/login');
    }
  }, [user]);

  const loadSchoolAssociations = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_user_school_associations', { user_email: user.email });

      if (rpcError) {
        console.error('Error loading school associations:', rpcError);
        setError('Failed to load your schools');
        return;
      }

      console.log('School associations:', data);
      setSchools(data || []);
    } catch (err) {
      console.error('Exception loading schools:', err);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSchoolDashboard = () => {
    if (schools.length === 0) {
      alert('You are not associated with any schools yet.');
      return;
    }

    if (schools.length === 1) {
      // Single school - navigate directly
      const school = schools[0];
      router.push(`/school/${school.school_id}/${school.role}`);
    } else {
      // Multiple schools - show selector
      router.push(`/school-selector?schools=${encodeURIComponent(JSON.stringify(schools))}`);
    }
  };

  const handleContinueToTuto = () => {
    router.push('/home');
  };

  const handleJoinSchool = () => {
    router.push('/join-school');
  };

  const handleAdminOnboarding = () => {
    router.push('/admin-onboarding');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking your schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={loadSchoolAssociations}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasSchools = schools.length > 0;
  const multipleSchools = schools.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to tuto.
            </h1>
            <p className="text-lg text-gray-600">
              Choose how you want to continue
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* School Dashboard Option - Show if user has schools */}
            {hasSchools && (
              <button
                onClick={handleGoToSchoolDashboard}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 text-left"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition">
                    <School className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {multipleSchools ? 'Select School' : 'Go to School Dashboard'}
                    </h3>
                    <p className="text-gray-600">
                      {multipleSchools
                        ? `You have access to ${schools.length} schools`
                        : schools[0]?.school_name}
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Join School Option - Show if user has no schools */}
            {!hasSchools && (
              <button
                onClick={handleJoinSchool}
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 text-left"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Join a School
                    </h3>
                    <p className="text-gray-600">
                      Enter your school invitation code
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Continue to Tuto Home - Always show */}
            <button
              onClick={handleContinueToTuto}
              className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500 text-left"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition">
                  <Home className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Continue to tuto. Home
                  </h3>
                  <p className="text-gray-600">
                    Find tutors and connect with educators
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Admin Onboarding Link - Only show if user has no schools */}
          {!hasSchools && (
            <div className="text-center">
              <button
                onClick={handleAdminOnboarding}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition text-sm underline"
              >
                <Key className="w-4 h-4" />
                School Admin? Click here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

