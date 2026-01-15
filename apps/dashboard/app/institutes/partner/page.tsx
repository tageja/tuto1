import React from 'react';
import { Card } from '../../../components/ui/Card';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Section } from '../../../components/ui/Section';

export default function InstitutesPartnerPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Partner with Us" subtitle="Collaborate with training centers and educational institutes." />
      <Section>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Partnership Inquiries</h3>
            <p className="text-gray-600 mb-4">Interested in partnering with tuto.? Contact our business team.</p>
            <p className="font-medium">📧 Email: <a href="mailto:tarun@tutoglobal.com" className="text-primary hover:underline">tarun@tutoglobal.com</a></p>
            <p className="mt-2 font-medium">📞 Phone: <a href="tel:+84349640253" className="text-primary hover:underline">+84 349 640 253</a></p>
          </div>
        </Card>
      </Section>
    </main>
  );
}




