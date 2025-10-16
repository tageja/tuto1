import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';

const jobs = [
  { title: 'Frontend Engineer (React/Next.js)', location: 'Hà Nội', type: 'Full-time' },
  { title: 'Backend Engineer (Node/Firebase)', location: 'Hồ Chí Minh', type: 'Full-time' },
  { title: 'Product Designer', location: 'Remote', type: 'Contract' },
];

export default function CareersPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Cơ hội nghề nghiệp" subtitle="Gia nhập đội ngũ Tuto để xây dựng tương lai giáo dục." />

      <Section>
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.title}>
              <div className="p-6 flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-medium">{job.title}</div>
                  <div className="mt-1 text-gray-500 text-sm">{job.location} · {job.type}</div>
                </div>
                <Button>Ứng tuyển</Button>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}

