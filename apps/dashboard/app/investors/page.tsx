import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

const metrics = [
  { label: 'Doanh thu MTD', value: '$240K' },
  { label: 'Tăng trưởng YoY', value: '185%' },
  { label: 'CAC payback', value: '6.5 tháng' },
  { label: 'Gross Margin', value: '72%' },
];

export default function InvestorsPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Nhà đầu tư" subtitle="Tầm nhìn, số liệu chính và thông tin liên hệ." />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {metrics.map((m) => (
            <Card key={m.label}>
              <div className="p-6">
                <div className="text-3xl font-semibold">{m.value}</div>
                <div className="mt-1 text-gray-600">{m.label}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-medium">Liên hệ IR</h2>
            <p className="mt-2 text-gray-600">ir@tuto.app</p>
          </div>
        </Card>
      </Section>
    </main>
  );
}


