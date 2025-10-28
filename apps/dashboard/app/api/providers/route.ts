import { NextRequest, NextResponse } from 'next/server';
import { searchProviders } from '../../../lib/api/providers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const params: any = {
      q: typeof body.q === 'string' ? body.q : undefined,
      subjects: Array.isArray(body.subjects) ? body.subjects.slice(0, 20) : undefined,
      modalities: Array.isArray(body.modalities) ? body.modalities.slice(0, 10) : undefined,
      priceMin: Number.isFinite(body.priceMin) ? Number(body.priceMin) : undefined,
      priceMax: Number.isFinite(body.priceMax) ? Number(body.priceMax) : undefined,
      lat: Number.isFinite(body.lat) ? Number(body.lat) : undefined,
      lng: Number.isFinite(body.lng) ? Number(body.lng) : undefined,
      radiusKm: Number.isFinite(body.radiusKm) ? Math.min(50, Math.max(1, Number(body.radiusKm))) : undefined,
      sort: typeof body.sort === 'string' ? body.sort : undefined,
    };
    const data = await searchProviders(params);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}






