"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp, loading, error, clearError, signInWithGoogle, firebaseUser } = useAuth();
  const router = require('next/navigation').useRouter();
  const { useEffect } = require('react');

  // If already authenticated, redirect to /home
  useEffect(() => {
    if (firebaseUser) {
      router.push('/home');
    }
  }, [firebaseUser]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'parent' | 'student' | 'school_admin'>('parent');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (isSignUp) {
      await signUp(email.trim(), password, name.trim() || 'Tuto User', role);
    } else {
      await signIn(email.trim(), password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFC]">
      {/* Header with Tuto Logo */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/api/assets/images/tuto-logo.png" alt="Tuto" width={120} height={28} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Illustration side (align with mobile home illustration) */}
        <div className="hidden md:flex items-center justify-center p-8">
          <Image
            src="/api/assets/images/home-illustration.png"
            alt="Learning Illustration"
            width={640}
            height={480}
            className="rounded-2xl shadow-2xl"
            priority
          />
        </div>

        {/* Auth form side */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#0B5FFF] mb-3">{isSignUp ? 'Create your Tuto account' : 'Welcome back to Tuto'}</h1>
            <p className="text-[#333333]/80 mb-8">Manage schools, teachers, and your learning community in one place.</p>

            <form onSubmit={onSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]"
                    placeholder="John Nguyen"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#333333] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333333] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]"
                  placeholder="••••••••"
                  required
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-1">Select role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['parent','student','teacher','school_admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`rounded-xl border px-4 py-2 text-sm ${role===r? 'border-[#0B5FFF] bg-[#0B5FFF]/10 text-[#0B5FFF]':'border-gray-200 text-[#333]'}`}
                      >{r.replace('_',' ')}</button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B5FFF] hover:bg-[#0A50DF] text-white rounded-xl py-3 font-semibold uppercase tracking-wide shadow-lg"
              >
                {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Sign-In */}
            <button
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#333] rounded-xl py-3 font-medium shadow-sm flex items-center justify-center gap-3"
              type="button"
            >
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
              Continue with Google
            </button>

            <div className="mt-4 text-sm text-[#333333]/70">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { clearError(); setIsSignUp(!isSignUp); }}
                className="text-[#0B5FFF] hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


