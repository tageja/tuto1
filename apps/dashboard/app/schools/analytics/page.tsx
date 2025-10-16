import '../../globals.css';
import { Card } from '../../../components/ui/Card';

async function getData() {
  const base = process.env.NEXT_PUBLIC_DASHBOARD_BASE_URL || '';
  try {
    const res = await fetch(`${base}/api/schools/analytics`, { cache: 'no-store' });
    if (!res.ok) return { kpis: [], error: `HTTP ${res.status}` } as any;
    return (await res.json()) as { kpis: Array<{ label: string; value: string }> };
  } catch (e: any) {
    return { kpis: [], error: e?.message || 'Network error' } as any;
  }
}

export default async function SchoolsAnalyticsPage() {
  const data = await getData();
  const kpis = Array.isArray(data.kpis) ? data.kpis : [];
  const error = (data as any).error as string | undefined;
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Phân tích</h1>
      <p className="mt-2 text-gray-600">KPI, báo cáo và dashboard theo thời gian thực.</p>
      {error && <Card><div className="p-6 text-red-600">Lỗi: {error}</div></Card>}
      {!error && kpis.length === 0 && <Card><div className="p-6 text-gray-600">Chưa có dữ liệu</div></Card>}
      <section className="grid gap-6 md:grid-cols-2 mt-6">
        {kpis.map((k) => (
          <Card key={k.label}><div className="p-6"><div className="text-3xl font-semibold">{k.value}</div><div className="mt-1 text-gray-600">{k.label}</div></div></Card>
        ))}
      </section>
    </main>
  );
}


