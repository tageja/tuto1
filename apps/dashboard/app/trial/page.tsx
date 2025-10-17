import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';

export default function TrialPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Buổi học thử</h1>
      <p className="mt-2 text-gray-600">Trải nghiệm miễn phí trước khi cam kết.</p>
      <Card><div className="p-6 mt-6"><h2 className="text-xl font-medium">Cách đăng ký</h2><p className="mt-2 text-gray-600">Chọn giáo viên hỗ trợ buổi học thử và thời gian phù hợp.</p></div></Card>
    </main>
  );
}




