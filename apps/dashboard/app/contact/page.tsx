import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

export default function ContactPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Liên hệ" subtitle="Cần hỗ trợ? Hãy liên hệ đội ngũ Tuto." />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-medium">Hỗ trợ người dùng</h2>
              <p className="mt-2 text-gray-600">support@tuto.app</p>
              <div className="mt-4"><Button>Gửi email</Button></div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-medium">Truyền thông</h2>
              <p className="mt-2 text-gray-600">press@tuto.app</p>
              <div className="mt-4"><Button>Liên hệ báo chí</Button></div>
            </div>
          </Card>
        </div>
      </Section>
    </main>
  );
}

