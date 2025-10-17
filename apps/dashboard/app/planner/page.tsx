import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function PlannerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Kế hoạch học</h1>
      <p className="mt-2 text-gray-600">Quản lý lịch học và mục tiêu.</p>
      <Card><div className="p-6 mt-6">Tích hợp lịch trên web sẽ cập nhật sau.</div></Card>
    </main>
  );
}



