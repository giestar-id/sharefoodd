import { NextRequest, NextResponse } from 'next/server';
import { getAllData } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || undefined;
    const data = await getAllData(userId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
