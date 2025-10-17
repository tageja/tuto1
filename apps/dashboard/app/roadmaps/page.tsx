import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

const items = [
  { title: 'Toán - Lớp 6', desc: 'Số học, hình học cơ bản, tư duy logic.' },
  { title: 'Tiếng Anh - Căn bản', desc: 'Ngữ pháp, từ vựng, giao tiếp.' },
  { title: 'Vật lý - Nhập môn', desc: 'Chuyển động, lực, năng lượng.' },
];

export default function RoadmapsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Lộ trình học</h1>
      <p className="mt-2 text-gray-600">Kế hoạch học theo môn và cấp độ.</p>
      <section className="grid gap-6 md:grid-cols-2 mt-6">
        {items.map((s) => (
          <Card key={s.title}>
            <div className="p-6">
              <div className="text-lg font-medium">{s.title}</div>
              <div className="mt-1 text-gray-600">{s.desc}</div>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}




