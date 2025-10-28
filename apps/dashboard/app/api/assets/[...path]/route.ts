import { NextRequest } from 'next/server';
import path from 'path';
import { promises as fsp } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: { path: string[] } }) {
  try {
    const segments = (ctx?.params?.path || []) as string[];
    if (!Array.isArray(segments) || segments.length === 0 || segments[0] !== 'images') {
      return new Response('Not Found', { status: 404 });
    }

    const filePath = path.resolve(process.cwd(), '..', '..', 'assets', ...segments);
    let data: Buffer;
    try {
      const stat = await fsp.stat(filePath);
      if (stat.isDirectory()) return new Response('Not Found', { status: 404 });
      data = await fsp.readFile(filePath);
    } catch {
      return new Response('Not Found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const type =
      ext === '.png' ? 'image/png' :
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.webp' ? 'image/webp' :
      'application/octet-stream';

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'no-store',
        'Content-Length': String(data.length),
      },
    });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}


