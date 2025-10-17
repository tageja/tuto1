import { NextRequest } from 'next/server';

// Server-side metrics aggregation via Firebase Functions proxy (public /tables endpoints)

const getFunctionsBase = (): string => {
  const override = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
  if (override && override.trim()) return override.replace(/\/$/, '');
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const region = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || 'asia-southeast1';
  return `https://${region}-${projectId}.cloudfunctions.net/api`;
};

async function listAll(table: string, query?: Record<string, string>): Promise<any[]> {
  const base = getFunctionsBase();
  let url = `${base}/tables/${encodeURIComponent(table)}`;
  const params = new URLSearchParams(query || {});
  let results: any[] = [];
  let offset: string | undefined = undefined;
  do {
    const u = offset ? `${url}?${params.toString()}&offset=${encodeURIComponent(offset)}` : (params.toString() ? `${url}?${params.toString()}` : url);
    const res = await fetch(u, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Functions ${res.status}`);
    const json = await res.json();
    results = results.concat(json.records || []);
    offset = json.offset as string | undefined;
  } while (offset);
  return results;
}

export async function GET(_req: NextRequest) {
  try {
    // Active students
    const students = await listAll('TutoStudents', { filterByFormula: "{Status} = 'Active'", pageSize: '1000' });

    // Weekly classes = bookings within last 7 days
    const bookings = await listAll('TutoBookings', {
      filterByFormula: "IS_AFTER({Date}, DATEADD(NOW(), -7, 'days'))",
      pageSize: '1000',
    });

    // Revenue MTD and Pending invoices from Payments
    const paymentsThisMonth = await listAll('TutoPayments', {
      filterByFormula: "AND(Status = 'Paid', DATETIME_FORMAT({Created At}, 'YYYY-MM') = DATETIME_FORMAT(NOW(), 'YYYY-MM'))",
      pageSize: '1000',
    });
    const pendingInvoices = await listAll('TutoPayments', { filterByFormula: "{Status} = 'Pending'", pageSize: '1000' });

    const revenueMTD = paymentsThisMonth.reduce((sum, r) => {
      const amt = Number(r?.fields?.Amount || 0);
      return sum + (isFinite(amt) ? amt : 0);
    }, 0);

    return Response.json({
      ok: true,
      metrics: {
        activeStudents: students.length,
        weeklyClasses: bookings.length,
        revenueMTD,
        pendingInvoices: pendingInvoices.length,
      },
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'metrics_failed' }, { status: 500 });
  }
}








