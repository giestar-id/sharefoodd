import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const { userId, data } = await req.json();
    const updated = await updateUserProfile(userId, data);
    return NextResponse.json({ user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
