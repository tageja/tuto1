'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="prose prose-blue max-w-none">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Tuto Education Platform</strong></p>
            <p>Operated by: Tarun Tageja</p>
            <p>Location: Ho Chi Minh City, Vietnam</p>
            <p>Contact: <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></p>
            <p className="mt-4"><strong>Effective Date:</strong> Upon App Launch</p>
            <p><strong>Last Updated:</strong> December 26, 2024</p>
          </div>
        </div>

        {/* Agreement */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using Tuto Education Platform (the "App," "Services," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Services.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
            <p className="font-semibold text-yellow-900 mb-2">Important:</p>
            <ul className="list-disc list-inside text-yellow-800 space-y-1">
              <li>These Terms apply to the mobile app and web dashboard</li>
              <li>By creating an account, you accept these Terms</li>
              <li>Parents accept these Terms on behalf of their children</li>
              <li>Schools accept these Terms when registering for the Services</li>
            </ul>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-600">
            <li><a href="#description" className="hover:text-blue-800">Description of Services</a></li>
            <li><a href="#eligibility" className="hover:text-blue-800">Eligibility</a></li>
            <li><a href="#accounts" className="hover:text-blue-800">User Accounts</a></li>
            <li><a href="#roles" className="hover:text-blue-800">User Roles and Responsibilities</a></li>
            <li><a href="#acceptable-use" className="hover:text-blue-800">Acceptable Use Policy</a></li>
            <li><a href="#content" className="hover:text-blue-800">Content Ownership and License</a></li>
            <li><a href="#school" className="hover:text-blue-800">School Accounts and Data</a></li>
            <li><a href="#privacy" className="hover:text-blue-800">Privacy and Data Protection</a></li>
            <li><a href="#prohibited" className="hover:text-blue-800">Prohibited Activities</a></li>
            <li><a href="#termination" className="hover:text-blue-800">Termination</a></li>
            <li><a href="#disclaimers" className="hover:text-blue-800">Disclaimers</a></li>
            <li><a href="#liability" className="hover:text-blue-800">Limitation of Liability</a></li>
            <li><a href="#contact" className="hover:text-blue-800">Contact Information</a></li>
          </ol>
        </section>

        {/* 1. Description of Services */}
        <section id="description" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Description of Services</h2>
          
          <p className="text-gray-700 mb-4">
            Tuto Education Platform is a <strong>free</strong> mobile and web application designed to improve communication between schools, teachers, parents, and students.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Core Features:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>School Dashboard - Centralized hub for school information</li>
            <li>Announcements - School-wide and class-specific communications</li>
            <li>Daily Activities - Updates on classroom activities and events</li>
            <li>Attendance Tracking - Real-time attendance records</li>
            <li>Homework Management - Assignments, submissions, and tracking</li>
            <li>Photo Albums - Event photos and school memories</li>
            <li>Health Records - Student health information (with parental consent)</li>
            <li>Medicine Tracking - Medication reminders and logs</li>
            <li>Messaging - Direct communication between parents and teachers</li>
            <li>Events Calendar - School events and important dates</li>
            <li>Progress Tracking - Student academic progress</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
            <p className="font-semibold text-blue-900 mb-2">Service Availability:</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
              <li>Services may be temporarily unavailable for maintenance</li>
              <li>Tuto is NOT an emergency service - contact emergency services directly for urgent matters</li>
            </ul>
          </div>
        </section>

        {/* 2. Eligibility */}
        <section id="eligibility" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Who Can Use Tuto:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Parents/guardians of students enrolled in participating schools (must be 18+)</li>
            <li>Teachers employed by participating schools (must be 18+)</li>
            <li>Administrators at participating schools (must be 18+)</li>
            <li>Students enrolled in participating schools (with parent/school oversight)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Age Requirements:</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <ul className="space-y-2 text-gray-700">
              <li><strong>Parents/Guardians:</strong> Must be at least 18 years old</li>
              <li><strong>Teachers:</strong> Must be at least 18 years old</li>
              <li><strong>Administrators:</strong> Must be authorized representatives of schools</li>
              <li><strong>Students:</strong> Ages 4+ can use (with parent/school oversight); Students under 13 cannot create accounts independently</li>
            </ul>
          </div>
        </section>

        {/* 3. User Accounts */}
        <section id="accounts" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Creating an Account:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
            <li>Provide accurate and complete information</li>
            <li>Choose a secure password</li>
            <li>Verify your email address</li>
            <li>Select your appropriate role (Parent, Teacher, Administrator)</li>
          </ul>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
            <p className="font-semibold text-red-900 mb-2">You Are Responsible For:</p>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of unauthorized access</li>
              <li>Ensuring your account information is current and accurate</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Security:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Use a strong, unique password</li>
            <li>Do not share your account with others</li>
            <li>Log out on shared devices</li>
            <li>Enable two-factor authentication (when available)</li>
          </ul>
        </section>

        {/* 4. User Roles */}
        <section id="roles" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Roles and Responsibilities</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-blue-900 mb-2">Parent Responsibilities</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Provide accurate information</li>
                <li>Supervise child's use</li>
                <li>Communicate respectfully</li>
                <li>Report inappropriate content</li>
              </ul>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-900 mb-2">Teacher Responsibilities</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>Act professionally</li>
                <li>Protect student privacy</li>
                <li>Post appropriate content</li>
                <li>Respond to parent inquiries</li>
              </ul>
            </div>

            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h4 className="font-semibold text-purple-900 mb-2">Admin Responsibilities</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>Ensure FERPA/COPPA compliance</li>
                <li>Manage permissions</li>
                <li>Monitor content</li>
                <li>Protect student data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Acceptable Use */}
        <section id="acceptable-use" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">You May Use Tuto To:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
            <li>Communicate about educational matters</li>
            <li>Share school-related information and updates</li>
            <li>Track student academic progress and attendance</li>
            <li>Manage school activities and events</li>
            <li>Facilitate parent-teacher communication</li>
          </ul>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
            <p className="font-semibold text-red-900 mb-2">You May NOT Use Tuto To:</p>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>Violate any laws or regulations</li>
              <li>Post harmful, offensive, or inappropriate content</li>
              <li>Harass, bully, or intimidate others</li>
              <li>Share false or misleading information</li>
              <li>Attempt to gain unauthorized access to accounts or systems</li>
              <li>Distribute spam or unsolicited messages</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Content Standards:</h3>
          <p className="text-gray-700 mb-2"><strong>All Content Must Be:</strong></p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Respectful and professional</li>
            <li>Age-appropriate for a school environment</li>
            <li>Relevant to educational purposes</li>
            <li>Compliant with school policies</li>
            <li>Truthful and not misleading</li>
          </ul>
        </section>

        {/* 6. Content Ownership */}
        <section id="content" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Content Ownership and License</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Content:</h3>
          <p className="text-gray-700 mb-4">
            <strong>You own your content.</strong> You retain ownership of content you post (photos, messages, etc.). However, by posting content, you grant Tuto a limited license to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Store and display your content within the Services</li>
            <li>Share your content with users you authorize</li>
            <li>Make backup copies for service reliability</li>
            <li>Process content to provide the Services (e.g., resize photos)</li>
          </ul>

          <p className="text-gray-700 mt-4">
            This license is <strong>non-exclusive</strong> (you can use your content elsewhere), lasts while you use the Services, and ends when you delete content or close your account.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">School Content:</h3>
          <p className="text-gray-700">
            Schools own their content (announcements, curriculum materials, school policies). Student work is owned by students (or parents for young children).
          </p>
        </section>

        {/* 7. School Accounts */}
        <section id="school" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. School Accounts and Data</h2>
          
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-6">
            <p className="font-semibold text-indigo-900 mb-2">Schools Own All School Data:</p>
            <ul className="list-disc list-inside text-indigo-800 space-y-1">
              <li>Student education records</li>
              <li>School-created content</li>
              <li>Communications between school users</li>
              <li>All data associated with the school account</li>
            </ul>
          </div>

          <p className="text-gray-700 mb-4">
            <strong>Tuto's Role:</strong> We are a "data processor" (not a "data controller"). We process data only as instructed by the school.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">School Responsibilities:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Obtaining necessary consents (parental, FERPA)</li>
            <li>Complying with educational privacy laws</li>
            <li>Managing user access and permissions</li>
            <li>Monitoring content for appropriateness</li>
            <li>Training staff on proper use</li>
          </ul>
        </section>

        {/* 8. Privacy */}
        <section id="privacy" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
          
          <p className="text-gray-700 mb-4">
            Our <a href="/legal/privacy" className="text-blue-600 hover:text-blue-800 font-semibold">Privacy Policy</a> explains:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>What data we collect</li>
            <li>How we use your data</li>
            <li>How we protect your data</li>
            <li>Your rights regarding your data</li>
          </ul>

          <p className="text-gray-700 mt-4">
            <strong>By using the Services, you also agree to our Privacy Policy.</strong>
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
            <p className="font-semibold text-green-900 mb-2">Student Privacy:</p>
            <ul className="list-disc list-inside text-green-800 space-y-1">
              <li>We comply with FERPA and COPPA</li>
              <li>Schools own and control student data</li>
              <li>We never sell student data</li>
              <li>We never use student data for advertising</li>
            </ul>
          </div>
        </section>

        {/* 9. Prohibited Activities */}
        <section id="prohibited" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Prohibited Activities</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-semibold text-red-900 mb-2">Illegal Activities</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>Using Services for illegal purposes</li>
                <li>Violating laws or regulations</li>
                <li>Distributing illegal content</li>
              </ul>
            </div>

            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h4 className="font-semibold text-orange-900 mb-2">Harmful Activities</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>Threatening or bullying others</li>
                <li>Posting harmful content</li>
                <li>Impersonating others</li>
              </ul>
            </div>

            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <h4 className="font-semibold text-yellow-900 mb-2">Technical Interference</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>Hacking or breaching security</li>
                <li>Using bots without authorization</li>
                <li>Introducing viruses</li>
              </ul>
            </div>

            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h4 className="font-semibold text-purple-900 mb-2">Commercial Misuse</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>Unauthorized advertising</li>
                <li>Selling access to Services</li>
                <li>Scraping user data</li>
              </ul>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            <strong>Consequences:</strong> Violation may result in warning, suspension, permanent ban, legal action, or reporting to authorities.
          </p>
        </section>

        {/* 10. Termination */}
        <section id="termination" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Termination by You:</h3>
          <p className="text-gray-700 mb-4">
            You may terminate your account at any time by contacting{' '}
            <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a>.
            Subject to a 30-day grace period.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Termination by Us:</h3>
          <p className="text-gray-700 mb-2">We may terminate your account if:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>You violate these Terms</li>
            <li>You engage in prohibited activities</li>
            <li>Your account has been inactive for over 365 days</li>
            <li>We discontinue the Services (with 60 days' notice)</li>
          </ul>
        </section>

        {/* 11. Disclaimers */}
        <section id="disclaimers" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disclaimers</h2>
          
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <p className="font-semibold text-gray-900 mb-2 uppercase">"As Is" Service</p>
            <p className="text-gray-700">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </p>
          </div>

          <p className="text-gray-700 mt-4"><strong>We Do Not Warrant That:</strong></p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>The Services will be uninterrupted or error-free</li>
            <li>Defects will be corrected</li>
            <li>Results obtained from the Services will be accurate or reliable</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
            <p className="font-semibold text-yellow-900 mb-2">Important Note:</p>
            <p className="text-yellow-800">
              The Services do NOT provide medical advice, legal advice, or emergency services. For professional services, consult qualified professionals.
            </p>
          </div>
        </section>

        {/* 12. Limitation of Liability */}
        <section id="liability" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Limitation of Liability</h2>
          
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
            <p className="font-semibold text-gray-900 mb-2 uppercase">Limitation of Damages</p>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TUTO EDUCATION PLATFORM SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits or revenue</li>
              <li>Loss of data or information</li>
              <li>Business interruption</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Our total liability shall not exceed $100 USD.</strong>
            </p>
          </div>

          <p className="text-gray-700 mt-4 text-sm">
            You acknowledge that we offer the Services for free and these limitations are reasonable and fair.
          </p>
        </section>

        {/* 13. Contact */}
        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Inquiries</h3>
            
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></p>
              <p><strong>Alternative Email:</strong> <a href="mailto:tarun@tutoglobal.com" className="text-blue-600 hover:text-blue-800">tarun@tutoglobal.com</a></p>
              <p><strong>Phone:</strong> +84 0349640253 (Vietnam)</p>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-3">Mail:</h4>
              <address className="not-italic text-gray-700">
                Tarun Tageja<br />
                Tuto Education Platform<br />
                Ho Chi Minh City, Vietnam
              </address>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              <strong>Response Time:</strong> General inquiries within 48 hours, Legal notices within 5 business days
            </p>
          </div>
        </section>

        {/* Acknowledgment */}
        <section className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acknowledgment</h2>
          <p className="text-gray-700 mb-4">
            <strong>By using Tuto Education Platform, you acknowledge that:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>You have read these Terms of Service</li>
            <li>You understand these Terms</li>
            <li>You agree to be bound by these Terms</li>
            <li>You will comply with all applicable laws</li>
          </ul>
          <p className="text-gray-700 mt-4 font-semibold">
            Thank you for being part of the Tuto community!
          </p>
          <p className="text-gray-700 text-sm mt-2">
            Together, we're making education more connected, transparent, and engaging for families and schools.
          </p>
        </section>

        {/* Footer */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="text-sm">Last Updated: December 26, 2024 | Version 1.0</p>
            <p className="mt-4 text-sm">
              Questions about these Terms? Email us at{' '}
              <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
