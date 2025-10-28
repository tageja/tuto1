import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

const tiers = [
  { name: 'Gói Basic', price: '₫0', features: ['Học thử', 'Tìm giáo viên'] },
  { name: 'Gói Plus', price: '₫199K', features: ['Lịch nâng cao', 'Ưu tiên hỗ trợ'] },
  { name: 'Gói Pro', price: '₫399K', features: ['Báo cáo tiến độ', 'Ưu đãi học phí'] },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Bảng giá</h1>
      <p className="mt-2 text-gray-600">Minh bạch học phí và gói linh hoạt.</p>
      <section className="mt-6 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <Card key={t.name}>
            <div className="p-6">
              <div className="text-lg font-medium">{t.name}</div>
              <div className="text-2xl font-semibold mt-2">{t.price}</div>
              <ul className="mt-3 list-disc pl-5 text-gray-600">
                {t.features.map((f) => (<li key={f}>{f}</li>))}
              </ul>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}






