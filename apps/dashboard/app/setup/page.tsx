/**
 * Setup & Testing Page for Tuto Web Dashboard
 * 
 * This page helps verify that Firebase and Backend connectivity is working correctly.
 * Use this page before proceeding with feature development.
 */

'use client';

import { useState, useEffect } from 'react';
import { initializeFirebase, getFirebaseAuth } from '../../lib/firebase/config';
import { Backend } from '../../lib/api/backend';

export default function SetupPage() {
  const [tests, setTests] = useState({
    firebase: { status: 'pending', message: '' },
    backend: { status: 'pending', message: '' },
    tables: { status: 'pending', message: '' },
  });

  const runTest = async (
    testName: keyof typeof tests,
    testFn: () => Promise<{ success: boolean; message: string }>
  ) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status: 'running', message: 'Testing...' }
    }));

    try {
      const result = await testFn();
      setTests(prev => ({
        ...prev,
        [testName]: {
          status: result.success ? 'success' : 'error',
          message: result.message
        }
      }));
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        [testName]: {
          status: 'error',
          message: error.message || 'Test failed'
        }
      }));
    }
  };

  const testFirebase = async () => {
    try {
      const success = initializeFirebase();
      if (!success) {
        return {
          success: false,
          message: 'Firebase initialization failed. Check your .env.local file.'
        };
      }

      const auth = getFirebaseAuth();
      if (!auth) {
        return {
          success: false,
          message: 'Firebase Auth not initialized'
        };
      }

      return {
        success: true,
        message: `Firebase initialized successfully. Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  const testBackend = async () => {
    try {
      // Show which URL we're trying
      const res = await fetch(`${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || ''}` || '');
      const text = await res.text();
      // Now call through our client
      const result = await Backend.healthCheck();
      if (result.ok) {
        return {
          success: true,
          message: `Backend API is reachable and healthy. Base: ${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || '(derived)'} | Raw: ${text.substring(0,100)}`
        };
      }
      return {
        success: false,
        message: 'Backend API returned unexpected response'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Backend API unreachable: ${error.message}. Base: ${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || '(derived)'}`
      };
    }
  };

  const testTables = async () => {
    try {
      // Try to list teachers (should work without auth for public endpoints)
      const result = await Backend.list('TutoTeachers', { maxRecords: 1 });
      if (result.records) {
        return {
          success: true,
          message: `Successfully connected to Airtable (${result.records.length} record(s) fetched). Base: ${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || '(derived)'}`
        };
      }
      return {
        success: false,
        message: 'Airtable query returned unexpected format'
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Airtable connection failed: ${error.message}. Base: ${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL || '(derived)'}`
      };
    }
  };

  const runAllTests = () => {
    runTest('firebase', testFirebase);
    setTimeout(() => runTest('backend', testBackend), 500);
    setTimeout(() => runTest('tables', testTables), 1000);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <span className="text-2xl">✅</span>;
      case 'error':
        return <span className="text-2xl">❌</span>;
      case 'running':
        return <span className="text-2xl">⏳</span>;
      default:
        return <span className="text-2xl">⚪</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tuto Web Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Setup & Connectivity Testing
          </p>

          {/* Environment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="font-semibold text-blue-900 mb-2">Environment Configuration</h2>
            <div className="space-y-1 text-sm text-blue-800">
              <div>
                <strong>Project ID:</strong>{' '}
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '⚠️ Not set'}
              </div>
              <div>
                <strong>Functions Region:</strong>{' '}
                {process.env.NEXT_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1 (default)'}
              </div>
              <div>
                <strong>Environment:</strong>{' '}
                {process.env.NODE_ENV}
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8">
            <button
              onClick={runAllTests}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Run All Tests
            </button>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            {/* Firebase Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <StatusIcon status={tests.firebase.status} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    1. Firebase Configuration
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Tests Firebase initialization, Auth, Functions, and Storage setup
                  </p>
                  {tests.firebase.status !== 'pending' && (
                    <div className={`text-sm p-2 rounded ${
                      tests.firebase.status === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : tests.firebase.status === 'error'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-gray-50 text-gray-800'
                    }`}>
                      {tests.firebase.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => runTest('firebase', testFirebase)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Retest
                </button>
              </div>
            </div>

            {/* Backend API Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <StatusIcon status={tests.backend.status} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    2. Backend API (Firebase Functions)
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Tests connectivity to Firebase Functions API endpoints
                  </p>
                  {tests.backend.status !== 'pending' && (
                    <div className={`text-sm p-2 rounded ${
                      tests.backend.status === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : tests.backend.status === 'error'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-gray-50 text-gray-800'
                    }`}>
                      {tests.backend.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => runTest('backend', testBackend)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Retest
                </button>
              </div>
            </div>

            {/* Airtable Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <StatusIcon status={tests.tables.status} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    3. Airtable Connection
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Tests data fetching from Airtable via Firebase Functions
                  </p>
                  {tests.tables.status !== 'pending' && (
                    <div className={`text-sm p-2 rounded ${
                      tests.tables.status === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : tests.tables.status === 'error'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-gray-50 text-gray-800'
                    }`}>
                      {tests.tables.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => runTest('tables', testTables)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Retest
                </button>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Next Steps</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Create <code className="bg-gray-200 px-1 rounded">.env.local</code> with your Firebase credentials</li>
              <li>Run all tests to verify connectivity</li>
              <li>If all tests pass, proceed to <code className="bg-gray-200 px-1 rounded">/login</code></li>
              <li>If tests fail, check the error messages and verify your configuration</li>
            </ol>
          </div>

          {/* Documentation Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Need help? Check{' '}
              <a href="/WEB_DASHBOARD_PROGRESS.md" className="text-blue-600 hover:underline">
                Progress Tracker
              </a>
              {' | '}
              <a href="/WEB_DASHBOARD_CHAT_SUMMARY.md" className="text-blue-600 hover:underline">
                Session Summary
              </a>
              {' | '}
              <a href="/WEB_DASHBOARD_FEATURES_CHECKLIST.md" className="text-blue-600 hover:underline">
                Features Checklist
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

