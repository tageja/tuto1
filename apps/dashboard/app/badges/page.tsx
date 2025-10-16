import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function BadgesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Huy hiệu</h1>
      <p className="mt-2 text-gray-600">Thành tích và động lực học tập.</p>
      <Card><div className="p-6 mt-6">Tính năng huy hiệu sẽ hiển thị tại đây.</div></Card>
    </main>
  );
}


