"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Shield, Key, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdminOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }

    if (!user?.email || !user?.id) {
      setError('User information not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate the code
      const { data: invitation, error: inviteError } = await supabase
        .from('school_invitations')
        .select(`
          id,
          school_id,
          invitation_type,
          status,
          expires_at,
          schools (
            id,
            name,
            status
          )
        `)
        .eq('token', code.trim().toUpperCase())
        .eq('invitation_type', 'admin_onboarding')
        .eq('status', 'pending')
        .maybeSingle();

      if (inviteError) {
        setError('Error validating code');
        return;
      }

      if (!invitation) {
        setError('Invalid or already used code');
        return;
      }

      // Check expiry
      if (invitation.expires_at) {
        const expiryDate = new Date(invitation.expires_at);
        if (expiryDate < new Date()) {
          setError('This code has expired');
          return;
        }
      }

      // Check school status
      const school = invitation.schools as any;
      if (!school || school.status !== 'active') {
        setError('School is not active');
        return;
      }

      const schoolId = school.id;

      // Mark invitation as accepted
      await supabase
        .from('school_invitations')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', invitation.id);

      // Create school_admins entry
      const { error: adminError } = await supabase
        .from('school_admins')
        .insert({
          school_id: schoolId,
          user_id: user.id,
        });

      if (adminError && adminError.code !== '23505') {
        console.error('Error creating admin:', adminError);
        setError('Failed to setup admin access');
        return;
      }

      // Update user role
      await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('auth_user_id', user.id);

      // Create or update school_teachers entry
      const { data: existingTeacher } = await supabase
        .from('school_teachers')
        .select('id')
        .eq('school_id', schoolId)
        .eq('email', user.email)
        .maybeSingle();

      if (!existingTeacher) {
        await supabase
          .from('school_teachers')
          .insert({
            school_id: schoolId,
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email,
            status: 'active',
          });
      }

      // Success - navigate to school dashboard
      alert('Success! Setting up your admin access...');
      router.push(`/school/${schoolId}/admin`);
    } catch (err) {
      console.error('Admin code redemption error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              School Admin Onboarding
            </h1>
            <p className="text-gray-600">
              Enter the executive code provided by Tuto
            </p>
          </div>

          {/* Form */}
          <form onPress={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-900 mb-2">
                Executive School Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter school code"
                  disabled={loading}
                  maxLength={20}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Note:</span> This code is provided by a Tuto executive for school administrators. 
              If you don't have a code, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

