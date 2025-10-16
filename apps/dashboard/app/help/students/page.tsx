import React from 'react';
import '../../globals.css';
import { Card } from '../../../components/ui/Card';

export default function HelpStudentsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Trợ giúp cho học sinh</h1>
      <p className="mt-2 text-gray-600">Hướng dẫn sử dụng và mẹo học tốt.</p>
      <Card><div className="p-6 mt-6">Xem câu hỏi thường gặp và hướng dẫn sử dụng.</div></Card>
    </main>
  );
}


