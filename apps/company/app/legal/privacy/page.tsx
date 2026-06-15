'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="prose prose-blue max-w-none">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Tuto Education Platform</strong></p>
            <p>Operated by: Tarun Tageja</p>
            <p>Location: Ho Chi Minh City, Vietnam</p>
            <p>Contact: <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a></p>
            <p className="mt-4"><strong>Effective Date:</strong> Upon App Launch</p>
            <p><strong>Last Updated:</strong> December 26, 2024</p>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            Welcome to Tuto Education Platform ("Tuto," "we," "us," or "our"). We are committed to protecting the privacy and security of our users, especially students, parents, teachers, and school administrators who use our mobile application and web dashboard.
          </p>
          <p className="text-gray-700 mb-4">
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the "App") and our web dashboard (collectively, the "Services"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access or use the Services.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
            <p className="font-semibold text-blue-900 mb-2">Important for Parents and Schools:</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Tuto is designed specifically for educational institutions and families</li>
              <li>We comply with FERPA (Family Educational Rights and Privacy Act) for student education records</li>
              <li>We comply with COPPA (Children's Online Privacy Protection Act) for children under 13</li>
              <li>Schools maintain ownership and control of student data</li>
              <li>Parents have extensive rights to control their children's information</li>
            </ul>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-600">
            <li><a href="#information-we-collect" className="hover:text-blue-800">Information We Collect</a></li>
            <li><a href="#how-we-use" className="hover:text-blue-800">How We Use Your Information</a></li>
            <li><a href="#ferpa-compliance" className="hover:text-blue-800">Student Data and FERPA Compliance</a></li>
            <li><a href="#coppa-compliance" className="hover:text-blue-800">Children's Privacy and COPPA Compliance</a></li>
            <li><a href="#school-data" className="hover:text-blue-800">School Data Ownership and Control</a></li>
            <li><a href="#how-we-share" className="hover:text-blue-800">How We Share Your Information</a></li>
            <li><a href="#third-party" className="hover:text-blue-800">Third-Party Services</a></li>
            <li><a href="#security" className="hover:text-blue-800">Data Security</a></li>
            <li><a href="#retention" className="hover:text-blue-800">Data Retention and Deletion</a></li>
            <li><a href="#your-rights" className="hover:text-blue-800">Your Privacy Rights</a></li>
            <li><a href="#cookies" className="hover:text-blue-800">Cookies and Tracking Technologies</a></li>
            <li><a href="#contact" className="hover:text-blue-800">Contact Us</a></li>
          </ol>
        </section>

        {/* 1. Information We Collect */}
        <section id="information-we-collect" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Information You Provide Directly</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">User Account Information:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Password (encrypted)</li>
              <li>User role (Parent, Teacher, School Administrator)</li>
              <li>Profile picture (optional)</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Student Information (provided by parents or school administrators):</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Student full name</li>
              <li>Date of birth</li>
              <li>Grade level</li>
              <li>School association</li>
              <li>Health information (with parental consent)</li>
              <li>Academic records (attendance, homework, grades)</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Photos and Media:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Photos of school activities, events, and student work</li>
              <li>Videos of school events (with appropriate permissions)</li>
              <li>User-uploaded content for school communication</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Location Data (Future Feature):</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Approximate location for finding nearby educational resources</li>
              <li><strong>Note:</strong> Location data is NOT currently used for school dashboard features</li>
              <li>Location permission is for future features outside the school management system</li>
              <li>You can deny location access without affecting school features</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.2 Information Collected Automatically</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Usage Data:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>App features you use</li>
              <li>Pages you visit on the web dashboard</li>
              <li>Device information (type, operating system, app version)</li>
              <li>IP address</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Cookies (Web Dashboard Only):</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Authentication cookies (to keep you logged in)</li>
              <li>Language preference cookies (to remember your language choice)</li>
              <li>Session management cookies</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1.3 Information We Do NOT Collect</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>We do NOT collect credit card or payment information (app is free)</li>
            <li>We do NOT track your precise GPS location for school features</li>
            <li>We do NOT collect biometric data</li>
            <li>We do NOT collect data from social media without your explicit consent</li>
          </ul>
        </section>

        {/* 2. How We Use Your Information */}
        <section id="how-we-use" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Providing and Improving Our Services</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Account Management:</strong> Create and manage user accounts, authenticate users</li>
            <li><strong>School Communication:</strong> Facilitate communication between parents, teachers, and schools</li>
            <li><strong>Educational Services:</strong> Provide access to attendance records, homework, announcements, events</li>
            <li><strong>Health Records:</strong> Manage student health information and medicine reminders (with parental consent)</li>
            <li><strong>Photo Sharing:</strong> Allow schools to share photos and videos of school activities</li>
            <li><strong>Messaging:</strong> Enable secure communication within the school community</li>
          </ul>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
            <p className="font-semibold text-red-900 mb-2">We will NEVER:</p>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>Sell your personal information to third parties</li>
              <li>Use student data for advertising purposes</li>
              <li>Share your data with third parties for their marketing purposes</li>
              <li>Display third-party advertisements in the app</li>
            </ul>
          </div>
        </section>

        {/* 3. FERPA Compliance */}
        <section id="ferpa-compliance" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Student Data and FERPA Compliance</h2>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
            <p className="font-semibold text-green-900 mb-2">FERPA Compliance</p>
            <p className="text-green-800">
              Tuto Education Platform complies with the Family Educational Rights and Privacy Act (FERPA), which protects the privacy of student education records.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">What are Education Records?</h3>
          <p className="text-gray-700 mb-4">
            Education records include information directly related to a student and maintained by an educational institution, such as:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
            <li>Attendance records</li>
            <li>Grades and academic performance</li>
            <li>Discipline records</li>
            <li>Health records maintained by the school</li>
            <li>Special education records</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Role Under FERPA:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Tuto acts as a "school official" with "legitimate educational interests"</li>
            <li>We access education records only as necessary to provide our Services</li>
            <li>We maintain the same privacy and security standards as the school</li>
          </ul>
        </section>

        {/* 4. COPPA Compliance */}
        <section id="coppa-compliance" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Children's Privacy and COPPA Compliance</h2>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 my-6">
            <p className="font-semibold text-purple-900 mb-2">COPPA Compliance</p>
            <p className="text-purple-800">
              Tuto Education Platform complies with the Children's Online Privacy Protection Act (COPPA) for children under 13 years of age.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">How We Protect Children:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>We only collect information from children with parental or school consent</li>
            <li>Children cannot independently create accounts</li>
            <li>We do not display third-party advertisements to children</li>
            <li>We do not collect more information than necessary for educational purposes</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">Parental Rights Under COPPA:</h3>
          <p className="text-gray-700 mb-2">Parents have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Review their child's personal information</li>
            <li>Request that we delete their child's personal information</li>
            <li>Refuse to allow further collection or use of their child's information</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <p className="text-gray-700 mt-4">
            <strong>To Exercise These Rights:</strong> Contact your child's school administrator or email us at{' '}
            <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a> with subject "COPPA Request"
          </p>
        </section>

        {/* 5. School Data Ownership */}
        <section id="school-data" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. School Data Ownership and Control</h2>
          
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-6">
            <p className="font-semibold text-indigo-900 mb-2">Schools Own Their Data</p>
            <ul className="list-disc list-inside text-indigo-800 space-y-1">
              <li>All student education records belong to the school</li>
              <li>Schools can export their complete data at any time</li>
              <li>Schools can request deletion of all their data</li>
              <li>Tuto is merely a "data processor" - schools are the "data controllers"</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">School Data Isolation</h3>
          <p className="text-gray-700 mb-2"><strong>How We Protect School Privacy:</strong></p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Each school's data is completely isolated from other schools</li>
            <li>Parents can only see their own children's data</li>
            <li>Teachers can only access students in their assigned classes</li>
            <li>School administrators control access within their institution</li>
            <li>No data sharing between schools without explicit permission</li>
          </ul>
        </section>

        {/* 6. How We Share */}
        <section id="how-we-share" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. How We Share Your Information</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">When We Share Information:</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Within Your School Community:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Teachers can see students in their assigned classes</li>
              <li>Parents can see their own children's information</li>
              <li>School administrators can access all school data</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Service Providers:</h4>
            <p className="text-gray-700 ml-4">Third-party services that help us operate the platform (see Section 7). These providers are contractually obligated to protect your data.</p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
            <p className="font-semibold text-yellow-900 mb-2">When We Do NOT Share Information:</p>
            <p className="text-yellow-800">We will NEVER sell your personal information, share student data with advertisers, or share data with third parties for their marketing purposes.</p>
          </div>
        </section>

        {/* 7. Third-Party Services */}
        <section id="third-party" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services</h2>
          
          <p className="text-gray-700 mb-4">We use the following third-party services to operate Tuto Education Platform:</p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-semibold text-gray-800">Supabase (Database and Authentication)</h4>
              <p className="text-gray-600 text-sm">Purpose: Secure data storage and user authentication</p>
              <p className="text-gray-600 text-sm">Privacy Policy: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">https://supabase.com/privacy</a></p>
            </div>

            <div className="border-l-4 border-orange-400 pl-4">
              <h4 className="font-semibold text-gray-800">Firebase (Analytics and Auth Support)</h4>
              <p className="text-gray-600 text-sm">Purpose: App analytics, crash reporting, and authentication</p>
              <p className="text-gray-600 text-sm">Privacy Policy: <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">firebase.google.com/support/privacy</a></p>
            </div>

            <div className="border-l-4 border-red-400 pl-4">
              <h4 className="font-semibold text-gray-800">Google OAuth (Sign-In)</h4>
              <p className="text-gray-600 text-sm">Purpose: Allow users to sign in with Google accounts</p>
              <p className="text-gray-600 text-sm">Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">policies.google.com/privacy</a></p>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            All third-party services sign Data Processing Agreements (DPAs) with us, comply with FERPA and COPPA requirements, and are prohibited from using student data for their own purposes.
          </p>
        </section>

        {/* 8. Data Security */}
        <section id="security" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Security</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Security Measures:</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Technical Safeguards:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
              <li><strong>Secure Authentication:</strong> Password hashing with bcrypt, OAuth 2.0 support</li>
              <li><strong>Access Controls:</strong> Role-based access control (RBAC) to limit data access</li>
              <li><strong>Database Security:</strong> Isolated school databases, row-level security policies</li>
              <li><strong>Regular Updates:</strong> Timely security patches and updates</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
            <p className="font-semibold text-blue-900 mb-2">Your Role in Security:</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Use a strong, unique password</li>
              <li>Do not share your password with others</li>
              <li>Log out of shared devices</li>
              <li>Report suspicious activity immediately</li>
            </ul>
          </div>

          <p className="text-gray-700">
            <strong>Data Breach Notification:</strong> In the unlikely event of a data breach, we will notify affected schools and users within 72 hours and report to appropriate authorities as required by law.
          </p>
        </section>

        {/* 9. Data Retention */}
        <section id="retention" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention and Deletion</h2>
          
          <p className="text-gray-700 mb-4">For detailed information about how long we keep your data and how to request deletion, please see our <a href="/legal/data-retention" className="text-blue-600 hover:text-blue-800 font-semibold">Data Retention Policy</a>.</p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Summary:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Active User Data:</strong> Retained while your account is active</li>
            <li><strong>Student Records:</strong> Controlled by school, not individual users</li>
            <li><strong>Deleted Accounts:</strong> 30-day grace period, then permanent deletion</li>
            <li><strong>Backups:</strong> May retain data for up to 90 days for disaster recovery</li>
          </ul>

          <p className="text-gray-700 mt-4">
            <strong>To Request Deletion:</strong> Email{' '}
            <a href="mailto:support@tutoglobal.com?subject=Account%20Deletion%20Request" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a> with subject "Account Deletion Request"
          </p>
        </section>

        {/* 10. Your Rights */}
        <section id="your-rights" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Your Privacy Rights</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Right to Access</h4>
              <p className="text-gray-600 text-sm">View your personal data and know what we have about you</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Right to Correction</h4>
              <p className="text-gray-600 text-sm">Correct inaccurate or update outdated information</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Right to Deletion</h4>
              <p className="text-gray-600 text-sm">Delete your personal account and data</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Right to Export</h4>
              <p className="text-gray-600 text-sm">Receive your data in a portable format</p>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            <strong>To Exercise Your Rights:</strong> Email{' '}
            <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a> with your specific request
          </p>
        </section>

        {/* 11. Cookies */}
        <section id="cookies" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cookies and Tracking Technologies</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Web Dashboard Cookies:</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-400 pl-4">
              <h4 className="font-semibold text-gray-800">Essential Cookies (Cannot be disabled)</h4>
              <p className="text-gray-600 text-sm">Authentication cookies to keep you logged in</p>
              <p className="text-gray-600 text-sm">Name: <code className="bg-gray-100 px-1 rounded">sb-*-auth-token</code> (Supabase session)</p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h4 className="font-semibold text-gray-800">Functional Cookies (Can be disabled)</h4>
              <p className="text-gray-600 text-sm">Language preference cookie (365 days)</p>
              <p className="text-gray-600 text-sm">Name: <code className="bg-gray-100 px-1 rounded">lang</code></p>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            <strong>Mobile App:</strong> The mobile app does NOT use browser cookies. It uses secure local storage for authentication tokens and device preferences.
          </p>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 my-4">
            <p className="font-semibold text-gray-800 mb-2">We Do NOT Use:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Advertising cookies</li>
              <li>Social media tracking cookies</li>
              <li>Third-party marketing cookies</li>
            </ul>
          </div>
        </section>

        {/* 12. Contact Us */}
        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
          
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

            <div className="mt-6 pt-6 border-t border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-3">Specific Requests:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Data Access:</strong> Subject: "Data Access Request"</li>
                <li><strong>Deletion:</strong> Subject: "Account Deletion Request"</li>
                <li><strong>COPPA:</strong> Subject: "COPPA Request"</li>
              </ul>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              <strong>Response Time:</strong> General inquiries within 48 hours, Data requests within 30 days
            </p>
          </div>
        </section>

        {/* Footer */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <p className="mb-2"><strong>Thank you for trusting Tuto Education Platform with your family's educational journey.</strong></p>
            <p className="text-sm">Last Updated: December 26, 2024 | Version 1.0</p>
            <p className="mt-4 text-sm">
              Questions? Email us at{' '}
              <a href="mailto:support@tutoglobal.com" className="text-blue-600 hover:text-blue-800">support@tutoglobal.com</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
