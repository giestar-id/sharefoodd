import { NextRequest, NextResponse } from 'next/server';
import { markAsTakenDb } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let userId: string | undefined;
    let requestId: string | undefined;
    try {
      const body = await req.json();
      userId = body?.userId;
      requestId = body?.requestId;
    } catch {}
    await markAsTakenDb(id, userId, requestId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
