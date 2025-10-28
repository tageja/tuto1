import '../globals.css';
import { Card } from '../../components/ui/Card';

async function getData() {
  try {
    const base = process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL || '';
    const res = await fetch(`${base}/api/events`, { cache: 'no-store' });
    if (!res.ok) return { items: [], error: `HTTP ${res.status}` } as any;
    return (await res.json()) as { items: Array<any> };
  } catch (e: any) {
    return { items: [], error: e?.message || 'Network error' } as any;
  }
}

export default async function EventsPage() {
  const data = await getData();
  const items = Array.isArray(data.items) ? data.items : [];
  const error = (data as any).error as string | undefined;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Sự kiện</h1>
      <p className="mt-2 text-gray-600">Cuộc thi, hội thảo và hoạt động cộng đồng.</p>

      {error && <Card><div className="p-6 text-red-600">Lỗi tải dữ liệu: {error}</div></Card>}
      {!error && items.length === 0 && <Card><div className="p-6 text-gray-600">Chưa có sự kiện</div></Card>}

      <section className="grid gap-6 mt-6">
        {items.map((it) => (
          <Card key={it.id}><div className="p-6"><div className="text-lg font-medium">{it.title}</div><div className="text-sm text-gray-600 mt-1">{new Date(it.date).toLocaleString('vi-VN')}</div></div></Card>
        ))}
      </section>
    </main>
  );
}





