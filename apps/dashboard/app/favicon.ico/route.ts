import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const root = process.cwd();
    const icoPath = path.resolve(root, '..', '..', 'assets', 'favicon.ico');
    const pngPath = path.resolve(root, '..', '..', 'assets', 'favicon.png');
    let filePath = '';
    let contentType = 'image/x-icon';
    if (fs.existsSync(icoPath)) {
      filePath = icoPath;
      contentType = 'image/x-icon';
    } else if (fs.existsSync(pngPath)) {
      filePath = pngPath;
      contentType = 'image/png';
    } else {
      return new Response('Not Found', { status: 404 });
    }
    const stream = fs.createReadStream(filePath);
    return new Response(stream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch (_e) {
    return new Response('Internal Server Error', { status: 500 });
  }
}


