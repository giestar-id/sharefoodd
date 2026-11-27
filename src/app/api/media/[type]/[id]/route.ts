import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function dataUrlToResponse(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
  }
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;

    if (type === 'food') {
      const img = await prisma.foodImage.findFirst({
        where: { foodId: id },
        orderBy: { sortOrder: 'asc' },
        select: { path: true },
      });
      if (!img?.path) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }
      if (img.path.startsWith('data:image/')) {
        return dataUrlToResponse(img.path);
      }
      return NextResponse.redirect(img.path);
    }

    if (type === 'qris') {
      const food = await prisma.food.findUnique({
        where: { id },
        select: { storageNotes: true },
      });
      if (!food?.storageNotes) {
        return NextResponse.json({ error: 'QRIS not found' }, { status: 404 });
      }
      try {
        const extra = JSON.parse(food.storageNotes);
        if (typeof extra?.qrisUrl === 'string' && extra.qrisUrl.startsWith('data:image/')) {
          return dataUrlToResponse(extra.qrisUrl);
        }
        if (typeof extra?.qrisUrl === 'string' && extra.qrisUrl.startsWith('http')) {
          return NextResponse.redirect(extra.qrisUrl);
        }
      } catch {}
      return NextResponse.json({ error: 'QRIS not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
