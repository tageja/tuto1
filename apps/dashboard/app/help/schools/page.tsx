import React from 'react';
import { Card } from '../../../components/ui/Card';

export default function HelpSchoolsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Help for Schools</h1>
      <p className="mt-2 text-gray-600">Implementation guides and operational support.</p>
      <Card>
        <div className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-2">School Support</h3>
          <p className="text-gray-600 mb-4">For school onboarding, training, and technical support.</p>
          <p className="font-medium">📧 Email: <a href="mailto:tarun@tutoglobal.com" className="text-primary hover:underline">tarun@tutoglobal.com</a></p>
          <p className="mt-2 font-medium">📞 Phone: <a href="tel:+84349640253" className="text-primary hover:underline">+84 349 640 253</a></p>
        </div>
      </Card>
    </main>
  );
}





