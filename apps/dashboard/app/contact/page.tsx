import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

export default function ContactPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Contact Us" subtitle="Need help? Get in touch with the tuto. team" />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-medium">User Support</h2>
              <p className="mt-2 text-gray-600 font-semibold">support@tutoglobal.com</p>
              <p className="mt-1 text-sm text-gray-500">For general inquiries and app support</p>
              <p className="mt-2 text-gray-600">📞 +84 349 640 253</p>
              <div className="mt-4">
                <a href="mailto:support@tutoglobal.com">
                  <Button>Send Email</Button>
                </a>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-medium">Business & Schools</h2>
              <p className="mt-2 text-gray-600 font-semibold">tarun@tutoglobal.com</p>
              <p className="mt-1 text-sm text-gray-500">For school onboarding and partnerships</p>
              <div className="mt-4">
                <a href="mailto:tarun@tutoglobal.com">
                  <Button>Contact Sales</Button>
                </a>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold mb-2">📧 Quick Contact</h3>
          <p className="text-gray-600 text-sm mb-4">
            We typically respond within 48 hours. For urgent matters, please call us directly.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">General Support:</p>
              <a href="mailto:support@tutoglobal.com" className="text-primary hover:underline">support@tutoglobal.com</a>
            </div>
            <div>
              <p className="font-medium text-gray-700">Business Inquiries:</p>
              <a href="mailto:tarun@tutoglobal.com" className="text-primary hover:underline">tarun@tutoglobal.com</a>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}

