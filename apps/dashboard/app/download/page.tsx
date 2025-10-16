import React from 'react';
import '../globals.css';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function DownloadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Tải ứng dụng</h1>
      <p className="mt-2 text-gray-600">Tải Tuto trên iOS và Android.</p>
      <Card>
        <div className="p-6 mt-6 flex gap-3">
          <Button>App Store</Button>
          <Button>Google Play</Button>
        </div>
      </Card>
    </main>
  );
}



