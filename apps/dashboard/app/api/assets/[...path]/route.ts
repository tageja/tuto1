import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Serve static assets from the monorepo root assets/images directory
// Example: /api/assets/images/tuto-logo.png -> ../../assets/images/tuto-logo.png

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try {
    const params = await ctx.params;
    const segments = (params?.path || []) as string[];
    // Only allow access under images/ to avoid arbitrary FS reads
    if (segments[0] !== 'images') {
      return new Response('Not Found', { status: 404 });
    }

    const filePath = path.resolve(process.cwd(), '..', '..', 'assets', ...segments);
    if (!fs.existsSync(filePath)) {
      return new Response('Not Found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return new Response('Not Found', { status: 404 });
    }

    const stream = fs.createReadStream(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type =
      ext === '.png' ? 'image/png' :
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.webp' ? 'image/webp' :
      'application/octet-stream';

    return new Response(stream as any, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (_e) {
    return new Response('Internal Server Error', { status: 500 });
  }
}





