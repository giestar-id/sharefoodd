import { NextRequest, NextResponse } from 'next/server';
import { createFoodDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const food = await req.json();
    const created = await createFoodDb(food);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
