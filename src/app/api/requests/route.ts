import { NextRequest, NextResponse } from 'next/server';
import { createRequestDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const created = await createRequestDb(data);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
