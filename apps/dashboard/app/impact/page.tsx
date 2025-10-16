import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

const kpis = [
  { label: 'Giờ học đã diễn ra', value: '120,000+' },
  { label: 'Giáo viên tham gia', value: '8,500+' },
  { label: 'Trường & trung tâm', value: '650+' },
  { label: 'Tỷ lệ hài lòng', value: '97%' },
];

export default function ImpactPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Tác động" subtitle="Cải thiện kết quả học tập và kết nối cộng đồng giáo dục." />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {kpis.map((k) => (
            <Card key={k.label}>
              <div className="p-6">
                <div className="text-3xl font-semibold">{k.value}</div>
                <div className="mt-1 text-gray-600">{k.label}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

