'use client';

import React from 'react';

export default function DataRetentionPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="prose prose-blue max-w-none">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Retention Policy</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Tuto Education Platform</strong></p>
            <p>Operated by: Tarun Tageja</p>
            <p>Location: Ho Chi Minh City, Vietnam</p>
            <p>Contact: <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></p>
            <p className="mt-4"><strong>Effective Date:</strong> Upon App Launch</p>
            <p><strong>Last Updated:</strong> December 26, 2024</p>
          </div>
        </div>

        {/* Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            This Data Retention Policy explains how Tuto Education Platform handles, stores, and deletes your personal information and student education records. We are committed to protecting your privacy while complying with legal requirements and providing quality educational services.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
            <p className="font-semibold text-blue-900 mb-2">Key Principles:</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>We retain data only as long as necessary</li>
              <li>You have control over your data</li>
              <li>Schools control student education records</li>
              <li>We delete data securely when no longer needed</li>
              <li>We comply with FERPA, COPPA, and applicable privacy laws</li>
            </ul>
          </div>
        </section>

        {/* Retention Periods Summary */}
        <section className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention Periods - Quick Reference</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Data Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Retention Period</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Deletion Process</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Active Account Data</td>
                  <td className="px-4 py-3 text-sm text-gray-700">While active</td>
                  <td className="px-4 py-3 text-sm text-gray-700">30 days after deletion request</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Student Education Records</td>
                  <td className="px-4 py-3 text-sm text-gray-700">School controlled</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Requires school approval</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Inactive Accounts</td>
                  <td className="px-4 py-3 text-sm text-gray-700">365 days</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Auto-deleted after 30-day notice</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Messages/Content</td>
                  <td className="px-4 py-3 text-sm text-gray-700">While active</td>
                  <td className="px-4 py-3 text-sm text-gray-700">30 days after deletion</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Photos/Media</td>
                  <td className="px-4 py-3 text-sm text-gray-700">While active</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Immediate or when school deletes</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Analytics Data</td>
                  <td className="px-4 py-3 text-sm text-gray-700">90 days</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Automatic</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Audit Logs</td>
                  <td className="px-4 py-3 text-sm text-gray-700">7 years</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Automatic (anonymized)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">Backup Data</td>
                  <td className="px-4 py-3 text-sm text-gray-700">30-90 days</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Automatic</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">✓</span>
                Right to Access
              </h4>
              <p className="text-sm text-green-800">View your personal data and know what we have about you</p>
            </div>
            
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">✏️</span>
                Right to Rectification
              </h4>
              <p className="text-sm text-blue-800">Correct inaccurate or update outdated information</p>
            </div>
            
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">🗑️</span>
                Right to Deletion
              </h4>
              <p className="text-sm text-red-800">Delete your personal account and data</p>
            </div>
            
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">📦</span>
                Right to Data Portability
              </h4>
              <p className="text-sm text-purple-800">Export your data in a machine-readable format</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
            <p className="font-semibold text-yellow-900 mb-2">Parental Rights (Children Under 13):</p>
            <p className="text-yellow-800">
              Parents have special rights to review, delete, and control their child's data. Contact us at{' '}
              <a href="mailto:support@tutoglobal.com?subject=COPPA%20Request" className="text-yellow-900 underline">support@tutoglobal.com</a> with subject "COPPA Request"
            </p>
          </div>
        </section>

        {/* How to Request Deletion */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request Deletion</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Individual User Deletion</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Send email to <a href="mailto:support@tutoglobal.com?subject=Account%20Deletion%20Request" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></li>
                <li>Subject: "Account Deletion Request"</li>
                <li>Include: Your name, email, school (if applicable)</li>
                <li>We confirm within 48 hours</li>
                <li>30-day grace period (you can cancel)</li>
                <li>Permanent deletion after 30 days</li>
              </ol>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Note:</strong> Student education records require school administrator approval
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Data Deletion (Parents)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Coordinate with school administrator (schools own student records per FERPA)</li>
                <li>Email: <a href="mailto:support@tutoglobal.com?subject=Student%20Data%20Deletion" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></li>
                <li>Subject: "Student Data Deletion"</li>
                <li>Include: Child's name, school, parent verification</li>
                <li>We verify with school administrator</li>
                <li>Process deletion after school approval</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">School Data Deletion (Administrators)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Email: <a href="mailto:support@tutoglobal.com?subject=School%20Data%20Deletion" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></li>
                <li>Subject: "School Data Deletion"</li>
                <li>We offer data export before deletion</li>
                <li>30-day grace period</li>
                <li>Complete deletion of all school data</li>
              </ol>
            </div>
          </div>
        </section>

        {/* How to Export Data */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Export Your Data</h2>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export Process</h3>
            
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full font-semibold mr-4">1</span>
                <div>
                  <p className="font-semibold text-gray-900">Send Email Request</p>
                  <p className="text-sm text-gray-700">To: <a href="mailto:support@tutoglobal.com?subject=Data%20Export%20Request" className="text-blue-600">support@tutoglobal.com</a>, Subject: "Data Export Request"</p>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full font-semibold mr-4">2</span>
                <div>
                  <p className="font-semibold text-gray-900">We Process Within 30 Days</p>
                  <p className="text-sm text-gray-700">We collect all your data from our systems and create a secure archive</p>
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full font-semibold mr-4">3</span>
                <div>
                  <p className="font-semibold text-gray-900">Receive Export</p>
                  <p className="text-sm text-gray-700">Email notification with secure download link (valid for 7 days)</p>
                </div>
              </li>
            </ol>

            <div className="mt-6 pt-6 border-t border-indigo-200">
              <h4 className="font-semibold text-gray-800 mb-2">What's Included:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>User profile information and account settings</li>
                <li>Messages and communications</li>
                <li>Student information (if you're a parent)</li>
                <li>Photos and media you uploaded</li>
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Available Formats:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white border border-indigo-300 rounded-full text-sm text-indigo-800">JSON (Machine-readable)</span>
                <span className="px-3 py-1 bg-white border border-indigo-300 rounded-full text-sm text-indigo-800">CSV (Spreadsheet)</span>
                <span className="px-3 py-1 bg-white border border-indigo-300 rounded-full text-sm text-indigo-800">PDF (Human-readable)</span>
              </div>
            </div>
          </div>
        </section>

        {/* FERPA & COPPA */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Data (FERPA & COPPA)</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-900 mb-2">FERPA Compliance</h3>
              <p className="text-sm text-green-800 mb-2">For Student Education Records:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Schools own and control records</li>
                <li>• Parents can access their child's records</li>
                <li>• Retention controlled by school policy</li>
                <li>• We delete when school requests</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 p-4 rounded">
              <h3 className="font-semibold text-purple-900 mb-2">COPPA Compliance</h3>
              <p className="text-sm text-purple-800 mb-2">For Children Under 13:</p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Parental consent required</li>
                <li>• Parents can review all data</li>
                <li>• Parents can delete child's data</li>
                <li>• Limited data collection only</li>
              </ul>
            </div>
          </div>

          <p className="text-gray-700">
            <strong>School vs. Parent Control:</strong> Schools maintain ownership of student education records. Parents requesting deletion of student data must coordinate with school administrators.
          </p>
        </section>

        {/* Backup Data */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Backup and Recovery Data</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why We Maintain Backups:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Disaster recovery</li>
              <li>System failures and data corruption protection</li>
              <li>Business continuity</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Retention:</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-700">Standard Backups</span>
                <span className="text-gray-900 font-semibold">30 days</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-700">Disaster Recovery Backups</span>
                <span className="text-gray-900 font-semibold">90 days</span>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
              <p className="text-yellow-900 text-sm">
                <strong>Important:</strong> When you delete your account, data is removed from active systems immediately. Backup copies remain until natural expiration (up to 90 days) but cannot be recovered or accessed during this time.
              </p>
            </div>
          </div>
        </section>

        {/* Exceptions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exceptions to Deletion</h2>
          
          <p className="text-gray-700 mb-4">We may retain data longer than stated if required for:</p>

          <div className="space-y-4">
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h4 className="font-semibold text-orange-900 mb-2">Legal Obligations</h4>
              <p className="text-sm text-orange-800">Required by law, regulation, court order, or legal proceedings. Examples: Tax records (7 years), Financial records (7 years), Audit logs (7 years)</p>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-semibold text-red-900 mb-2">Fraud Prevention</h4>
              <p className="text-sm text-red-800">To investigate suspected fraud or abuse, prevent future violations, and protect other users. Retained as long as necessary for investigation (up to 7 years for serious violations)</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-2">Anonymous Data</h4>
              <p className="text-sm text-gray-700">Completely anonymized, aggregated data that cannot identify individuals. Used for service improvement and retained indefinitely.</p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">General Inquiries</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Email:</strong> <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></p>
                  <p><strong>Alt Email:</strong> <a href="mailto:tarun@tutoglobal.com" className="text-blue-600 hover:text-blue-800">tarun@tutoglobal.com</a></p>
                  <p><strong>Phone:</strong> +84 0349640253</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Data Requests</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Data Access:</strong> Subject: "Data Access Request"</p>
                  <p><strong>Data Export:</strong> Subject: "Data Export Request"</p>
                  <p><strong>Account Deletion:</strong> Subject: "Account Deletion Request"</p>
                  <p><strong>Student Data:</strong> Subject: "Student Data Deletion"</p>
                  <p><strong>COPPA:</strong> Subject: "COPPA Request"</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-200">
              <p className="text-sm text-gray-600">
                <strong>Response Time:</strong> General inquiries: 48 hours | Data requests: 30 days | COPPA requests: 30 days
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="mb-2"><strong>Thank you for trusting Tuto Education Platform with your family's educational data.</strong></p>
            <p className="text-sm">Last Updated: December 26, 2024 | Version 1.0</p>
            <p className="mt-4 text-sm">
              Questions about data retention? Email us at{' '}
              <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              We're happy to explain how we handle your data.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

