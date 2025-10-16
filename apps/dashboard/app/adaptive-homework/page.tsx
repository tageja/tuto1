import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function AdaptiveHomeworkPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Bài tập thích ứng</h1>
      <p className="mt-2 text-gray-600">Nội dung cá nhân hóa theo mức độ.</p>
      <Card><div className="p-6 mt-6">Tính năng đang được tích hợp trên web.</div></Card>
    </main>
  );
}


